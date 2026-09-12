# Bericht zur Testbereinigung

**Projekt:** FPV Racing Heats Manager
**Stand:** 2026-09-12
**Scope:** `tests/`

## Aktueller Stand

Die Testsuite umfasst 22 Testdateien und 319 Tests. Alle Tests sind grün und laufen in etwa 1,8 bis 2,2 Sekunden. Es gibt keine `.only`-, `.skip`- oder `.todo`-Markierungen.

In diesem Durchgang fand keine Testkonsolidierung statt. Keine Testdatei wurde gelöscht oder geändert. Entfernt wurden ausschließlich acht nicht verwendete CSV-Fixtures.

## Entfernte CSV-Fixtures

Folgende Dateien hatten keine Code-Referenzen und wurden entfernt:

- `tests/fixtures/beispiel-piloten.csv`
- `tests/fixtures/testpiloten-8.csv`
- `tests/fixtures/testpiloten-9.csv`
- `tests/fixtures/testpiloten-10.csv`
- `tests/fixtures/testpiloten-15.csv`
- `tests/fixtures/testpiloten-16.csv`
- `tests/fixtures/testpiloten-27.csv`
- `tests/fixtures/testpiloten-32.csv`

Das Verzeichnis `tests/fixtures/` ist dadurch leer und wurde entfernt.

## Bereits nicht mehr vorhandene Testdateien

Die folgenden Dateien aus dem alten Bericht existieren nicht mehr und sind daher keine offenen Bereinigungsvorschläge:

- `pilot-path-toggle.test.ts`
- `pilot-path-toggle-ui.test.tsx`
- `pilot-path-rendering.test.tsx`
- `pilot-path-hover.test.tsx`
- `pilot-avatar-ids.test.tsx`

Die früher erwähnten Hinweise zu einem TODO und `console.log`-Ausgaben in `lb-synchronization-32-pilots.test.ts` sind für den aktuellen Stand nicht mehr zutreffend und werden nicht als offene Aufgaben wiederholt.

## Aktuelle Testdateien

- `app-footer.test.tsx`
- `channel-assignment.test.ts`
- `csv-import.test.tsx`
- `eight-pilots-flow.test.ts`
- `export-bracket-html.test.ts`
- `export-import.test.ts`
- `finale-ceremony.test.tsx`
- `grand-finale-4-piloten.test.ts`
- `heat-assignment.test.ts`
- `heat-completion.test.ts`
- `heat-results.test.tsx`
- `lap-time-formatting.test.ts`
- `lb-heat-generation.test.ts`
- `lb-synchronization-32-pilots.test.ts`
- `loser-pool.test.ts`
- `pilot-card.test.tsx`
- `pilot-path-calculation.test.ts`
- `pilot-path-integration.test.tsx`
- `placement-entry-modal.test.tsx`
- `reset-functions.test.ts`
- `round-progression.test.ts`
- `tournament-start.test.tsx`

## Verifikation

Die vollständige Testsuite wurde vor und nach der Bereinigung ausgeführt. Zusätzlich wurden `npm run build`, `npm run lint` und manuelle Referenzprüfungen mit `git grep -w` über `src/` und `tests/` ausgeführt.

Der Build endete mit Exit-Code 0. Der Lint-Status war bereits vor der Bereinigung rot: 48 Probleme, davon 37 Fehler und 11 Warnungen. Danach waren es 46 Probleme, davon 36 Fehler und 10 Warnungen. Es wurden keine neuen Probleme eingeführt.

## Follow-up

Ein eigener Unit-Test für `src/lib/bracket-logic.ts`, den Kernalgorithmus, ist weiterhin nur transitiv abgedeckt. Ein solcher Test ist ein Kandidat für eine spätere, separate Arbeit.

Weitere Testkonsolidierung war ausdrücklich nicht Teil dieses Durchgangs. Es wurden keine Abhängigkeiten oder Konfigurationen geändert.
