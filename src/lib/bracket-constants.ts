/**
 * Bracket Constants - Magic Strings and Thresholds
 *
 * Story 1.6: submitHeatResults() aufteilen
 * Phase 1: Konstanten für Heat-ID-Prefixes und Pool-Thresholds
 */

/**
 * Heat ID Prefixes für verschiedene Bracket-Typen
 */
export const HEAT_ID_PREFIXES = {
  WB_HEAT: 'wb-heat-',
  WB_FINALE: 'wb-finale-',
  LB_HEAT: 'lb-heat-',
  LB_FINALE: 'lb-finale-',
  GRAND_FINALE: 'grand-finale-',
} as const

/**
 * Pool-Größen-Schwellenwerte für Heat-Generierung
 */
export const POOL_THRESHOLDS = {
  /** Minimum für reguläre 4er-Heats */
  MIN_FOR_REGULAR_HEAT: 4,
  /** Minimum für Finale-Heats (nur bei 3 Piloten sinnvoll - Top 2 kommen weiter) */
  MIN_FOR_FINALE: 3,
  /** Maximum für Finale-Heats */
  MAX_FOR_FINALE: 3,
  /** Bei exakt 2 Piloten → direkt ins Grand Finale (kein Finale-Heat nötig) */
  DIRECT_QUALIFY_COUNT: 2,
} as const

/**
 * Ranking-Schwellenwerte für Bracket-Übergänge
 */
export const RANKING_THRESHOLDS = {
  /** Top-Ränge die weiterkommen (Platz 1 und 2) */
  TOP_RANKS: [1, 2] as const,
  /** Bottom-Ränge die verlieren (Platz 3 und 4) */
  BOTTOM_RANKS: [3, 4] as const,
} as const

/**
 * Type helper: Prüft ob ein Rang ein Top-Rang ist
 */
export function isTopRank(rank: number): boolean {
  return RANKING_THRESHOLDS.TOP_RANKS.includes(rank as 1 | 2)
}

/**
 * Type helper: Prüft ob ein Rang ein Bottom-Rang ist
 */
export function isBottomRank(rank: number): boolean {
  return RANKING_THRESHOLDS.BOTTOM_RANKS.includes(rank as 3 | 4)
}
