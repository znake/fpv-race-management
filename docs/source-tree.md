# Source Tree Analyse

**Generiert:** 2026-09-13
**Projekt:** FPV Racing Heats Manager
**Quelldateien:** aktueller Stand

## Verzeichnisstruktur

```
heats/
├── src/
│   ├── components/
│   │   ├── bracket/
│   │   │   ├── bracket-tree.tsx
│   │   │   ├── pilot-path-toggle.tsx
│   │   │   ├── svg-connector-lines.tsx
│   │   │   ├── svg-pilot-paths.tsx
│   │   │   ├── zoom-indicator.tsx
│   │   │   ├── heat-boxes/bracket-heat-box.tsx
│   │   │   └── sections/ (bracket-section, quali-section, grand-finale-section, grand-finale-heat-box)
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   │   ├── bracket-utils.ts
│   │   └── export-bracket-html.ts
│   ├── stores/
│   ├── types/
│   └── App.tsx
├── tests/ (26 test files)
│   ├── helpers/
│   ├── bracket-logic.test.ts
│   ├── channel-assignment.test.ts
│   ├── eight-pilots-flow.test.ts
│   ├── export-bracket-html.test.ts
│   ├── export-import.test.ts
│   ├── grand-finale-4-piloten.test.ts
│   ├── heat-assignment.test.ts
│   ├── heat-completion.test.ts
│   ├── lap-time-formatting.test.ts
│   ├── lb-heat-generation.test.ts
│   ├── lb-synchronization-32-pilots.test.ts
│   ├── loser-pool.test.ts
│   ├── pilot-path-calculation.test.ts
│   ├── reset-functions.test.ts
│   ├── round-progression.test.ts
│   ├── app-footer.test.tsx
│   ├── csv-import.test.tsx
│   ├── finale-ceremony.test.tsx
│   ├── heat-results.test.tsx
│   ├── pilot-card.test.tsx
│   ├── pilot-path-integration.test.tsx
│   ├── pilot-path-toggle.test.tsx
│   ├── placement-entry-modal.test.tsx
│   ├── rank-badge.test.tsx
│   ├── tournament-start.test.tsx
│   ├── use-pilots.test.tsx
└── docs/
```

## Single Source of Truth

`src/stores/tournamentStore.ts` owns tournament state. The bracket is derived from `heats[]`.
