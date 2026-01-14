# Entwickler-Leitfaden: FPV Racing Heats

## 🛠️ Entwicklungsumgebung einrichten

### Voraussetzungen
- **Node.js**: Aktuelle LTS Version empfohlen.
- **Package Manager**: npm oder pnpm.

### Installation
```bash
# Repository klonen
git clone <repository-url>
cd heats

# Abhängigkeiten installieren
npm install
```

### Befehle
- `npm run dev`: Startet den Entwicklungsserver auf [http://localhost:5173](http://localhost:5173).
- `npm run build`: Erstellt eine produktionsreife Version im `dist/` Verzeichnis.
- `npm run preview`: Lokal vorschau der Build-Version.
- `npm run test`: Führt die Vitest Unit-Tests aus.
- `npm run lint`: Prüft den Code auf Style-Konformität.

## 🏗️ Neue Features implementieren

### 1. State-Änderungen
Alle globalen Statusänderungen müssen über den `tournamentStore` in `src/stores/tournamentStore.ts` erfolgen. Achte darauf, pure Funktionen aus `src/lib` für komplexe Berechnungen zu nutzen.

### 2. Styling-Richtlinien
- Nutze ausschließlich Tailwind CSS Klassen.
- Für neue UI-Komponenten sollten bestehende Radix UI Primitive verwendet werden.
- Beachte bei UI-Änderungen die Beamer-Lesbarkeit (siehe `tailwind.config.js`).

### 3. Bracket-Erweiterungen
Wenn du neue Regeln für die Progression hinzufügst, bearbeite `src/lib/bracket-logic.ts`. Tests in `tests/` müssen danach aktualisiert werden.

## 🧪 Testing-Strategie
- **Unit Tests**: Für alle Kern-Algorithmen (Heat-Verteilung, Progression).
- **Component Tests**: Für kritische UI-Elemente wie die Ergebniseingabe.
- **E2E Tests**: (Optional) Für den kompletten Turnier-Ablauf von Setup bis Finale.

## 🚀 Deployment
Die Anwendung kann als statische Seite gehostet werden (z.B. GitHub Pages, Vercel, Netlify). Ein Backend ist nicht erforderlich, da alle Daten im LocalStorage verbleiben.
