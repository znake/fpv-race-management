# Komponenten-Inventar: FPV Racing Heats

## 🏆 Turnier-Komponenten

### `BracketTree` (Organismus)
Das komplexeste UI-Element. Es visualisiert das gesamte Turnier.
- **Features**: Zoom & Pan, SVG-Verbindungslinien, interaktive Heat-Boxen.
- **Sub-Komponenten**: `QualiSection`, `WinnerBracketSection`, `LoserBracketSection`, `GrandFinaleSection`.

### `ActiveHeatView` (Organismus)
Die Ansicht für das aktuelle Rennen.
- **Features**: Ergebniseingabe (1-4), "On-Deck" Vorschau auf das nächste Rennen.
- **Optimierung**: Spezielle Beamer-Modus CSS-Klassen für maximale Lesbarkeit.

### `PhaseIndicator` (Molekül)
Ein dynamisches Status-Badge.
- **Zweck**: Zeigt dem Benutzer exakt an, in welcher Phase sich das Turnier befindet (z.B. "Quali läuft" oder "LB wartet auf WB").

## 👥 Piloten-Management

### `AddPilotForm`
Formular zum Hinzufügen von Piloten mit Name, Bild-URL und Instagram-Handle.

### `CSVImport`
Ermöglicht den Massen-Import von Piloten aus einer CSV-Datei.

### `PilotCard`
Visualisierung eines einzelnen Piloten mit Bild und Status-Indikatoren.

## 🛠️ Basis-UI (Radix UI / Tailwind)
- **Tabs**: Navigationssystem der Anwendung.
- **Dialog/Modal**: Für Bestätigungen (z.B. Turnier-Reset) und Heat-Details.
- **Buttons**: Konsistente Styling-Varianten (`btn-primary`, `btn-secondary`).

## 🎨 Design-System (Tailwind Config)
- **Farben**: `chrome` (Text), `void` (Hintergrund), `neon-cyan`, `neon-pink`, `gold`.
- **Typografie**: `font-display` für Titel, `font-ui` für Interface-Elemente.
- **Beamer-Klassen**: Spezielle Präfixe wie `text-beamer-display` für optimierte Skalierung auf Großbildschirmen.
