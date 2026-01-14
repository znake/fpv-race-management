# Quellcode-Struktur: FPV Racing Heats

Diese Analyse beschreibt die Verzeichnisstruktur und die Verantwortung der einzelnen Module im Projekt.

## 🌳 Verzeichnis-Baum

```text
heats/
├── _bmad/               # BMAD Agenten-Konfigurationen und Workflows
├── _bmad-output/        # Generierte Artefakte und Dokumentation
├── docs/                # Projektspezifische Dokumentation
├── public/              # Statische Assets (Icons, etc.)
├── src/
│   ├── app/             # Haupt-Anwendungskomponenten
│   ├── components/      # UI-Komponenten (Atoms, Molecules, Organisms)
│   │   ├── bracket/     # Alles rund um die Turnierbaum-Visualisierung
│   │   ├── tabs/        # Tab-Navigation für die verschiedenen Ansichten
│   │   └── ui/          # Wiederverwendbare Basis-UI-Elemente (Radix/Tailwind)
│   ├── hooks/           # Custom React Hooks (z.B. Zoom/Pan Logik)
│   ├── lib/             # Die "Gehirne" der Anwendung (Pure Logic)
│   │   ├── bracket-logic.ts       # Regeln für die Piloten-Progression
│   │   ├── heat-distribution.ts   # Algorithmus für 3er/4er Heats
│   │   └── schemas.ts             # Zod-Validierungsschemas
│   ├── stores/          # Zustand State Management
│   │   └── tournamentStore.ts     # Der "Single Source of Truth" für das Turnier
│   ├── types/           # TypeScript Typ-Definitionen
│   ├── App.tsx          # Root Komponente
│   └── main.tsx         # Entry Point
├── tests/               # Test-Suiten (Vitest/Playwright)
├── vite.config.ts       # Vite Konfiguration
└── tailwind.config.js   # Styling Konfiguration
```

## 🎯 Kritische Module

### 1. `src/stores/tournamentStore.ts`
Das Herzstück der Anwendung. Hier wird der gesamte Zustand des Turniers (Piloten, Heats, Ergebnisse) verwaltet. Er nutzt die `persist`-Middleware, um den Fortschritt im Browser zu speichern.

### 2. `src/lib/bracket-logic.ts`
Enthält die Regeln für das Double-Elimination System. Diese Datei ist entkoppelt von React und enthält pure Funktionen zur Berechnung des nächsten Schritts eines Piloten.

### 3. `src/components/bracket/`
Ein komplexes Modul zur Visualisierung des Turnierbaums. Es implementiert Zoom & Pan Funktionalität und nutzt SVG-Linien, um die Verbindungen zwischen den Heats darzustellen.

### 4. `src/lib/heat-distribution.ts`
Implementiert den Algorithmus, der sicherstellt, dass bei jeder Teilnehmerzahl (7-60) eine gültige Verteilung von 3er- und 4er-Heats gefunden wird, wobei 4er-Heats priorisiert werden.
