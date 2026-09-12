# Bericht zur Bereinigung von Totcode

**Projekt:** FPV Racing Heats Manager
**Stand:** 2026-09-12
**Scope:** Abgeschlossene Totcode-Bereinigung in `src/`, Tests-Fixtures und `sprint-status.yaml`

## Zusammenfassung

Ausgangslage war der Branch `develop` auf Commit `53860af`. Die Bereinigung erfolgte auf `cleanup/phase-0-1-dead-code`. In sechs Commits wurden bestätigte ungenutzte Komponenten, APIs, Helfer, Typ-Re-Exports, CSV-Fixtures und das veraltete Root-Artefakt `sprint-status.yaml` entfernt.

Die Prüfung erfolgte mit der vollständigen Testsuite vor und nach der Bereinigung, `npm run build`, `npm run lint`, manuellen `git grep -w`-Referenzprüfungen über `src/` und `tests/` sowie einem einmaligen, fest versionierten Advisory-Audit:

```text
npx --yes knip@6.35.1 --include files,exports,types --include-entry-exports --no-exit-code
```

Vorher bestanden 60 Dateien in `src/`, 22 Testdateien und 319 grüne Tests. Die Tests blieben nach der Bereinigung vollständig grün, der Build endete mit Exit-Code 0. `npm run lint` war bereits vorher rot und meldete 48 Probleme, davon 37 Fehler und 11 Warnungen. Danach waren es 46 Probleme, davon 36 Fehler und 10 Warnungen. Es wurden keine neuen Lint-Probleme eingeführt.

## Entfernte Elemente

### Komponenten

- `src/components/bracket/PoolDisplay.tsx`
- `src/components/bracket/heat-boxes/EmptyBracketHeatBox.tsx`
- `src/components/bracket/heat-boxes/FilledBracketHeatBox.tsx`

Die zugehörigen Barrel-Re-Exports wurden aus `src/components/bracket/index.ts` entfernt. Die Typen `EmptyBracketHeatBoxProps` und `FilledBracketHeatBoxProps` wurden aus `src/components/bracket/types.ts` entfernt.

### Connector-API

Aus `src/components/bracket/SVGConnectorLines.tsx` wurden die ungenutzte Schnittstelle `ConnectorLine` und `getHeatConnections()` entfernt. Die intern verwendeten Helfer `findWBFinale` und `findLBFinale` blieben erhalten.

### Hooks und Helfer

Entfernt wurden:

- `useIsPortrait` aus `src/hooks/useIsMobile.ts`
- `isBottomRank` aus `src/lib/bracket-constants.ts`
- `calculateHeatWidth` aus `src/lib/bracket-layout-calculator.ts`
- `appendGeneratedHeats` aus `src/lib/heat-completion.ts`
- `getPilotRank` aus `src/lib/ui-helpers.ts`
- `generateId` aus `src/lib/utils.ts`

### Schema-Cluster

Aus `src/lib/schemas.ts` wurden `csvImportSchema`, `CSVImportInput` und `validateCSVRow` entfernt. Der weiterhin verwendete Import von `z` sowie `pilotSchema` und `PilotInput` blieben erhalten.

### Typ-Re-Exports

Aus `src/types/index.ts` wurden die ungenutzten Barrel-Re-Exports `CSVRow`, `ImportProgress`, `ImportStatus` und `HeatStatus` entfernt. Ihre Definitionen in `src/types/csv.ts` und `src/types/tournament.ts` blieben erhalten.

### CSV-Fixtures

Entfernt wurden acht nicht referenzierte Dateien aus `tests/fixtures/`:

- `tests/fixtures/beispiel-piloten.csv`
- `tests/fixtures/testpiloten-8.csv`
- `tests/fixtures/testpiloten-9.csv`
- `tests/fixtures/testpiloten-10.csv`
- `tests/fixtures/testpiloten-15.csv`
- `tests/fixtures/testpiloten-16.csv`
- `tests/fixtures/testpiloten-27.csv`
- `tests/fixtures/testpiloten-32.csv`

Das Verzeichnis `tests/fixtures/` ist dadurch leer und wurde entfernt.

### Root-Artefakt

Das obsolete `sprint-status.yaml` wurde als Benutzerwunsch zur Repository-Hygiene entfernt. Es handelte sich um ein BMAD-Artefakt.

## Bewusst beibehalten

Folgende Elemente wurden trotz Hinweisen aus dem Advisory-Audit nicht entfernt, weil sie live verwendet werden oder intern benötigt werden:

- `BracketHeatBox`
- `SVGConnectorLines`
- `findWBFinale` und `findLBFinale`
- `useIsMobile`
- `isTopRank`
- `RANKING_THRESHOLDS`
- `HEAT_WIDTH_3`
- `BRACKET_CONSTANTS`
- `DEMO_PILOTS`
- `createWBHeatFromPool`
- alle Test- und Helper-Exports
- die Definitionen von `CSVRow`, `ImportProgress`, `ImportStatus` und `HeatStatus`

Bei einigen dieser Elemente ist nur das Schlüsselwort `export` nicht erforderlich. Das macht die intern verwendeten Definitionen nicht zu Totcode.

## Bereits vor diesem Durchgang entfernt

Die folgenden historischen Punkte waren bereits vor diesem Durchgang entfernt und sind keine offenen Empfehlungen:

- `src/components/heat-overview.tsx`
- `src/components/PhaseIndicator.tsx`
- `src/components/on-deck-preview.tsx`
- `src/components/bracket-tree.tsx` als Re-Export-Shim
- die deprecated, ausschließlich Fehler werfenden Funktionen in `src/lib/heat-completion.ts`
- das Feld `droppedOut`

## Nicht verfolgte knip-Findings

`knip@6.35.1` wurde ausschließlich als einmaliger, fest versionierter Advisory-Audit mit `--no-exit-code` ausgeführt. Das Tool wurde nicht installiert, nicht in `package.json` aufgenommen und es wurde keine Konfigurationsdatei erstellt.

Zusätzliche Findings wurden nicht automatisch entfernt. Die oben ausdrücklich beibehaltenen Elemente wurden anhand ihrer tatsächlichen Verwendung geprüft und bewusst nicht als Totcode behandelt.

## Offene Punkte / Follow-ups

- Mehrere Knowledge-Base-Dateien `AGENTS.md` enthalten noch veraltete Referenzen, unter anderem `tests/AGENTS.md`, `src/lib/AGENTS.md` und `src/components/bracket/AGENTS.md`. Genannt werden dort beispielsweise die entfernten Fixtures, `generateId`, `getHeatConnections` und `PoolDisplay`. Diese Dateien wurden absichtlich nicht geändert.
- Eine architektonische oder konsistenzbezogene Bereinigung war nicht Bestandteil dieses Durchgangs.

Es wurden keine Tests konsolidiert, keine Abhängigkeiten geändert und keine Konfigurationen geändert. `_bmad/`, `.omo/`, `.claude/` und `.opencode/` wurden nicht angefasst.

`package.json` und `package-lock.json` blieben unverändert.
