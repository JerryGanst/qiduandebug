# claude-mem 技术路线图

> 完整的 RAG 系统架构分析，包含原方案与优化改进对比

---

## 系统架构总览

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         claude-mem RAG Pipeline                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────────┐  │
│  │  Hook    │───▶│  Parser  │───▶│  Store   │───▶│  ChromaSync      │  │
│  │  采集层   │    │  处理层   │    │  存储层   │    │  Embedding层     │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────────────┘  │
│                                                           │              │
│                                                           ▼              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        Search Layer 检索层                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │  │
│  │  │   Chroma    │  │   SQLite    │  │        Hybrid           │  │  │
│  │  │  语义搜索    │  │  过滤搜索    │  │       混合搜索           │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      Ranking Layer 排序层                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │  │
│  │  │ TimeDecay   │  │   Merger    │  │     ResultFormatter     │  │  │
│  │  │  时间衰减    │  │  结果合并    │  │       结果格式化          │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. 数据采集层 (Hook Layer)

### 核心文件
- `src/utils/transcript-parser.ts` - JSONL 转录解析
- `src/hooks/hook-response.ts` - Hook 集成
- `cursor-hooks/` - Cursor 编辑器集成

### 工作原理
```
Claude Code 对话
       │
       ▼
┌─────────────────┐
│  JSONL 转录日志  │  ~/.claude/sessions/*.jsonl
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ TranscriptParser │
│  - 解析消息类型   │
│  - 提取工具调用   │
│  - 提取 usage    │
└────────┬────────┘
         │
         ▼
   TranscriptEntry[]
```

### 消息类型
| 类型 | 说明 |
|------|------|
| `UserTranscriptEntry` | 用户消息 + 工具结果 |
| `AssistantTranscriptEntry` | Claude 响应（含 token 统计） |
| `SummaryTranscriptEntry` | 手动生成的摘要 |
| `SystemTranscriptEntry` | 系统事件 |

### 当前状态
✅ 无需改进，Hook 系统稳定

---

## 2. 数据处理层 (Parser Layer)

### 核心文件
- `src/sdk/parser.ts` - XML 观察/总结解析
- `src/sdk/prompts.ts` - Prompt 模板

### 工作原理
```
Claude 响应文本
       │
       ▼
┌─────────────────────────┐
│    ObservationParser     │
│  - 提取 <observation>    │
│  - 验证字段完整性         │
│  - 清理概念列表          │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│    ObservationRecord     │
│  type, title, subtitle   │
│  facts[], narrative      │
│  concepts[], files_*     │
└─────────────────────────┘
```

### 观察类型
| 类型 | 说明 |
|------|------|
| `decision` | 架构/技术决策 |
| `bugfix` | Bug 修复 |
| `feature` | 新功能 |
| `refactor` | 重构 |
| `discovery` | 新发现 |
| `change` | 其他变更 |

### 当前状态
✅ 无需改进，解析逻辑完善

---

## 3. 存储层 (Storage Layer)

### 核心文件
- `src/services/sqlite/Database.ts` - 数据库配置
- `src/services/sqlite/observations/store.ts` - 观察存储
- `src/services/sqlite/summaries/store.ts` - 总结存储
- `src/services/sqlite/migrations/` - 迁移脚本

### 数据库配置
```sql
-- 高性能 SQLite 配置
PRAGMA journal_mode = WAL;           -- 并发读写
PRAGMA synchronous = NORMAL;         -- 平衡性能与安全
PRAGMA foreign_keys = ON;            -- 外键约束
PRAGMA temp_store = memory;          -- 临时表放内存
PRAGMA mmap_size = 268435456;        -- 256MB 内存映射
PRAGMA cache_size = 10000;           -- 10000 页缓存
```

### 核心表结构
```sql
-- 观察表
observations (
  id INTEGER PRIMARY KEY,
  memory_session_id TEXT,
  project TEXT,
  type TEXT,
  title TEXT,
  subtitle TEXT,
  facts JSON,
  narrative TEXT,
  concepts JSON,
  files_read JSON,
  files_modified JSON,
  prompt_number INTEGER,
  discovery_tokens INTEGER,
  created_at TEXT,
  created_at_epoch INTEGER
)

-- 总结表
session_summaries (
  id, memory_session_id, project,
  request, investigated, learned,
  completed, next_steps, notes,
  created_at, created_at_epoch
)

-- 用户提示表
user_prompts (
  id, content_session_id,
  prompt_number, prompt_text,
  created_at, created_at_epoch
)
```

### 当前状态
✅ 无需改进，SQLite 配置已优化

---

## 4. Embedding 层 (Vectorization)

### 核心文件
- `embedding-mcp-server/server.py` - BGE-M3 MCP 服务器
- `src/services/sync/ChromaSync.ts` - 向量同步

### ⚠️ 原方案
```python
# 原方案：使用 Chroma 默认的 all-MiniLM-L6-v2
# 问题：
#   - 维度 384，表达能力有限
#   - 英文优先，中文支持差
#   - 最大 256 token
```

### ✅ 改进方案 (已实施)
```python
# 新方案：BGE-M3 (BAAI/bge-m3)
from FlagEmbedding import BGEM3FlagModel

model = BGEM3FlagModel(
    'BAAI/bge-m3',
    use_fp16=True,          # FP16 加速
    device='mps'            # Apple Silicon
)

# 特性：
#   - 维度 1024，更强表达能力
#   - 100+ 语言原生支持（含中文）
#   - 最大 8192 token
#   - 密集向量模式（Chroma 兼容）
```

### 改进原因
| 对比项 | all-MiniLM-L6-v2 | BGE-M3 |
|--------|------------------|--------|
| 维度 | 384 | **1024** |
| 中文支持 | ❌ 差 | ✅ 原生 |
| 最大长度 | 256 token | **8192 token** |
| 多语言 | 有限 | **100+ 语言** |

---

## 5. 检索层 (Search Layer)

### 核心文件
- `src/services/worker/search/SearchOrchestrator.ts` - 策略协调
- `src/services/worker/search/strategies/ChromaSearchStrategy.ts`
- `src/services/worker/search/strategies/SQLiteSearchStrategy.ts`
- `src/services/worker/search/strategies/HybridSearchStrategy.ts`

### 搜索策略路由
```
用户查询
    │
    ▼
┌──────────────────────┐
│  SearchOrchestrator  │
└──────────┬───────────┘
           │
     ┌─────┴─────┬──────────────┐
     │           │              │
     ▼           ▼              ▼
┌─────────┐ ┌─────────┐ ┌──────────────┐
│ Chroma  │ │ SQLite  │ │   Hybrid     │
│ 语义搜索 │ │ 过滤搜索 │ │  混合搜索    │
└─────────┘ └─────────┘ └──────────────┘
     │           │              │
     │      有查询文本?          │
     │      ├─ Yes → Chroma     │
     │      └─ No → SQLite      │
     │           │              │
     └───────────┴──────────────┘
```

### ⚠️ 原方案
```typescript
// 原方案：单查询检索
async search(query: string) {
  return chroma.query({
    queryTexts: [query],  // 单个查询
    nResults: 20
  });
}
// 问题：召回率低，错过相关文档
```

### ✅ 改进方案：Query Expansion (已实施)

**文件**: `src/services/worker/search/QueryExpander.ts`

```typescript
// 新方案：多路召回 + 查询扩展
class QueryExpander {
  // 1. 提取关键词（中英双语）
  extractKeywords(query: string): string[] {
    // 中文分词 + 英文分词
    // 停词过滤
  }

  // 2. 技术同义词扩展
  expandWithSynonyms(keywords: string[]): string[] {
    // budget → [allocation, quota, 预算, 配额]
    // cache → [缓存, buffer, memory]
    // error → [错误, bug, exception, 异常]
  }

  // 3. 生成扩展查询
  getSearchQueries(original: string): string[] {
    return [original, ...expandedQueries];  // 多路召回
  }
}
```

**技术同义词映射**:
```typescript
const TECH_SYNONYMS = {
  'api': ['接口', 'interface', 'endpoint', 'rest', 'graphql'],
  'database': ['数据库', 'db', 'storage', 'persistence'],
  'cache': ['缓存', 'buffer', 'memory', 'redis'],
  'error': ['错误', 'bug', 'exception', 'fault', '异常'],
  'auth': ['认证', 'authentication', 'authorization', 'login'],
  // ... 更多映射
};
```

### 改进原因
| 对比项 | 单查询 | 查询扩展 |
|--------|--------|----------|
| 查询数 | 1 | 3-5 |
| 召回率 | 低 | **高** |
| 中英混搜 | ❌ | ✅ |
| 同义词 | ❌ | ✅ |

---

## 6. 排序层 (Ranking Layer)

### 核心文件
- `src/services/worker/search/TimeDecay.ts` - 时间衰减
- `src/services/worker/SearchManager.ts` - 结果合并
- `src/services/worker/search/ResultFormatter.ts` - 格式化

### ⚠️ 原方案
```typescript
// 原方案：硬截断 + 简单排序
const RECENCY_WINDOW_DAYS = 90;

function filterByRecency(results) {
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  return results.filter(r => r.created_at_epoch >= cutoff);
  // 问题：
  //   - 90天前的记忆完全丢失
  //   - 第89天和第1天权重相同
  //   - 无法平衡新旧记忆
}
```

### ✅ 改进方案：对数时间衰减 (已实施)

**文件**: `src/services/worker/search/TimeDecay.ts`

```typescript
// 新方案：乘法式时间衰减 + 对数保护
interface TimeDecayConfig {
  baseHalfLife: 60,        // 基础半衰期（天）
  boostMax: 0.5,           // 最大保护提升
  curveFactor: 30,         // 曲线形状因子
  protectionDuration: 180, // 保护持续时间（天）
  minWeight: 0.01          // 最小权重下限
}

// 公式：Score(t) = BaseDecay(t) × (1 + BoostFactor(t))
//
// BaseDecay(t) = e^(-t/τ)
//   指数衰减，τ=60 天半衰期
//
// BoostFactor(t) = B_max × max(0, 1 - ln(1+t/k) / ln(1+T/k))
//   对数保护常数，"前慢后快"曲线
```

**衰减曲线**:
```
权重
1.0 ┤████████████
    │            ████
0.8 ┤                ████
    │                    ███
0.6 ┤                       ███
    │                          ██
0.4 ┤                            ██
    │                              ██
0.2 ┤                                ██
    │                                  ████
0.0 ┼────────────────────────────────────────▶ 天数
    0   30   60   90   120   150   180   365
```

**实际权重表**:
| 天数 | BaseDecay | Boost | Final |
|------|-----------|-------|-------|
| 0 | 1.0000 | 0.5000 | **1.0000** |
| 30 | 0.7071 | 0.3219 | **0.9347** |
| 60 | 0.5000 | 0.2177 | **0.6089** |
| 90 | 0.3536 | 0.1438 | **0.4044** |
| 180 | 0.1250 | 0.0000 | **0.1250** |
| 365 | 0.0147 | 0.0000 | **0.0147** |

**应用方式**:
```typescript
// 在 ChromaSearchStrategy.mergeChromaResults() 中应用
applyToDistance(distance: number, createdAtEpoch: number): number {
  const weight = this.calcFromEpoch(createdAtEpoch);
  return distance / weight;
  // 较旧文档 → 较低权重 → 较大调整距离 → 较低排名
}
```

### 改进原因
| 对比项 | 硬截断 | 对数衰减 |
|--------|--------|----------|
| 90天边界 | 完全丢失 | **40% 权重** |
| 权重变化 | 阶跃函数 | **平滑曲线** |
| 新旧平衡 | ❌ | ✅ |
| 最小保底 | ❌ | ✅ (1%) |
| 可配置性 | ❌ | ✅ |

---

## 7. 结果合并与去重

### 核心文件
- `src/services/worker/SearchManager.ts`
- `src/services/worker/search/strategies/ChromaSearchStrategy.ts`

### 合并流程
```
Query Expansion
      │
      ▼
┌─────────────────────────────────────┐
│  多路 Chroma 查询 (3-5 个变体)       │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  mergeChromaResults()               │
│  1. 按 sqlite_id 去重               │
│  2. 保留最佳距离                     │
│  3. 应用时间衰减                     │
│  4. 按 adjustedDistance 排序        │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  SQLite 水化                        │
│  - 从 Chroma ID 获取完整记录         │
│  - 补充 facts, narrative 等字段     │
└─────────────────────────────────────┘
```

---

## 8. 数据流完整路径

```
┌─────────────────────────────────────────────────────────────────────┐
│                          数据写入流程                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Claude Code 对话                                                    │
│        │                                                             │
│        ▼                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │    Hook     │───▶│   Parser    │───▶│   SQLite    │             │
│  │  捕获转录    │    │  提取观察    │    │   存储      │             │
│  └─────────────┘    └─────────────┘    └──────┬──────┘             │
│                                               │                      │
│                                               ▼                      │
│                                        ┌─────────────┐              │
│                                        │ ChromaSync  │              │
│                                        │  ┌───────┐  │              │
│                                        │  │BGE-M3 │  │              │
│                                        │  └───────┘  │              │
│                                        └──────┬──────┘              │
│                                               │                      │
│                                               ▼                      │
│                                        ┌─────────────┐              │
│                                        │  ChromaDB   │              │
│                                        │  向量存储    │              │
│                                        └─────────────┘              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          数据查询流程                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  用户查询: "budget 分配策略"                                         │
│        │                                                             │
│        ▼                                                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     QueryExpander                             │  │
│  │  原始: "budget 分配策略"                                       │  │
│  │  扩展: ["budget 分配", "allocation quota", "预算 配额"]        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│        │                                                             │
│        ▼                                                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  ChromaSearchStrategy                         │  │
│  │  - 3 个查询并行发送到 Chroma                                   │  │
│  │  - BGE-M3 编码查询向量                                         │  │
│  │  - 返回 Top-K 相似结果                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│        │                                                             │
│        ▼                                                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   mergeChromaResults                          │  │
│  │  - 去重 (by sqlite_id)                                        │  │
│  │  - 时间衰减: adjustedDist = distance / weight                 │  │
│  │  - 排序 (by adjustedDistance ASC)                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│        │                                                             │
│        ▼                                                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     SQLite Hydration                          │  │
│  │  - 从 sqlite_id 获取完整记录                                   │  │
│  │  - 返回 ObservationRecord[]                                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│        │                                                             │
│        ▼                                                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    ResultFormatter                            │  │
│  │  - 按日期分组                                                  │  │
│  │  - 生成 Markdown 输出                                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. 改进总结

| 环节 | 原方案 | 改进方案 | 状态 |
|------|--------|----------|------|
| **Embedding** | all-MiniLM-L6-v2 (384d) | BGE-M3 (1024d, 多语言) | ✅ 已完成 |
| **检索** | 单查询 | Query Expansion 多路召回 | ✅ 已完成 |
| **时间衰减** | 90天硬截断 | 对数保护 + 乘法衰减 | ✅ 已完成 |
| **Rerank** | 无 | 待评估 | ⏳ 待定 |
| **访问时间** | 无 | 计划中 | 📋 TODO |
| **类型衰减** | 统一衰减 | 差异化衰减 | 📋 TODO |

---

## 10. 未来优化方向

### 10.1 最后访问时间因素
```typescript
// 方案：结合创建时间和最后访问时间
interface AccessTimeConfig {
  accessBoostFactor: 0.3,    // 访问提升系数
  accessDecayDays: 30        // 访问衰减周期
}

// 公式：
// accessBoost = accessFactor × e^(-(now - lastAccess) / accessDecayDays)
// finalWeight = timeDecay × (1 + accessBoost)
```

### 10.2 记忆类型差异化衰减
```typescript
// 方案：不同类型使用不同衰减参数
const TYPE_DECAY_CONFIGS = {
  decision: { baseHalfLife: 120 },  // 决策类衰减慢
  bugfix:   { baseHalfLife: 60 },   // Bug 修复正常衰减
  feature:  { baseHalfLife: 90 },   // 功能类中等衰减
  refactor: { baseHalfLife: 45 },   // 重构类衰减快
};
```

### 10.3 Rerank 层（待评估）
```typescript
// 方案：使用 Cross-Encoder 重排序
// 优点：更精确的相关性判断
// 缺点：增加延迟、可能对短文本效果有限
// 状态：需要 A/B 测试评估
```

---

## 11. 关键配置参数

```typescript
// Embedding
EMBEDDING_MODEL = 'BAAI/bge-m3'
EMBEDDING_DIMENSIONS = 1024
MAX_TOKENS = 8192

// 搜索
DEFAULT_LIMIT = 20
CHROMA_BATCH_SIZE = 100

// 时间衰减
TIME_DECAY = {
  baseHalfLife: 60,
  boostMax: 0.5,
  curveFactor: 30,
  protectionDuration: 180,
  minWeight: 0.01
}

// SQLite
PRAGMA = {
  journal_mode: 'WAL',
  synchronous: 'NORMAL',
  mmap_size: 256MB,
  cache_size: 10000
}
```

---

## 12. 文件索引

| 层级 | 核心文件 | 职责 |
|------|---------|------|
| Hook | `src/hooks/hook-response.ts` | 对话捕获 |
| Parser | `src/sdk/parser.ts` | XML 解析 |
| Storage | `src/services/sqlite/Database.ts` | 数据库配置 |
| Storage | `src/services/sqlite/observations/store.ts` | 观察存储 |
| Embedding | `embedding-mcp-server/server.py` | BGE-M3 服务 |
| Embedding | `src/services/sync/ChromaSync.ts` | 向量同步 |
| Search | `src/services/worker/search/QueryExpander.ts` | 查询扩展 ⭐ |
| Search | `src/services/worker/search/strategies/ChromaSearchStrategy.ts` | 语义搜索 |
| Ranking | `src/services/worker/search/TimeDecay.ts` | 时间衰减 ⭐ |
| Format | `src/services/worker/search/ResultFormatter.ts` | 结果格式化 |

⭐ = 我们的改进点
