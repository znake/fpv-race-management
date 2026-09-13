---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - 'docs/prd.md'
  - 'docs/ux-design-specification.md'
workflowType: 'architecture'
lastStep: 6
project_name: 'FPV Racing Heats'
user_name: 'Jakob'
date: '2025-12-12'
---

# HISTORICAL ARCHIVE: Architecture Decision Document

> This is a historical planning artifact from December 2025, not an implementation reference. For the current codebase, read [Architecture Deep-Dive](./architecture-deep-dive.md).

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

[... previous sections ...]

## Project Structure & Boundaries

### Complete Project Directory Structure [PARTY MODE ENHANCED]

```
fpv-racing-heats/
├── README.md                    # Deutsche Event-Docs + Quickstart
├── package.json
├── vite.config.ts              # PWA + react-window Virtualization
├── tailwind.config.ts          # Synthwave Colors (void, night, neon-pink)
├── tsconfig.json               # Strict TypeScript
├── playwright.config.ts        # E2E Beamer Tests (1920x1080)
├── docker-compose.yml          # Dev + Prod Parity
├── nginx.conf                  # Prod Caching Headers (Beamer-Optimiert)
├── .env.example
├── .gitignore
├── src/
│   ├── main.tsx                # App Entry Point
│   ├── App.tsx                 # TournamentProvider + ErrorBoundary
│   ├── globals.css             # Synthwave Base Styles
│   ├── hooks/
│   │   ├── index.ts            # Barrel Export: { usePilots, useHeatManager }
│   │   ├── useTournamentStore.ts  # Global Zustand + localStorage Persist
│   │   ├── usePilots.ts        # FR1-5: CSV Import + CRUD
│   │   ├── useHeatManager.ts   # FR11-16: Heat Logic + Toggle-to-Rank
│   │   └── useBracketLogic.ts  # FR17-21: Double-Elim Algorithmus
│   ├── components/
│   │   ├── index.ts            # Barrel Export: { PilotCard, HeatBox }
│   │   ├── ui/                 # shadcn/ui Base Components
│   │   ├── error-boundary.tsx  # UX Critical: Beamer Error Recovery
│   │   ├── pilot-card.tsx      # FR1-5: Pilot + RankBadge (Glow Effects)
│   │   ├── heat-box.tsx        # FR11-16: 4er Heat + Results Input
│   │   ├── bracket-tree.tsx    # FR17-21: Winner/Loser Visualization
│   │   ├── on-deck-preview.tsx # FR16: Next Heat Vorschau
│   │   └── tabs.tsx            # FR26-29: Piloten/Bracket/Heat Navigation
│   ├── lib/
│   │   ├── useDebounce.ts      # Perf: CSV Import + Search
│   │   ├── useLocalStorage.ts  # Perf: Memoized Storage Adapter
│   │   ├── schemas.ts          # Zod: pilotSchema, heatSchema, tournamentSchema
│   │   ├── storage.ts          # StorageAdapter (localStorage/server)
│   │   ├── utils.ts            # CSV Parser, Bracket Helpers
│   │   └── constants.ts        # MAX_PILOTS=60, COLORS.void=#0d0221
│   ├── stores/
│   │   └── tournamentStore.ts  # Zustand Store Definition
│   └── types/
│       ├── index.ts            # Pilot, Heat, BracketState, TournamentData
│       └── enums.ts            # TournamentStatus, HeatResult
├── public/
│   ├── logo.svg               # FPV OÖ Branding
│   └── images/                # Optimized Pilot Photos (CDN-ready)
├── tests/
│   ├── __mocks__/             # Fixture Factory: mockPilots, mockTournament
│   ├── setup.ts               # Global Test Utils + Mocks
│   ├── pilot-card.test.tsx
│   ├── heat-box.test.tsx
│   └── bracket-logic.test.tsx
└── dist/                      # npm run build → Docker Output
```

### Architectural Boundaries

**Data Flow:** `CSV File → Zod Validation → usePilots() → TournamentProvider → Components → localStorage`
**Component Communication:** Alle über `TournamentProvider` + Custom Hooks (kein Prop Drilling)
**Storage Boundaries:** `StorageAdapter` Interface (localStorage MVP → server Future)

### Synthwave Design System Integration

#### Tailwind Configuration (tailwind.config.ts)
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Synthwave Color Palette (aus ux-design-directions.html)
        'void': '#0d0221',           // Tiefes Violett-Schwarz
        'night': '#1a0533',          // Dunkles Violett
        'neon-pink': '#ff2a6d',      // Heißes Pink
        'neon-cyan': '#05d9e8',      // Leuchtendes Cyan
        'neon-magenta': '#d300c5',   // Magenta
        'gold': '#f9c80e',           // Sieger-Gold
        'winner-green': '#39ff14',   // Neon-Grün für Winner
        'loser-red': '#ff073a',      // Neon-Rot für Loser
        'chrome': '#e0e0e0',         // Heller Text
        'steel': '#888888',          // Gedämpfter Text
      },
      boxShadow: {
        'glow-pink': '0 0 20px rgba(255, 42, 109, 0.5)',
        'glow-cyan': '0 0 20px rgba(5, 217, 232, 0.5)',
        'glow-gold': '0 0 20px rgba(249, 200, 14, 0.5)',
        'glow-green': '0 0 15px rgba(57, 255, 20, 0.4)',
        'glow-red': '0 0 15px rgba(255, 7, 58, 0.4)',
      }
    }
  }
}
```

#### Typography Integration (src/globals.css)
```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&display=swap');

:root {
  --font-display: 'Bebas Neue', sans-serif;
  --font-ui: 'Space Grotesk', sans-serif;
}

.font-display { font-family: var(--font-display); }
.font-ui { font-family: var(--font-ui); }
```

### Requirements to Structure Mapping

| FR Kategorie | Design-System Komponenten | Tailwind Classes | CSS Variables |
|--------------|-------------------------|-----------------|---------------|
| **FR1-5 Piloten** | PilotCard mit Neon-Glow | bg-night border-steel glow-pink | --neon-pink, --glow-pink |
| **FR11-16 Heat** | HeatBox mit Toggle-to-Rank | bg-void border-neon-cyan | --neon-cyan, --glow-cyan |
| **FR17-21 Bracket** | BracketTree mit Farbcodierung | text-winner-green text-loser-red | --winner-green, --loser-red |
| **FR36 Branding** | Komplettes synthwave Theme | Alle custom colors | Alle CSS variables |

### Integration Points

**External:** CSV Import/Export (`src/lib/utils.ts`)
**Internal:** `TournamentProvider` → alle Hooks → alle Components
**Future:** `storage.ts.serverAdapter()` → Docker VPS API

### File Organization Patterns

**Features:** `components/ + hooks/ + types/` pro Feature
**Shared:** `lib/ + stores/ + providers/`
**Tests:** Co-located `*.test.tsx` + `__mocks__/`
**Config:** Root-Level (Vite, Tailwind, Docker)

### Development Workflow Integration

```
🧪 Setup: npm create vite@latest fpv-racing-heats --template react-ts
📦 Install: npm i zustand zod react-window + tailwindcss
🚀 Dev: npm run dev → localhost:5173 (HMR + PWA)
🧪 Test: npm test → Co-located + Playwright E2E
🏗️ Build: npm run build → dist/ (Docker-ready)
🐳 Docker: docker build -t fpv-heats . → docker run -p 8080:80
```
