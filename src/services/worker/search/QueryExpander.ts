/**
 * QueryExpander - Query expansion for improved RAG recall
 *
 * Expands user queries with:
 * 1. Keyword extraction (Chinese + English)
 * 2. Technical synonyms (code-specific terms)
 * 3. Cross-lingual mapping (中英对照)
 *
 * Example:
 *   Input: "budget 分配逻辑"
 *   Output: ["budget 分配逻辑", "budget", "分配", "allocation", "distribute"]
 */

import { logger } from '../../../utils/logger.js';

// Technical term mappings (English ↔ Chinese + synonyms)
const TECH_SYNONYMS: Record<string, string[]> = {
  // Memory/Cache related
  'budget': ['allocation', 'quota', 'limit', '预算', '分配', '配额'],
  'cache': ['缓存', 'buffer', 'memory', '内存'],
  'memory': ['内存', 'ram', 'heap', 'stack', '存储'],
  'allocation': ['分配', 'budget', 'assign', 'distribute', '分发'],

  // Attention/Transformer related
  'attention': ['注意力', 'self-attention', 'multi-head', 'attn'],
  'layer': ['层', 'block', 'module', '模块'],
  'head': ['头', 'attention head', '注意力头'],
  'token': ['词元', 'word', 'subword', '词'],
  'embedding': ['嵌入', 'vector', 'representation', '向量'],

  // KV Cache specific
  'kv': ['key-value', 'kv-cache', 'kvcache'],
  'eviction': ['驱逐', 'evict', 'remove', 'prune', '剪枝'],
  'compression': ['压缩', 'compress', 'quantize', '量化'],

  // Code related
  'function': ['函数', 'method', 'func', 'def', '方法'],
  'class': ['类', 'object', 'instance', '对象'],
  'variable': ['变量', 'var', 'param', 'parameter', '参数'],
  'error': ['错误', 'bug', 'exception', 'fault', '异常', '问题'],
  'fix': ['修复', 'repair', 'patch', 'resolve', '解决'],
  'refactor': ['重构', 'restructure', 'reorganize', '优化'],
  'test': ['测试', 'unit test', 'spec', '单元测试'],
  'config': ['配置', 'configuration', 'settings', '设置'],
  'api': ['接口', 'endpoint', 'interface', '端点'],
  'database': ['数据库', 'db', 'sql', 'storage'],
  'query': ['查询', 'search', 'find', 'lookup', '搜索'],
  'index': ['索引', 'idx', 'key'],

  // Chinese to English mappings
  '预算': ['budget', 'allocation', 'quota'],
  '分配': ['allocation', 'assign', 'distribute', 'budget'],
  '注意力': ['attention', 'attn'],
  '层': ['layer', 'block'],
  '缓存': ['cache', 'buffer'],
  '内存': ['memory', 'ram'],
  '压缩': ['compression', 'compress'],
  '驱逐': ['eviction', 'evict', 'prune'],
  '函数': ['function', 'method', 'func'],
  '类': ['class', 'object'],
  '变量': ['variable', 'param'],
  '错误': ['error', 'bug', 'exception'],
  '修复': ['fix', 'repair', 'patch'],
  '重构': ['refactor', 'restructure'],
  '测试': ['test', 'spec'],
  '配置': ['config', 'settings'],
  '接口': ['api', 'interface'],
  '数据库': ['database', 'db'],
  '查询': ['query', 'search'],
  '索引': ['index', 'key'],
};

// Common stopwords to filter out
const STOPWORDS = new Set([
  // English
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'between',
  'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither',
  'not', 'only', 'own', 'same', 'than', 'too', 'very', 'just',
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
  'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
  'am', 'been', 'being', 'how', 'when', 'where', 'why', 'all', 'each',
  // Chinese
  '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一',
  '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着',
  '没有', '看', '好', '自己', '这', '那', '什么', '怎么', '如何',
]);

export interface ExpandedQuery {
  original: string;
  keywords: string[];
  expanded: string[];
  allTerms: string[];
}

export class QueryExpander {
  /**
   * Expand a query into multiple search terms
   */
  expand(query: string): ExpandedQuery {
    const original = query.trim();

    // Extract keywords
    const keywords = this.extractKeywords(original);

    // Expand with synonyms
    const expanded = this.expandWithSynonyms(keywords);

    // Combine all unique terms
    const allTerms = Array.from(new Set([original, ...keywords, ...expanded]));

    logger.debug('QUERY_EXPANDER', 'Query expanded', {
      original,
      keywordCount: keywords.length,
      expandedCount: expanded.length,
      totalTerms: allTerms.length
    });

    return {
      original,
      keywords,
      expanded,
      allTerms
    };
  }

  /**
   * Get expanded queries for multi-query retrieval
   * Returns the original query plus key expansion queries
   */
  getSearchQueries(query: string, maxQueries: number = 3): string[] {
    const { original, keywords, expanded } = this.expand(query);

    const queries: string[] = [original];

    // Add keyword-based queries
    if (keywords.length > 0) {
      // Join important keywords into a query
      const keywordQuery = keywords.slice(0, 5).join(' ');
      if (keywordQuery !== original && keywordQuery.length > 2) {
        queries.push(keywordQuery);
      }
    }

    // Add expansion-based query (synonyms)
    if (expanded.length > 0) {
      const expansionQuery = expanded.slice(0, 5).join(' ');
      if (!queries.includes(expansionQuery) && expansionQuery.length > 2) {
        queries.push(expansionQuery);
      }
    }

    return queries.slice(0, maxQueries);
  }

  /**
   * Extract keywords from query
   * Handles both Chinese and English text
   */
  private extractKeywords(text: string): string[] {
    const keywords: string[] = [];

    // Extract English words (including technical terms with hyphens/underscores)
    const englishWords = text.match(/[a-zA-Z][a-zA-Z0-9_-]*/g) || [];
    for (const word of englishWords) {
      const lower = word.toLowerCase();
      if (!STOPWORDS.has(lower) && lower.length > 1) {
        keywords.push(lower);
      }
    }

    // Extract Chinese characters/words (simple segmentation by common patterns)
    const chineseText = text.replace(/[a-zA-Z0-9_\-\s]+/g, ' ');
    const chineseChars = chineseText.match(/[\u4e00-\u9fa5]+/g) || [];

    for (const chars of chineseChars) {
      // Add whole phrase if short enough
      if (chars.length <= 4 && !this.isStopword(chars)) {
        keywords.push(chars);
      }

      // Also extract 2-char segments for longer phrases
      if (chars.length > 2) {
        for (let i = 0; i < chars.length - 1; i++) {
          const bigram = chars.substring(i, i + 2);
          if (!this.isStopword(bigram)) {
            keywords.push(bigram);
          }
        }
      }
    }

    // Deduplicate
    return Array.from(new Set(keywords));
  }

  /**
   * Expand keywords with synonyms
   */
  private expandWithSynonyms(keywords: string[]): string[] {
    const expanded: string[] = [];

    for (const keyword of keywords) {
      const lower = keyword.toLowerCase();

      // Check direct mapping
      if (TECH_SYNONYMS[lower]) {
        expanded.push(...TECH_SYNONYMS[lower]);
      }

      // Check if keyword appears in any synonym list
      for (const [term, synonyms] of Object.entries(TECH_SYNONYMS)) {
        if (synonyms.includes(lower) && !expanded.includes(term)) {
          expanded.push(term);
        }
      }
    }

    // Deduplicate and remove original keywords
    const keywordSet = new Set(keywords.map(k => k.toLowerCase()));
    return Array.from(new Set(expanded)).filter(e => !keywordSet.has(e.toLowerCase()));
  }

  /**
   * Check if a term is a stopword
   */
  private isStopword(term: string): boolean {
    return STOPWORDS.has(term.toLowerCase()) || STOPWORDS.has(term);
  }
}

// Singleton instance
let _instance: QueryExpander | null = null;

export function getQueryExpander(): QueryExpander {
  if (!_instance) {
    _instance = new QueryExpander();
  }
  return _instance;
}
