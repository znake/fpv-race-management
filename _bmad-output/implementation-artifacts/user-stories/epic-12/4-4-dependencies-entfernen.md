# Story 4.4: Ungenutzte Dependencies entfernen

**Epic:** Tests & Cleanup
**Aufwand:** XS
**Priorität:** 1 (Sprint 1)
**Abhängigkeiten:** Keine

## Beschreibung

Als Entwickler möchte ich ungenutzte npm-Dependencies entfernen, damit die Bundle-Größe reduziert wird, die Installation schneller ist und die `package.json` sauber bleibt.

## Akzeptanzkriterien

- [ ] AC1: Verifiziert, dass `file-saver` nirgends importiert wird
- [ ] AC2: Verifiziert, dass `uuid` nirgends importiert wird (Projekt nutzt `crypto.randomUUID()`)
- [ ] AC3: Beide Dependencies inkl. Types aus `package.json` entfernt:
  - `"file-saver"` (dependencies)
  - `"@types/file-saver"` (devDependencies)
  - `"uuid"` (dependencies)
- [ ] AC4: `npm install` läuft ohne Fehler
- [ ] AC5: `npm run build` läuft ohne Fehler
- [ ] AC6: Alle Tests laufen weiterhin erfolgreich

## Technische Details

### Betroffene Dateien
- `package.json`
- `package-lock.json` (automatisch bei npm install)

### Verifizierung vor dem Entfernen

```bash
# Suche nach file-saver Imports
grep -r "file-saver" src/
grep -r "file-saver" tests/
grep -r "from 'file-saver'" .
grep -r 'from "file-saver"' .

# Suche nach uuid Imports
grep -r "from 'uuid'" src/
grep -r 'from "uuid"' src/
grep -r "uuid" src/ --include="*.ts" --include="*.tsx"

# Prüfe ob crypto.randomUUID verwendet wird (Ersatz für uuid)
grep -r "crypto.randomUUID" src/
```

**Erwartetes Ergebnis:**
- `file-saver`: Keine Treffer
- `uuid`: Keine Treffer (nur crypto.randomUUID)

### Entfernen der Dependencies

```bash
npm uninstall file-saver uuid @types/file-saver
```

### Alternative: Manuelle Entfernung

Falls npm uninstall Probleme macht:

```json
// package.json - diese Zeilen entfernen:

// In "dependencies":
"file-saver": "^2.0.5",
"uuid": "^10.0.0",

// In "devDependencies":
"@types/file-saver": "^2.0.7",
```

Dann:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Bundle-Size-Vergleich (optional)

```bash
# Vorher messen
npm run build
du -sh dist/

# Nach Entfernung
npm run build  
du -sh dist/

# Erwartete Ersparnis: ~50-100KB
```

## Testplan

1. Verifizierung durchführen (grep-Befehle oben)
2. `npm uninstall file-saver uuid @types/file-saver`
3. `npm install` - keine Fehler
4. `npm run build` - Build erfolgreich
5. `npm test` - alle Tests grün
6. App starten und manuell testen
