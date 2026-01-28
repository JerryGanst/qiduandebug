/**
 * ChromaSearchStrategy - Vector-based semantic search via Chroma
 *
 * This strategy handles semantic search queries using ChromaDB:
 * 1. Query Chroma for semantically similar documents
 * 2. Filter by recency (90-day window)
 * 3. Categorize by document type
 * 4. Hydrate from SQLite
 *
 * Used when: Query text is provided and Chroma is available
 */

import { BaseSearchStrategy, SearchStrategy } from './SearchStrategy.js';
import {
  StrategySearchOptions,
  StrategySearchResult,
  SEARCH_CONSTANTS,
  ChromaMetadata,
  ObservationSearchResult,
  SessionSummarySearchResult,
  UserPromptSearchResult
} from '../types.js';
import { ChromaSync } from '../../../sync/ChromaSync.js';
import { SessionStore } from '../../../sqlite/SessionStore.js';
import { logger } from '../../../../utils/logger.js';
import { getQueryExpander } from '../QueryExpander.js';
import { getTimeDecay } from '../TimeDecay.js';

export class ChromaSearchStrategy extends BaseSearchStrategy implements SearchStrategy {
  readonly name = 'chroma';

  constructor(
    private chromaSync: ChromaSync,
    private sessionStore: SessionStore
  ) {
    super();
  }

  canHandle(options: StrategySearchOptions): boolean {
    // Can handle when query text is provided and Chroma is available
    return !!options.query && !!this.chromaSync;
  }

  async search(options: StrategySearchOptions): Promise<StrategySearchResult> {
    const {
      query,
      searchType = 'all',
      obsType,
      concepts,
      files,
      limit = SEARCH_CONSTANTS.DEFAULT_LIMIT,
      project,
      orderBy = 'date_desc'
    } = options;

    if (!query) {
      return this.emptyResult('chroma');
    }

    const searchObservations = searchType === 'all' || searchType === 'observations';
    const searchSessions = searchType === 'all' || searchType === 'sessions';
    const searchPrompts = searchType === 'all' || searchType === 'prompts';

    let observations: ObservationSearchResult[] = [];
    let sessions: SessionSummarySearchResult[] = [];
    let prompts: UserPromptSearchResult[] = [];

    try {
      // Build Chroma where filter for doc_type
      const whereFilter = this.buildWhereFilter(searchType);

      // Step 1: Query Expansion for better recall
      const expander = getQueryExpander();
      const searchQueries = expander.getSearchQueries(query, 3);

      logger.info('SEARCH', 'ChromaSearchStrategy: Query expansion', {
        original: query,
        expanded: searchQueries
      });

      // Step 2: Multi-query retrieval (parallel)
      const allResults = await Promise.all(
        searchQueries.map(q =>
          this.chromaSync.queryChroma(q, SEARCH_CONSTANTS.CHROMA_BATCH_SIZE, whereFilter)
        )
      );

      // Step 3: Merge and deduplicate results
      const chromaResults = this.mergeChromaResults(allResults);

      logger.info('SEARCH', 'ChromaSearchStrategy: Merged results', {
        queryCount: searchQueries.length,
        matchCount: chromaResults.ids.length
      });

      if (chromaResults.ids.length === 0) {
        // No matches - this is the correct answer
        return {
          results: { observations: [], sessions: [], prompts: [] },
          usedChroma: true,
          fellBack: false,
          strategy: 'chroma'
        };
      }

      // Step 2: Filter by recency (90 days)
      const recentItems = this.filterByRecency(chromaResults);
      logger.debug('SEARCH', 'ChromaSearchStrategy: Filtered by recency', {
        count: recentItems.length
      });

      // Step 3: Categorize by document type
      const categorized = this.categorizeByDocType(recentItems, {
        searchObservations,
        searchSessions,
        searchPrompts
      });

      // Step 4: Hydrate from SQLite with additional filters
      if (categorized.obsIds.length > 0) {
        const obsOptions = { type: obsType, concepts, files, orderBy, limit, project };
        observations = this.sessionStore.getObservationsByIds(categorized.obsIds, obsOptions);
      }

      if (categorized.sessionIds.length > 0) {
        sessions = this.sessionStore.getSessionSummariesByIds(categorized.sessionIds, {
          orderBy,
          limit,
          project
        });
      }

      if (categorized.promptIds.length > 0) {
        prompts = this.sessionStore.getUserPromptsByIds(categorized.promptIds, {
          orderBy,
          limit,
          project
        });
      }

      logger.debug('SEARCH', 'ChromaSearchStrategy: Hydrated results', {
        observations: observations.length,
        sessions: sessions.length,
        prompts: prompts.length
      });

      return {
        results: { observations, sessions, prompts },
        usedChroma: true,
        fellBack: false,
        strategy: 'chroma'
      };

    } catch (error) {
      logger.error('SEARCH', 'ChromaSearchStrategy: Search failed', {}, error as Error);
      // Return empty result - caller may try fallback strategy
      return {
        results: { observations: [], sessions: [], prompts: [] },
        usedChroma: false,
        fellBack: false,
        strategy: 'chroma'
      };
    }
  }

  /**
   * Build Chroma where filter for document type
   */
  private buildWhereFilter(searchType: string): Record<string, any> | undefined {
    switch (searchType) {
      case 'observations':
        return { doc_type: 'observation' };
      case 'sessions':
        return { doc_type: 'session_summary' };
      case 'prompts':
        return { doc_type: 'user_prompt' };
      default:
        return undefined;
    }
  }

  /**
   * Filter results by recency (90-day window)
   */
  private filterByRecency(chromaResults: {
    ids: number[];
    metadatas: ChromaMetadata[];
  }): Array<{ id: number; meta: ChromaMetadata }> {
    const cutoff = Date.now() - SEARCH_CONSTANTS.RECENCY_WINDOW_MS;

    return chromaResults.metadatas
      .map((meta, idx) => ({
        id: chromaResults.ids[idx],
        meta
      }))
      .filter(item => item.meta && item.meta.created_at_epoch > cutoff);
  }

  /**
   * Categorize IDs by document type
   */
  private categorizeByDocType(
    items: Array<{ id: number; meta: ChromaMetadata }>,
    options: {
      searchObservations: boolean;
      searchSessions: boolean;
      searchPrompts: boolean;
    }
  ): { obsIds: number[]; sessionIds: number[]; promptIds: number[] } {
    const obsIds: number[] = [];
    const sessionIds: number[] = [];
    const promptIds: number[] = [];

    for (const item of items) {
      const docType = item.meta?.doc_type;
      if (docType === 'observation' && options.searchObservations) {
        obsIds.push(item.id);
      } else if (docType === 'session_summary' && options.searchSessions) {
        sessionIds.push(item.id);
      } else if (docType === 'user_prompt' && options.searchPrompts) {
        promptIds.push(item.id);
      }
    }

    return { obsIds, sessionIds, promptIds };
  }

  /**
   * Merge results from multiple Chroma queries
   * Deduplicates by ID, applies time decay, and sorts by adjusted distance
   */
  private mergeChromaResults(
    results: Array<{ ids: number[]; distances: number[]; metadatas: any[] }>
  ): { ids: number[]; distances: number[]; metadatas: any[] } {
    const timeDecay = getTimeDecay();
    const idMap = new Map<number, { distance: number; adjustedDistance: number; metadata: any }>();

    for (const result of results) {
      for (let i = 0; i < result.ids.length; i++) {
        const id = result.ids[i];
        const distance = result.distances[i];
        const metadata = result.metadatas[i];

        // Apply time decay to distance (older items get higher adjusted distance)
        const createdAtEpoch = metadata?.created_at_epoch || Date.now();
        const adjustedDistance = timeDecay.applyToDistance(distance, createdAtEpoch);

        const existing = idMap.get(id);
        if (!existing || adjustedDistance < existing.adjustedDistance) {
          idMap.set(id, { distance, adjustedDistance, metadata });
        }
      }
    }

    // Sort by adjusted distance (considering time decay - older items rank lower)
    const sorted = Array.from(idMap.entries()).sort((a, b) => a[1].adjustedDistance - b[1].adjustedDistance);

    return {
      ids: sorted.map(([id]) => id),
      distances: sorted.map(([, data]) => data.distance),
      metadatas: sorted.map(([, data]) => data.metadata)
    };
  }
}
