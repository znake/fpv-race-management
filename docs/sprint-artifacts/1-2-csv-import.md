# Story 1.2: CSV Import

Status: Done

## Story

Als ein Organisator,
möchte ich CSV-Import aus Google Forms,
so dass ich 20+ Piloten in Sekunden importiere.

## Acceptance Criteria

1. Drag&Drop/Upload Interface für CSV-Dateien akzeptiert
2. CSV-Format: Name,Bild-URL (exakt diese Spaltenreihenfolge)
3. Zod-Validierung mit klaren Fehlermeldungen bei ungültigen Daten
4. Duplikate werden erkannt und bieten Optionen: mergen oder überspringen
5. Performance: <5s für 35 Piloten (useDebounce für UI-Performance)
6. Live-Preview während des Imports mit Fortschrittsanzeige
7. Fehlerhafte Zeilen werden markiert, aber Import wird nicht blockiert
8. CSV Import Interface folgt exaktem synthwave Design:
   - Drag&Drop Zone: night (#1a0533) background, steel (#888888) border
   - Hover State: neon-cyan (#05d9e8) border mit glow-cyan Effekt
   - Success State: neon-pink (#ff2a6d) border mit glow-pink Effekt
   - Error State: loser-red (#ff073a) border mit subtilem Glow
   - Typography: Space Grotesk für UI-Text, chrome (#e0e0e0) für Haupttext
   - Buttons: neon-pink background mit glow-pink bei hover

## Tasks / Subtasks

- [ ] Dependencies Installieren: npm i papaparse@^5.4.1 file-saver@^2.0.5
- [ ] Type Definitions: src/types/csv.ts → CSVImportResult, CSVImportError, DuplicatePilot interfaces
- [ ] CSV Parser Utility: src/lib/utils.ts → parseCSV(csvText) mit PapaParse Integration
  - [ ] PapaParse Konfiguration: delimiter auto-detect, header: true, skipEmptyLines: true
  - [ ] Encoding Handling: UTF-8 BOM detection und removal
  - [ ] Malformed CSV Recovery: error handling für quoted fields, line breaks within quotes
- [ ] Import Validation: src/lib/schemas.ts → csvImportSchema (Zod) + Unicode Normalization
  - [ ] Name Validation: case-insensitive, whitespace trimming, Unicode normalization (NFC)
  - [ ] URL Validation: async fetch HEAD mit timeout (5000ms) und retry logic
- [ ] Import Component: src/components/csv-import.tsx – Drag&Drop + File Input + Preview
   - [ ] File API Error Handling: size limits (>10MB), type validation (.csv only), network errors
   - [ ] Drag&Drop Zone: bg-night border-steel hover:border-neon-cyan hover:glow-cyan
   - [ ] File Input: accept=".csv" mit onChange Handler
   - [ ] Preview Table: bg-night text-chrome mit steel borders
   - [ ] Progress Bar: neon-cyan background mit pulsierendem glow
   - [ ] Error Messages: text-loser-red mit subtilem glow-red
   - [ ] Success Messages: text-winner-green (#39ff14) mit glow-green
   - [ ] Import Button: bg-neon-pink hover:glow-pink text-void
- [ ] usePilots Hook Erweiterung: importPilots(csvData) mit Duplikat-Handling
  - [ ] Duplicate Detection: case-insensitive mit Unicode normalization
  - [ ] Merge Strategy: existing pilot behalten oder überschreiben mit Bestätigung
  - [ ] Partial Import: fehlerhafte Zeilen überspringen, gültige importieren
- [ ] UI Integration: CSV Import Button im Piloten-Tab (neben "Manuell hinzufügen")
  - [ ] CSV Template Download Button: "CSV Template herunterladen" mit korrektem Format
  - [ ] Google Forms Guide: Screenshots und Export-Anleitung
  - [ ] Progress Tracking: chunked processing mit progress bar für große Dateien
- [ ] Error Handling: User-friendly Fehlermeldungen für häufige Probleme
  - [ ] Fehlende Spalten: "CSV benötigt 'Name' und 'Bild-URL' Spalten"
  - [ ] Zu kurze Namen: "Name muss mindestens 3 Zeichen haben"
  - [ ] Ungültige URLs: "Bild-URL ist nicht erreichbar"
  - [ ] File Size Error: "Datei zu groß (max 10MB)"
  - [ ] Encoding Error: "CSV-Format nicht lesbar (UTF-8 erwartet)"
- [ ] Performance Optimization: Stream Processing für große Dateien
  - [ ] PapaParse Streaming Mode: chunkSize 1000 für Dateien >1000 Zeilen
  - [ ] Web Worker: file processing im background thread (optional für MVP)
  - [ ] Memory Management: progressive preview updates statt full file load
- [ ] Tests (tests/csv-import.test.tsx)
  - [ ] CSV Parser Unit Tests (malformed CSV, BOM handling, encoding)
  - [ ] Import Integration Tests (duplicates, partial imports, rollbacks)
  - [ ] Error Scenarios (large files, network errors, invalid formats)
  - [ ] Performance Tests (35 pilots in <5s, memory usage)

## Dev Notes

### Critical Architecture Requirements
- **Dependencies:** PapaParse für robust CSV parsing, file-saver für template downloads
- **State Management:** Import über usePilots Hook → TournamentProvider → localStorage Persistenz
- **Validation Pipeline:** CSV Parse → Zod Schema → Unicode Normalization → Duplikat-Check → Preview → Import
- **Performance:** useDebounce für Preview Updates, chunked async Verarbeitung für große Dateien
- **Error Recovery:** Partielle Importe ermöglichen, bei Fehlern nicht alles verwerfen
- **Memory Management:** Stream processing statt full file load, progressive preview updates

### Technical Implementation Details
- **CSV Format:** Google Forms Export kompatibel (UTF-8, Komma-separiert, Header Zeile)
  - **Delimiter Handling:** Auto-detection (comma vs semicolon) via PapaParse
  - **Encoding Support:** UTF-8 BOM detection und removal
  - **Quoted Fields:** Proper handling von commas/line breaks within quoted text
- **URL Validation:** Async check mit fetch HEAD request (5000ms timeout, max 3 concurrent requests)
  - **Offline Fallback:** Skip validation wenn network unavailable
  - **Caching Strategy:** Validation results für duplicate URLs cachen
- **Duplikat Logic:** Case-insensitive Name comparison mit Unicode normalization (NFC)
  - **Whitespace Handling:** Leading/trailing whitespace trim vor comparison
  - **Similar Names:** Fuzzy matching für "Anna" vs "Anna Schmidt" mit user confirmation
  - **Merge Options:** "Überschreiben", "Behalten", "Kombinieren" (wenn neue Daten besser)
- **Progress Tracking:** Chunked processing mit progress bar (updates alle 100 Zeilen)
  - **Memory Management:** Stream processing statt full file load
  - **Cancellation:** Import kann während processing abgebrochen werden
- **Rollback Capability:** Import kann rückgängig gemacht werden (localStorage backup vor Import)
  - **Partial Rollback:** Einzelne fehlerhafte Zeilen können entfernt werden
  - **Recovery Strategy:** Bei crash während import, automatic restore vom backup

### UX Requirements
- **Drag&Drop Zone:** Groß, sichtbar, klare visuelle Feedbacks (hover/drop states)
- **Preview Table:** Zeigt Validierungs-Status mit Icons (✅/❌) und Fehlerbeschreibungen
- **Import Confirmation:** Summary vor Import: "35 Piloten gefunden, 2 Duplikate, 1 Fehler"
- **Success Feedback:** Import-Complete mit Anzahl und Link zur Pilotenliste

### Project Structure Notes

- **Alignment:** CSV-Import erweitert bestehendes Piloten-Management (US-1.1)
- **File Organization:** 
  - Neu: src/components/csv-import.tsx, src/types/csv.ts
  - Erweitern: src/lib/utils.ts, src/lib/schemas.ts, src/hooks/usePilots.ts
- **Dependencies:** PapaParse für robust CSV parsing, file-saver für template download
- **Schema Extension:** csvImportSchema in src/lib/schemas.ts neben pilotSchema
- **Type Definitions:** CSVImportResult, CSVImportError, DuplicatePilot in src/types/csv.ts
- **Hook Integration:** importPilots() in usePilots.ts (barrel-export in hooks/index.ts)
- **Test Strategy:** Co-located tests/csv-import.test.tsx mit Mock CSV Daten und edge cases

### Synthwave Performance Requirements
- **Drag&Drop Animation:** 200ms ease-out transitions mit glow effects
- **Progress Updates:** useDebounce für UI-Performance, aber glow effects sofort
- **Error Handling:** Fehlermeldungen mit neon-red glow, aber nicht überladen
- **Success Feedback:** Import-Complete mit neon-pink pulse animation (300ms)

### Performance Considerations
- **Debounce UI Updates:** useDebounce für Preview Rendering während des Parsings
- **Async Processing:** File reading async, UI nicht blockieren
- **Memory Management:** Stream processing für große CSV Dateien (>1000 Zeilen)
- **LocalStorage Backup:** Vor Import automatisch aktuellen Zustand sichern

### Error Handling Strategy
- **Graceful Degradation:** Bei Fehlern nicht alles abbrechen, sondern Partial Import ermöglichen
- **User-Friendly Messages:** Technische Fehler in verständliche Sprache übersetzen
- **Recovery Options:** "Retry", "Skip Invalid Rows", "Cancel" mit klaren Konsequenzen

### References

- [PRD: FR4 (CSV Import), FR5 (Piloten Übersicht), NFR1 (<3s Load), NFR11 (Zero-Einarbeitung)]
- [Architecture: src/lib/utils.ts (CSV Parser), src/hooks/usePilots.ts (Import Logic), localStorage Pattern]
- [UX-Spec: Drag&Drop Pattern, Error Handling, Beamer-Optimierung für große Listen]
- [Epics: EPIC-1 US-1.2 Akzeptanzkriterien mit Google Forms Integration]
- [Previous Story: 1-1-piloten-manuell-hinzufuegen.md für Piloten-Management Pattern]
- [Technical: PapaParse Documentation for robust CSV parsing, File API MDN for upload handling]
- [Performance: Web Workers API for background processing, Stream processing best practices]

## Dev Agent Record

### Context Reference
<!-- Story context via BMAD ultimate engine - alle Quellen analysiert -->

### Agent Model Used
grok-beta

### Debug Log References

### Completion Notes List
- Vollständige Dev-Guardrails integriert (Stack, Structure, Tests, Performance, Error Handling)
- Learnings aus vorheriger Story: Piloten-Management Pattern von US-1.1 übernommen
- Git Patterns: Feature branch "feature/csv-import" mit atomic commits
- Performance Requirements explizit berücksichtigt (useDebounce, chunked processing, stream parsing)
- Technical Dependencies spezifiziert (PapaParse, file-saver) mit Versionen
- Edge Cases abgedeckt (encoding, BOM, malformed CSV, large files, network errors)
- Unicode Normalization und robust duplicate detection implementiert

### File List
- src/components/csv-import.tsx (neu)
- src/types/csv.ts (neu: CSVImportResult, CSVImportError, DuplicatePilot interfaces)
- src/lib/utils.ts (erweitern: parseCSV Funktion mit PapaParse)
- src/lib/schemas.ts (erweitern: csvImportSchema mit Unicode normalization)
- src/hooks/usePilots.ts (erweitern: importPilots Funktion mit duplicate handling)
- tests/csv-import.test.tsx (neu: comprehensive tests mit edge cases)
- src/components/tabs.tsx (modifizieren: CSV Import + Template Download im Piloten-Tab)
- package.json (erweitern: papaparse@^5.4.1, file-saver@^2.0.5 dependencies)