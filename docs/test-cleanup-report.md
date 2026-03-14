# Test Cleanup Report

**Projekt:** FPV Racing Heats Manager

**Stand:** 2026-02-06

**Scope:** `tests/` (Vitest)

---

## Zusammenfassung

Es wurden keine `skip`/`todo`-Tests gefunden, aber es gibt Debug-Ausgaben und potenziell redundante Testgruppen (insb. Pilot-Path-Features), die reduziert werden können. Ziel: stabilere, schnellere Test-Suite mit weniger UI-Detailtests.

---

## 1) Debug/Noise in Tests

### `tests/lb-synchronization-32-pilots.test.ts`

- Enthält zahlreiche `console.log`-Ausgaben (Debugging).
- Enthält ein TODO und eine auskommentierte Assertion:
  - `// TODO: Fix LB Finale marking - for now skip this assertion`

**Empfehlung:**
- Debug-Logs entfernen oder hinter einen Test-Flag stellen.
- TODO klären: Assertion wieder aktivieren (Bug fix) oder den Test in ein stabileres Ziel umschreiben.

---

## 2) Redundante Testgruppen (Pilot Paths)

### Betroffene Tests

- `pilot-path-toggle.test.ts` (Store-State Toggle)
- `pilot-path-toggle-ui.test.tsx` (UI-Classes/Attribute)
- `pilot-path-integration.test.tsx` (BracketTree + Toggle + SVGPilotPaths)
- `pilot-path-rendering.test.tsx` (DOM-Geometry + SVG Rendering)
- `pilot-path-hover.test.tsx` (Hover/Timers/Debounce)
- `pilot-path-calculation.test.ts` (Pure Logic: calculate/assign/isEliminated)

**Beobachtung:**
- Mehrere Tests prüfen ähnliche Dinge (Toggle/Visibility/Presence).
- Rendering-/Hover-Tests sind stark DOM- und Timer-basiert → potenziell brittle & langsam.

**Empfohlene Konsolidierung:**
- **Behalten (High-Value):** `pilot-path-calculation.test.ts` (Pure Logic)
- **Behalten (1 Integrationstest):** `pilot-path-integration.test.tsx` (Visibility/Toggle-Integration)
- **Optional entfernen:**
  - `pilot-path-toggle-ui.test.tsx`
  - `pilot-path-rendering.test.tsx`
  - `pilot-path-hover.test.tsx`
  - ggf. `pilot-path-toggle.test.ts` (wenn Integrationstest reicht)

---

## 3) Low-Value UI-Detailtests

### `tests/pilot-avatar-ids.test.tsx`

- Testet ausschließlich DOM-ID-Format für Avatare.
- Niedriger Nutzen, außer es gab konkrete Bugs zu ID-Kollisionen.

**Empfehlung:**
- Entfernen oder durch eine einfache Snapshot/Integration ersetzen, falls nötig.

---

## 4) Safe-Removal Checkliste (vor dem Löschen)

1. **Historie prüfen:** Gab es Bugs zu genau diesem Verhalten?
2. **Redundanz sicherstellen:** Gibt es mind. einen Test, der das Feature weiterhin abdeckt?
3. **CI-Run:** `npm test` nach Entfernen laufen lassen.

---

## Vorschlag für ein schlankes Ziel-Set

- **Core Logic**: `heat-completion.test.ts`, `heat-assignment.test.ts`, `round-progression.test.ts`, `loser-pool.test.ts`, `lb-heat-generation.test.ts`, `channel-assignment.test.ts`, `export-import.test.ts`
- **Core UI Flows**: `csv-import.test.tsx`, `placement-entry-modal.test.tsx`, `heat-results.test.tsx`, `app-footer.test.tsx`, `finale-ceremony.test.tsx`
- **Pilot Paths**: `pilot-path-calculation.test.ts` + `pilot-path-integration.test.tsx`

---

## Nächste Schritte

1. Entfernen der Debug-Logs + TODO in `lb-synchronization-32-pilots.test.ts` klären.
2. Pilot-Path Tests auf 1–2 repräsentative Tests reduzieren.
3. Optional `pilot-avatar-ids.test.tsx` entfernen, wenn kein Bug-Hintergrund existiert.
