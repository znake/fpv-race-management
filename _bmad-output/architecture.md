# Architektur-Dokumentation: FPV Racing Heats

## 🏗️ Architektur-Philosophie
Die Anwendung folgt einem **logik-zentrierten, reaktiven Ansatz**. Die Kernregeln des Rennsports sind in reinen TypeScript-Modulen (`src/lib`) isoliert, während React die Darstellung und Benutzerinteraktion übernimmt.

## 📊 Daten-Architektur & State Management

### Zentraler Store (`Zustand`)
Der `tournamentStore` verwaltet drei primäre Datenströme:
1. **Piloten-Pool**: Alle registrierten Teilnehmer.
2. **Heats**: Eine dynamische Liste aller geplanten und abgeschlossenen Rennen.
3. **Bracket-Status**: Sets für `winnerPilots`, `loserPilots` und `eliminatedPilots`.

### Datenfluss
1. **Input**: Piloten werden importiert (CSV) oder manuell angelegt.
2. **Initialisierung**: Heats werden basierend auf der Pilotenzahl generiert.
3. **Loop**:
   - Heat wird gestartet (Status `active`).
   - Ergebnisse werden eingegeben.
   - `submitHeatResults` berechnet die Progression.
   - Neue Heats werden bei Bedarf dynamisch generiert.
4. **Finale**: Wenn WB und LB Finale abgeschlossen sind, wird das Grand Finale erzeugt.

## 🔄 Turnier-Logik (Double Elimination)

### Progression-Regeln
- **Qualifikation**: Top 2 → Winner Bracket (WB), Rest → Loser Bracket (LB).
- **Winner Bracket**: Top 2 bleiben im WB, Rest fällt ins LB.
- **Loser Bracket**: Top 2 kommen weiter im LB, Rest wird eliminiert.
- **Grand Finale**: Besteht aus 4 Piloten (Top 2 WB + Top 2 LB).

## 🎨 Frontend-Architektur

### Komponentenhierarchie
- **Layout**: Zentrale Steuerung über Tabs (Setup, Heats, Bracket, Leaderboard).
- **Views**:
  - `ActiveHeatView`: Große, Beamer-optimierte Ansicht für das aktuelle Rennen.
  - `BracketTree`: Interaktive Visualisierung des Fortschritts.
  - `PilotManagement`: CRUD-Operationen für Teilnehmer.

### Visualisierung (Theming)
Das Projekt nutzt ein **Cyberpunk/Racing-Theme**:
- Dunkler Hintergrund (`void`, `night`).
- Leuchtende Akzentfarben (`neon-cyan`, `neon-pink`, `gold`).
- Spezielle Schriftarten für Beamer-Lesbarkeit.

## 🔒 Sicherheit & Validierung
- **Zod**: Validiert alle Piloten-Daten und Heat-Ergebnisse.
- **Consistency Checks**: Verhindert das Reaktivieren von Heats mit ungültigen Pilotenzahlen oder Duplikaten.
