/**
 * Story 3.2 – Automatische Heat-Aufteilung
 *
 * Berechnet die optimale Verteilung von 3er- und 4er-Heats für N Piloten.
 * Regeln:
 * - Nur 3er/4er-Heats erlaubt
 * - Maximiere 4er-Heats (effizienter)
 * - Keine 1er/2er-Heats → für 7-60 immer lösbar
 */
export function calculateHeatDistribution(pilotCount: number): {
  fourPlayerHeats: number
  threePlayerHeats: number
} {
  if (pilotCount < 7 || pilotCount > 60) {
    throw new Error('Pilotenzahl muss zwischen 7 und 60 liegen')
  }

  // Von maximal möglichen 4er-Heats abwärts iterieren.
  // Erste gültige Lösung ist optimal, weil sie die 4er-Heats maximiert.
  for (let fourHeats = Math.floor(pilotCount / 4); fourHeats >= 0; fourHeats--) {
    const remaining = pilotCount - fourHeats * 4
    if (remaining >= 0 && remaining % 3 === 0) {
      return {
        fourPlayerHeats: fourHeats,
        threePlayerHeats: remaining / 3,
      }
    }
  }

  // Sollte für 7–60 nie passieren (Story behauptet: immer lösbar), aber sicherheitshalber:
  throw new Error(`Keine gültige Heat-Verteilung für ${pilotCount} Piloten gefunden`)
}
