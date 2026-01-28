/**
 * TimeDecay - Time-based relevance weighting for RAG search
 *
 * Implements a logarithmic decay function with protection constant:
 * - 0-90 days: High weight maintained (slow decay)
 * - 90-180 days: Accelerated decay, protection removed
 * - 180+ days: Pure exponential decay with minimum floor
 *
 * Formula (multiplicative):
 *   Score(t) = min(1.0, BaseDecay(t) × (1 + BoostFactor(t)))
 *
 * Where:
 *   BaseDecay(t) = e^(-t/τ)  // τ = half-life
 *   BoostFactor(t) = B_max × max(0, 1 - ln(1+t/k) / ln(1+T_max/k))
 *
 * See docs/time-decay-design.html for visualization.
 */

import { logger } from '../../../utils/logger.js';

/**
 * Time decay configuration parameters
 */
export interface TimeDecayConfig {
  /** Half-life in days for base exponential decay (default: 60) */
  baseHalfLife: number;

  /** Maximum boost factor for protection (default: 0.5) */
  boostMax: number;

  /** Logarithm curve shape factor - smaller = slower early decay (default: 30) */
  curveFactor: number;

  /** Days until protection completely fades (default: 180) */
  protectionDuration: number;

  /** Minimum weight floor to prevent complete disappearance (default: 0.01) */
  minWeight: number;
}

/**
 * Default configuration values
 */
export const DEFAULT_TIME_DECAY_CONFIG: TimeDecayConfig = {
  baseHalfLife: 60,
  boostMax: 0.5,
  curveFactor: 30,
  protectionDuration: 180,
  minWeight: 0.01,
};

/**
 * TimeDecay calculator
 */
export class TimeDecay {
  private config: TimeDecayConfig;

  constructor(config: Partial<TimeDecayConfig> = {}) {
    this.config = { ...DEFAULT_TIME_DECAY_CONFIG, ...config };
  }

  /**
   * Calculate base exponential decay
   * BaseDecay(t) = e^(-t/τ)
   */
  private calcBaseDecay(ageInDays: number): number {
    const result = Math.exp(-ageInDays / this.config.baseHalfLife);
    // Precision protection for very old items
    return result < 1e-10 ? 0 : result;
  }

  /**
   * Calculate logarithmic boost factor (protection constant)
   * BoostFactor(t) = B_max × max(0, 1 - ln(1+t/k) / ln(1+T_max/k))
   *
   * Properties:
   * - At t=0: BoostFactor ≈ B_max
   * - Decays slowly at first (logarithmic "front-slow")
   * - Decays faster later ("back-fast")
   * - At t=T_max: BoostFactor = 0
   */
  private calcBoostFactor(ageInDays: number): number {
    const { boostMax, curveFactor, protectionDuration } = this.config;

    // Logarithmic decay ratio
    const logRatio =
      Math.log(1 + ageInDays / curveFactor) /
      Math.log(1 + protectionDuration / curveFactor);

    // Boost factor with floor at 0
    return boostMax * Math.max(0, 1 - logRatio);
  }

  /**
   * Calculate final decay weight for a given age
   *
   * @param ageInDays - Age of the item in days
   * @returns Weight between minWeight and 1.0
   */
  calc(ageInDays: number): number {
    if (ageInDays < 0) {
      return 1.0; // Future items get full weight
    }

    const baseDecay = this.calcBaseDecay(ageInDays);
    const boostFactor = this.calcBoostFactor(ageInDays);

    // Multiplicative combination: BaseDecay × (1 + BoostFactor)
    const rawScore = baseDecay * (1 + boostFactor);

    // Apply ceiling and floor
    const score = Math.min(1.0, Math.max(this.config.minWeight, rawScore));

    return score;
  }

  /**
   * Calculate decay from epoch timestamp
   *
   * @param createdAtEpoch - Creation timestamp in milliseconds
   * @returns Weight between minWeight and 1.0
   */
  calcFromEpoch(createdAtEpoch: number): number {
    const ageMs = Date.now() - createdAtEpoch;
    const ageInDays = ageMs / (24 * 60 * 60 * 1000);
    return this.calc(ageInDays);
  }

  /**
   * Apply time decay to a semantic distance score
   * Lower distance = better match, so we divide by decay weight
   *
   * @param distance - Semantic distance (0 = perfect match)
   * @param createdAtEpoch - Creation timestamp in milliseconds
   * @returns Adjusted distance (higher = worse match for older items)
   */
  applyToDistance(distance: number, createdAtEpoch: number): number {
    const weight = this.calcFromEpoch(createdAtEpoch);
    // Divide distance by weight: older items get higher (worse) adjusted distance
    return distance / weight;
  }

  /**
   * Apply time decay to a similarity score
   * Higher similarity = better match, so we multiply by decay weight
   *
   * @param similarity - Similarity score (1 = perfect match)
   * @param createdAtEpoch - Creation timestamp in milliseconds
   * @returns Adjusted similarity (lower = worse match for older items)
   */
  applyToSimilarity(similarity: number, createdAtEpoch: number): number {
    const weight = this.calcFromEpoch(createdAtEpoch);
    return similarity * weight;
  }

  /**
   * Get configuration (for debugging/logging)
   */
  getConfig(): TimeDecayConfig {
    return { ...this.config };
  }

  /**
   * Generate a table of decay values for debugging
   */
  debugTable(): Array<{ days: number; baseDecay: number; boost: number; final: number }> {
    const keyDays = [0, 7, 30, 60, 90, 120, 150, 180, 270, 365];
    return keyDays.map(days => ({
      days,
      baseDecay: Number(this.calcBaseDecay(days).toFixed(4)),
      boost: Number(this.calcBoostFactor(days).toFixed(4)),
      final: Number(this.calc(days).toFixed(4)),
    }));
  }
}

// Singleton instance with default config
let _defaultInstance: TimeDecay | null = null;

/**
 * Get the default TimeDecay instance
 */
export function getTimeDecay(): TimeDecay {
  if (!_defaultInstance) {
    _defaultInstance = new TimeDecay();
  }
  return _defaultInstance;
}

/**
 * Create a TimeDecay instance with custom config
 */
export function createTimeDecay(config: Partial<TimeDecayConfig>): TimeDecay {
  return new TimeDecay(config);
}
