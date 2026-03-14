# Dead Code Report

**Projekt:** FPV Racing Heats Manager

**Stand:** 2026-02-06

**Scope:** `src/` (Quellcode) + relevante Hinweise in `docs/` und `.sisyphus/`

---

## Zusammenfassung

Dieses Dokument listet bestätigte Kandidaten für toten Code bzw. legacy/deprecated Bereiche auf. Die Einordnung basiert auf der aktuellen Codebasis und überprüften Referenz-Suchen (keine Imports/Verwendungen gefunden).

---

## 1) Unbenutzte Komponenten (keine Imports/Verwendungen)

**Beleg:** Grep-Suche zeigt nur die Definitionen, keine Imports in der App.

- `src/components/heat-overview.tsx`
  - Enthält `export function HeatOverview(...)`
  - Keine Vorkommen außerhalb der Datei

- `src/components/on-deck-preview.tsx`
  - Enthält `export function OnDeckPreview(...)`
  - Keine Vorkommen außerhalb der Datei

- `src/components/PhaseIndicator.tsx`
  - Enthält `export function PhaseIndicator(...)`
  - Keine Vorkommen außerhalb der Datei

**Konsequenz:** Diese Dateien können entfernt werden, sofern sie nicht mehr benötigt werden.

---

## 2) Zombie-Code in aktiven Dateien

### `src/components/bracket/BracketTree.tsx`

- `getWBHeats()` wird aufgerufen, aber das Ergebnis wird verworfen:
  - `void getWBHeats()` → keine Nutzung des Rückgabewerts
- `lbHeats` wird berechnet und dann verworfen:
  - `void lbHeats`

**Konsequenz:** Diese Helfer sind aktuell wirkungslos und sollten entfernt oder wieder aktiv genutzt werden.

---

## 3) Deprecated/Legacy APIs

### `src/lib/heat-completion.ts`

Die folgenden Funktionen sind als deprecated markiert und werfen ausschließlich Errors:

- `processQualiHeatCompletion`
- `processWBHeatCompletion`
- `processLBHeatCompletion`
- `processFinaleCompletion`

**Konsequenz:** Entfernen, sobald keine Tests/Legacy-Imports mehr existieren.

### `src/lib/schemas.ts`

- Feld `droppedOut?: boolean` ist als `@deprecated` markiert (Hinweis: „use status instead“).
- Aktuelle Nutzung findet sich in Store/UI/Export-Import (siehe `src/stores/tournamentStore.ts`, `src/components/pilot-card.tsx`, `src/components/ui/heat-card.tsx`, `src/lib/export-import.ts`).

**Konsequenz:** Migration auf `status === 'withdrawn'` und anschließende Entfernung des `droppedOut`-Felds.

---

## 4) Backward-Compatibility / Legacy Marker

- `src/components/bracket-tree.tsx` ist nur ein Re-Export für Backwards Compatibility.
- `src/lib/bracket-logic.ts` enthält „fallback for legacy tests“.

**Konsequenz:** Beibehalten bis Tests/Altabhängigkeiten entfernt sind, dann konsolidieren.

---

## Nächste Schritte (Kurzfassung)

1. **Delete:** `heat-overview.tsx`, `on-deck-preview.tsx`, `PhaseIndicator.tsx`
2. **Cleanup:** `getWBHeats()` und `lbHeats` in `BracketTree.tsx` entfernen oder aktiv nutzen
3. **Remove deprecated functions:** `heat-completion.ts`
4. **Migrate & remove `droppedOut`:** Store + UI + Export/Import auf `status` umstellen

---

## Hinweise

- Diese Analyse deckt nur „bestätigte“ Unbenutzungen ab (keine Imports/Referenzen).
- Bei externen Consumers (z.B. falls einzelne Komponenten außerhalb der App genutzt werden) ist vor dem Löschen eine Code-Suche im gesamten Repo notwendig.
