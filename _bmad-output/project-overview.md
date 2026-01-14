# Projekt-Übersicht: FPV Racing Heats

## 📝 Projektzweck
**FPV Racing Heats** ist eine spezialisierte Web-Anwendung zur Verwaltung von FPV-Drohnenrennen. Das System automatisiert die Erstellung von Heats, verwaltet die Piloten-Progression in einem Double-Elimination-System und visualisiert den Turnierverlauf in Echtzeit.

## 🚀 Technologie-Stack
- **Frontend-Framework**: React 18 mit TypeScript
- **Build-Tool**: Vite
- **Styling**: Tailwind CSS
- **UI-Komponenten**: Radix UI, Lucide React
- **State Management**: Zustand mit Persistence-Middleware
- **Testing**: Vitest & Playwright

## 🏗️ Architektur-Typ
- **Monolithische Single-Page-Application (SPA)**
- **Datenhaltung**: Client-seitig im LocalStorage (via Zustand Persistence)
- **Logik-Architektur**: Dynamisches, Pool-basiertes Double-Elimination System

## 📂 Hauptverzeichnis-Struktur
- `src/app/`: App-Entrypoints und Layouts
- `src/components/`: UI-Komponenten, unterteilt in Funktionsbereiche (Bracket, Heats, Pilot-Management)
- `src/lib/`: Kern-Algorithmen und Hilfsfunktionen (Bracket-Logik, Heat-Verteilung)
- `src/stores/`: Zentraler State-Store (`tournamentStore`)
- `docs/`: Vorhandene Projektdokumentation und Anforderungsdokumente

## 🔗 Dokumentations-Referenz
- [Architektur-Details](./architecture.md)
- [Quellcode-Struktur](./source-tree-analysis.md)
- [Komponenten-Inventar](./component-inventory.md)
- [Entwickler-Leitfaden](./development-guide.md)
