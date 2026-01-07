# Story 4.3: CSV-Testdateien nach fixtures verschieben

**Epic:** Tests & Cleanup
**Aufwand:** XS
**Priorität:** 1 (Sprint 1)
**Abhängigkeiten:** Keine

## Beschreibung

Als Entwickler möchte ich die CSV-Testdateien in einen dedizierten Ordner verschieben, damit das Projekt-Root aufgeräumt ist und Testdaten klar von Produktionsdateien getrennt sind.

## Akzeptanzkriterien

- [ ] AC1: Neuer Ordner `tests/fixtures/` erstellt
- [ ] AC2: Folgende Dateien verschoben:
  - `beispiel-piloten.csv` → `tests/fixtures/beispiel-piloten.csv`
  - `testpiloten-9.csv` → `tests/fixtures/testpiloten-9.csv`
  - `testpiloten-15.csv` → `tests/fixtures/testpiloten-15.csv`
  - `testpiloten-27.csv` → `tests/fixtures/testpiloten-27.csv`
- [ ] AC3: Alle Tests, die diese Dateien referenzieren, werden aktualisiert
- [ ] AC4: Die Anwendung funktioniert weiterhin korrekt

## Technische Details

### Betroffene Dateien
- 4 CSV-Dateien im Projekt-Root
- Eventuell Testdateien die diese referenzieren
- Eventuell UI-Komponenten (falls `beispiel-piloten.csv` als Demo verwendet wird)

### Neue Struktur

```
tests/
├── fixtures/
│   ├── beispiel-piloten.csv
│   ├── testpiloten-9.csv
│   ├── testpiloten-15.csv
│   └── testpiloten-27.csv
├── helpers/
│   └── ...
└── *.test.ts(x)
```

### Prüfung: Werden CSVs in der App verwendet?

```bash
# Suche nach CSV-Referenzen
grep -r "beispiel-piloten" src/
grep -r "testpiloten" src/

# Suche in Tests
grep -r "beispiel-piloten" tests/
grep -r "testpiloten" tests/
```

**Falls `beispiel-piloten.csv` in der UI referenziert wird:**
- Option A: Datei in `public/` verschieben für Download-Funktion
- Option B: Inline als Konstante in der Komponente

### Befehle zur Migration

```bash
# Ordner erstellen
mkdir -p tests/fixtures

# Dateien verschieben
mv beispiel-piloten.csv tests/fixtures/
mv testpiloten-9.csv tests/fixtures/
mv testpiloten-15.csv tests/fixtures/
mv testpiloten-27.csv tests/fixtures/

# .gitignore prüfen (falls CSVs ignoriert waren)
```

### Update in Tests (falls nötig)

```typescript
// Vorher:
const csvPath = './testpiloten-15.csv';

// Nachher:
const csvPath = './tests/fixtures/testpiloten-15.csv';
// oder mit path module:
import path from 'path';
const csvPath = path.join(__dirname, 'fixtures', 'testpiloten-15.csv');
```

## Testplan

1. `npm test` - alle Tests müssen grün bleiben
2. `npm run build` - Build muss erfolgreich sein
3. Prüfe dass keine CSV-Dateien mehr im Root liegen:
   ```bash
   ls *.csv  # sollte "No such file" zeigen
   ```
4. Manuelle Prüfung: Falls CSV-Import-Demo in UI → funktioniert noch
