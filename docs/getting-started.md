# Getting Started

**Projekt:** FPV Racing Heats Manager
**Datum:** 2026-01-19

---

## Voraussetzungen

- Node.js 18+
- npm oder yarn

---

## Installation

```bash
# Repository klonen
git clone <repository-url>
cd heats

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die App ist unter `http://localhost:5173` verfügbar.

---

## Projektstruktur Übersicht

```
heats/
├── src/
│   ├── components/     # React-Komponenten
│   ├── stores/         # Zustand State Management
│   ├── lib/            # Business-Logik & Utilities
│   ├── hooks/          # Custom React Hooks
│   ├── types/          # TypeScript-Definitionen
│   └── App.tsx         # Haupt-Komponente
├── tests/              # Test-Dateien
├── docs/               # Dokumentation
└── package.json        # Abhängigkeiten & Scripts
```

---

## NPM Scripts

| Script | Beschreibung |
|--------|--------------|
| `npm run dev` | Startet Entwicklungsserver (Port 5173) |
| `npm run build` | Erstellt Production Build |
| `npm run preview` | Vorschau des Production Builds |
| `npm test` | Startet Tests im Watch-Mode |
| `npm run test:run` | Führt Tests einmalig aus |

---

## Turnier-Ablauf

### 1. Piloten hinzufügen (7-60)

**Manuell:**
- Name eingeben (min. 3 Zeichen)
- Bild-URL eingeben
- Optional: Instagram-Handle (@...)

**CSV-Import:**
- CSV mit Spalten: `name`, `imageUrl`, `instagramHandle` (optional)
- Klick auf "CSV Import" → Datei hochladen

### 2. Turnier starten

- Bei 7-60 Piloten erscheint "Turnier starten"
- Heats werden automatisch in 3er/4er-Gruppen aufgeteilt
- In der Heat-Zuweisung können Piloten per Drag & Drop verschoben werden
- "Bestätigen" startet das Turnier

### 3. Heats durchführen

- Aktiver Heat wird oben angezeigt
- Platzierungen 1-4 per Dropdown eingeben
- "Ergebnisse speichern" schließt den Heat ab
- Nächster Heat wird automatisch aktiviert

### 4. Bracket-Fortschritt

**Qualification:**
- Platz 1+2 → Winner Bracket
- Platz 3+4 → Loser Bracket

**Winner Bracket:**
- Platz 1+2 → bleiben im WB
- Platz 3+4 → fallen ins LB

**Loser Bracket:**
- Platz 1+2 → bleiben im LB
- Platz 3+4 → eliminiert

**Finale:**
- WB Finale → Top 2 für Grand Finale
- LB Finale → Top 2 für Grand Finale
- Grand Finale → Final Ranking (4 Piloten)

### 5. Siegerehrung

- Nach Grand Finale: Top 4 Podium
- "Neues Turnier" setzt zurück (Piloten bleiben)

---

## Tastenkürzel

| Kürzel | Aktion |
|--------|--------|
| `Ctrl/Cmd + Scroll` | Zoom im Bracket |
| `Drag` | Pan im Bracket |
| `Doppelklick + Ctrl` | Zoom zurücksetzen |

---

## Troubleshooting

### Daten werden nicht gespeichert

- Prüfen ob localStorage verfügbar ist (Private Mode kann blockieren)
- Browser-Console auf Fehler prüfen

### Bracket zeigt keine Heats

- Turnier muss gestartet sein
- Prüfen ob Piloten (7-60) registriert sind

### Heat-Ergebnisse werden nicht übernommen

- Alle Piloten im Heat müssen eine Platzierung haben
- Keine doppelten Platzierungen erlaubt

---

## Weiterführende Dokumentation

- [Architektur Deep-Dive](./architecture-deep-dive.md)
- [Tech-Stack](./tech-stack.md)
- [Source Tree](./source-tree.md)
- [PRD](./prd.md)
