# Technologie-Stack

**Generiert:** 2026-01-19
**Projekt:** FPV Racing Heats Manager

---

## Übersicht

| Kategorie | Technologie | Version |
|-----------|-------------|---------|
| **Runtime** | Node.js | 18+ |
| **Framework** | React | 18.3.1 |
| **Sprache** | TypeScript | 5.5.4 |
| **Build-Tool** | Vite | 5.4.8 |
| **Testing** | Vitest | 2.1.4 |

---

## Frontend-Stack

### Core
| Paket | Version | Zweck |
|-------|---------|-------|
| `react` | 18.3.1 | UI-Bibliothek |
| `react-dom` | 18.3.1 | React DOM Renderer |
| `typescript` | 5.5.4 | Typsichere Entwicklung |

### State Management
| Paket | Version | Zweck |
|-------|---------|-------|
| `zustand` | 4.5.5 | Leichtgewichtiger State Manager |
| `zustand/middleware` | - | localStorage Persistenz |

### Styling
| Paket | Version | Zweck |
|-------|---------|-------|
| `tailwindcss` | 3.4.14 | Utility-first CSS |
| `tailwindcss-animate` | 1.0.7 | Animation Utilities |
| `clsx` | 2.1.1 | Conditional ClassNames |
| `tailwind-merge` | 2.5.4 | Tailwind Class Merging |
| `class-variance-authority` | 0.7.1 | Komponenten-Varianten |

### Formulare & Validierung
| Paket | Version | Zweck |
|-------|---------|-------|
| `react-hook-form` | 7.52.2 | Formular-Management |
| `zod` | 3.23.8 | Schema-Validierung |
| `@hookform/resolvers` | 3.9.1 | Zod Integration |

### UI-Komponenten
| Paket | Version | Zweck |
|-------|---------|-------|
| `@radix-ui/react-dialog` | 1.1.4 | Accessible Dialogs |
| `@radix-ui/react-slot` | 1.1.1 | Component Composition |
| `@radix-ui/react-switch` | 1.1.2 | Toggle Switch |
| `lucide-react` | 0.441.0 | Icon-Bibliothek |

### Drag & Drop
| Paket | Version | Zweck |
|-------|---------|-------|
| `@dnd-kit/core` | 6.3.1 | Drag & Drop Core |
| `@dnd-kit/sortable` | 9.0.0 | Sortierbare Listen |
| `@dnd-kit/utilities` | 3.2.2 | DnD Utilities |

### Utilities
| Paket | Version | Zweck |
|-------|---------|-------|
| `papaparse` | 5.5.3 | CSV-Parsing |

---

## Entwicklungs-Tools

### Build & Development
| Tool | Version | Zweck |
|------|---------|-------|
| `vite` | 5.4.8 | Dev Server & Build |
| `@vitejs/plugin-react` | 4.3.4 | React Plugin für Vite |

### Testing
| Tool | Version | Zweck |
|------|---------|-------|
| `vitest` | 2.1.4 | Test Runner |
| `@testing-library/react` | 16.0.1 | React Testing |
| `@testing-library/jest-dom` | 6.6.3 | DOM Matchers |
| `jsdom` | 25.0.1 | DOM-Simulation |

### TypeScript
| Tool | Version | Zweck |
|------|---------|-------|
| `typescript` | 5.5.4 | TypeScript Compiler |
| `@types/react` | 18.3.12 | React Types |
| `@types/react-dom` | 18.3.1 | React DOM Types |
| `@types/papaparse` | 5.3.17 | PapaParse Types |

---

## NPM Scripts

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run"
}
```

| Script | Beschreibung |
|--------|--------------|
| `npm run dev` | Startet Vite Dev Server auf Port 5173 |
| `npm run build` | TypeScript Check + Production Build |
| `npm run preview` | Vorschau des Production Builds |
| `npm test` | Startet Vitest im Watch-Mode |
| `npm run test:run` | Führt Tests einmalig aus |

---

## Design System: Synthwave Theme

### Farbpalette (tailwind.config.js)

```javascript
colors: {
  // Hintergrund
  void: '#0d0221',        // Tiefes Dunkel
  night: '#1a0533',       // Dunkelviolett
  'night-light': '#2a0845', // Heller Violett

  // Neon-Akzente
  'neon-pink': '#ff2a6d',   // Primär-Akzent
  'neon-cyan': '#05d9e8',   // Sekundär-Akzent
  'neon-magenta': '#d300c5', // Tertiär-Akzent

  // Platzierungen
  gold: '#f9c80e',          // 1. Platz
  silver: '#c0c0c0',        // 2. Platz
  bronze: '#cd7f32',        // 3. Platz

  // Status
  'winner-green': '#39ff14', // Gewinner
  'loser-red': '#ff073a',    // Verlierer

  // Text
  chrome: '#e0e0e0',        // Primärtext
  steel: '#888888',         // Sekundärtext
}
```

### Beamer-optimierte Schriftgrößen

```javascript
fontSize: {
  'beamer-caption': '16px',  // Beschriftungen
  'beamer-body': '18px',     // Fließtext
  'beamer-ui': '20px',       // UI-Elemente
  'beamer-name': '24px',     // Piloten-Namen
  'beamer-rank': '32px',     // Platzierungen
  'beamer-heat': '36px',     // Heat-Nummern
  'beamer-display': '48px',  // Headlines
}
```

### Animationen

- `glow-pulse` - Pulsierender Neon-Glow
- `glow-pulse-gold` - Gold-Glow für Gewinner
- `glow-pulse-cyan` - Cyan-Glow für aktive Elemente
- `scale-in` - Einblenden mit Scale-Effekt
- `rotate-border` - Rotierende Border-Animation

---

## Konfigurationsdateien

### vite.config.ts
```typescript
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

### tsconfig.json (Highlights)
- Target: ES2020
- Module: ESNext
- Strict Mode: aktiviert
- JSX: react-jsx

---

## Deployment-Anforderungen

| Anforderung | Wert |
|-------------|------|
| **Node.js** | 18.0.0+ |
| **Build Output** | `dist/` (Static Files) |
| **Hosting** | Jeder Static File Host (Vercel, Netlify, etc.) |
| **Backend** | Keiner (Client-only App) |
| **Datenbank** | localStorage (Browser) |
