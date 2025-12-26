# Story 4.5: Path-Alias bereinigen

**Epic:** Tests & Cleanup
**Aufwand:** XS
**Priorität:** 1 (Sprint 1)
**Abhängigkeiten:** Keine

## Beschreibung

Als Entwickler möchte ich den ungenutzten `@/` Path-Alias aus der Konfiguration entfernen, damit keine verwaisten Konfigurationen existieren und zukünftige Entwickler nicht verwirrt werden.

## Akzeptanzkriterien

- [ ] AC1: `@` Alias aus `vite.config.ts` entfernt
- [ ] AC2: Build läuft weiterhin erfolgreich
- [ ] AC3: Alle Tests laufen weiterhin erfolgreich
- [ ] AC4: Keine Imports im Code nutzen `@/` (Verifizierung)

## Technische Details

### Betroffene Dateien
- `vite.config.ts`

### Aktueller Zustand

```typescript
// vite.config.ts
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // ...
});
```

**Problem:** 
- Der Alias ist konfiguriert aber wird nirgends verwendet
- `tsconfig.json` hat keinen entsprechenden `paths` Eintrag
- Alle Imports nutzen relative Pfade (`../`, `./`)

### Verifizierung: Wird der Alias verwendet?

```bash
# Suche nach @/ Imports
grep -r "from '@/" src/
grep -r "from '@/" tests/
grep -r 'from "@/' src/
grep -r 'from "@/' tests/
```

**Erwartetes Ergebnis:** Keine Treffer

### Zu entfernender Code

```typescript
// vite.config.ts - ENTFERNEN:

import path from 'path';  // Falls nur für Alias verwendet

// In defineConfig:
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

### Resultierende vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

### Alternative: Alias aktivieren (NICHT empfohlen)

Falls das Team den Alias in Zukunft nutzen möchte, müsste auch `tsconfig.json` aktualisiert werden:

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Empfehlung:** Entfernen ist einfacher und konsistenter mit dem aktuellen Code.

## Testplan

1. Verifizierung: `grep -r "from '@" src/ tests/` → keine Treffer
2. Alias aus `vite.config.ts` entfernen
3. `npm run build` - Build erfolgreich
4. `npm test` - alle Tests grün
5. `npm run dev` - App startet korrekt
