# BGE-M3 Embedding 迁移指南

本指南说明如何将 claude-mem 的向量检索从默认的 `all-MiniLM-L6-v2` (384维) 升级到 `BGE-M3` (1024维)。

## 为什么升级？

| 对比项 | 当前 (default) | 升级后 (BGE-M3) |
|--------|---------------|-----------------|
| 模型 | all-MiniLM-L6-v2 | BAAI/bge-m3 |
| 向量维度 | 384 | 1024 |
| 语言支持 | 主要英语 | 100+ 语言 |
| 语义理解 | 基础 | 更精准 |
| 内存需求 | ~500MB | ~2-3GB |

## 前置要求

1. **Python 3.10+** (推荐 3.13)
2. **~3GB 可用内存** (模型加载)
3. **已安装 claude-mem**

## 安装步骤

### 步骤 1: 创建虚拟环境并安装依赖

macOS/Linux 使用系统保护，需要创建虚拟环境：

```bash
# 进入 claude-mem 目录
cd ~/path/to/claude-mem

# 创建虚拟环境
python3 -m venv .venv

# 激活虚拟环境
source .venv/bin/activate   # macOS/Linux
# 或 .venv\Scripts\activate  # Windows

# 安装依赖 (首次下载模型约 1GB，需要几分钟)
pip install mcp FlagEmbedding torch

# 验证安装
python -c "from FlagEmbedding import BGEM3FlagModel; print('✓ FlagEmbedding OK')"
python -c "import mcp; print('✓ MCP OK')"

# 退出虚拟环境 (可选，迁移脚本会自动使用)
deactivate
```

> **注意**: claude-mem 会自动检测 `.venv` 目录并使用其中的 Python

### 步骤 2: 停止 worker 服务

```bash
cd ~/path/to/claude-mem
npm run worker:stop
```

### 步骤 3: 检查当前状态

```bash
bun scripts/migrate-embeddings.ts --status
```

输出示例：
```
=== Embedding Migration Status ===

Current Configuration:
  CLAUDE_MEM_EMBEDDING_MODEL: default
  CLAUDE_MEM_EMBEDDING_MCP_ENABLED: false

Vector Database:
  Path: ~/.claude-mem/vector-db
  Exists: true
  Size: 12.34 MB

Data to Migrate:
  Observations: 150
  Session Summaries: 25
  User Prompts: 200
  Estimated Documents: ~750

Recommendation:
  → Run --migrate to switch to BGE-M3 (1024d) embeddings
  → Estimated time: ~1 minutes
```

### 步骤 4: 预览迁移

```bash
bun scripts/migrate-embeddings.ts --dry-run
```

### 步骤 5: 执行迁移

```bash
bun scripts/migrate-embeddings.ts --migrate
```

迁移过程：
1. 备份现有向量数据库到 `~/.claude-mem/vector-db-backup/`
2. 更新配置文件启用 BGE-M3
3. 清空旧向量数据库
4. 使用 BGE-M3 重新计算所有向量

### 步骤 6: 重启 worker

```bash
npm run worker:restart
```

### 步骤 7: 验证

```bash
# 检查日志确认使用了 BGE-M3
tail -20 ~/.claude-mem/logs/worker-$(date +%Y-%m-%d).log | grep -i "bge\|embedding"
```

应该看到类似：
```
[CHROMA_SYNC] Connected to Embedding MCP server (BGE-M3)
[CHROMA_SYNC] Using BGE-M3 embeddings { count: 10, dimensions: 1024 }
```

## 回滚

如果遇到问题，可以回滚到原来的配置：

```bash
# 停止 worker
npm run worker:stop

# 回滚
bun scripts/migrate-embeddings.ts --rollback

# 重启
npm run worker:restart
```

## 配置说明

迁移后，`~/.claude-mem/settings.json` 会包含：

```json
{
  "CLAUDE_MEM_EMBEDDING_MODEL": "bge-m3",
  "CLAUDE_MEM_EMBEDDING_MCP_ENABLED": "true"
}
```

### 配置项

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `CLAUDE_MEM_EMBEDDING_MODEL` | `default` / `bge-m3` | 使用的 embedding 模型 |
| `CLAUDE_MEM_EMBEDDING_MCP_ENABLED` | `true` / `false` | 是否启用自定义 embedding 服务 |

## 故障排除

### 问题: Embedding MCP server 连接失败

**症状**: 日志显示 "Failed to connect to Embedding MCP server, falling back to default embeddings"

**解决方案**:
1. 确认 Python 依赖已安装：
   ```bash
   pip list | grep -E "mcp|FlagEmbedding"
   ```
2. 手动测试 embedding server：
   ```bash
   cd claude-mem/embedding-mcp-server
   python server.py
   # 应该启动不报错
   ```

### 问题: 内存不足

**症状**: 进程被 OOM killer 终止

**解决方案**:
- BGE-M3 需要约 2-3GB 内存
- 确保系统有足够可用内存
- 可以在 CPU 模式下运行（较慢但内存占用更稳定）

### 问题: 迁移中断

**症状**: 迁移脚本执行一半失败

**解决方案**:
```bash
# 回滚到备份
bun scripts/migrate-embeddings.ts --rollback

# 检查问题后重新执行
bun scripts/migrate-embeddings.ts --migrate
```

## 性能影响

| 操作 | 默认 (384d) | BGE-M3 (1024d) |
|------|-------------|----------------|
| 首次启动 | ~1秒 | ~5-10秒 (模型加载) |
| 单次 embedding | ~5ms | ~30ms |
| 批量 embedding (32条) | ~20ms | ~100ms |
| 向量存储大小 | ~1.2KB/doc | ~3KB/doc |
| 搜索延迟 | ~10ms | ~15ms |

## 文件变更

迁移涉及以下文件：

```
claude-mem/
├── embedding-mcp-server/        # 新增
│   ├── server.py               # BGE-M3 MCP 服务
│   ├── pyproject.toml          # Python 依赖
│   └── README.md               # 使用说明
├── scripts/
│   └── migrate-embeddings.ts   # 新增：迁移脚本
├── src/
│   ├── shared/
│   │   └── SettingsDefaultsManager.ts  # 修改：新增配置项
│   └── services/
│       └── sync/
│           └── ChromaSync.ts   # 修改：集成 embedding MCP
└── docs/
    └── BGE-M3-MIGRATION-GUIDE.md  # 新增：本文档
```
