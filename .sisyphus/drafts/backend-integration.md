# Draft: PocketBase Backend Integration für Heats

## Ausgangssituation (bestätigt)
- **Bestehendes Frontend**: React/TypeScript SPA mit Vite
- **State Management**: Zustand mit localStorage Persistenz
- **Datenmodelle**: Pilot, Heat, TournamentState in `src/types/tournament.ts`
- **Turnier-Logik**: Komplexe Double-Elimination Bracket-Logik bereits implementiert
- **Styling**: Tailwind CSS, Synthwave Theme

## User-Anforderungen (BESTÄTIGT)

### Admin-Workflow ✅
- Bestehendes Frontend weiternutzen
- Daten automatisch zu PocketBase synchronisieren
- Volle Kontrolle: Ränge eingeben, Piloten verwalten, Turnier steuern

### Gäste-Experience ✅
- **Gleiche UI** wie Admin (Synthwave Theme)
- **Voller Read-Only Zugriff** auf:
  - Aktueller Heat + Piloten
  - Nächste Heats (Vorschau "Du bist in Heat 7")
  - Ergebnisse + Platzierungen
  - Bracket-Visualisierung (WB/LB)
  - Zeiten pro Heat
- **KEINE Mutationen**: Keine Ränge ändern, kein Reset, keine Piloten löschen

### Daten-Architektur ✅
- **Client-First mit PocketBase Sync**
- Zustand bleibt Master für Turnier-Logik
- PocketBase für:
  - Persistenz (statt localStorage)
  - Gäste-Zugriff (Real-time Subscriptions)
  - Export

### Real-time ✅
- **Automatisch bei jeder Änderung**
- Jede Admin-Aktion synct sofort zu PocketBase
- Gäste sehen Live-Updates via SSE

### Export ✅
- **CSV**: Für Excel/Sheets
- **JSON**: Für technische Weiterverarbeitung

### Deployment ✅
- **Bestehender VPS mit Coolify**
- PocketBase als Docker Container in Coolify

## Kritische Entscheidungen (aus Metis Review)

### Offline-Verhalten ✅
- **Weitermachen + später syncen**
- Admin arbeitet lokal weiter bei Verbindungsverlust
- Sync-Queue speichert Änderungen
- Automatischer Upload bei Reconnect

### Gast-Zugang ✅
- **Öffentlicher Link**
- Jeder mit dem Link kann zuschauen
- Keine PIN-Schutz nötig

### Daten-Migration ✅
- **Es gibt eine Import-Funktion**
- System soll nicht mit leeren Daten starten
- Import-Funktion beibehalten

### Multi-Admin ✅
- **Nur ein Admin**
- System geht von einem Admin-Gerät aus
- Kein Konflikt-Handling nötig

### Skalierung ✅
- **Klein (bis 30 Gäste)**
- Lokales Rennen
- PocketBase reicht locker aus

## Technische Entscheidung
- **Backend**: PocketBase (Single Binary, SQLite, Real-time SSE)
- **Grund**: 
  - Built-in Admin UI für Dateneingabe
  - Real-time Subscriptions für Live-Updates
  - Gast-Zugriff via leere API-Rules
  - Läuft auf $5 VPS
  - Einfaches Coolify Deployment

## Research Findings
- PocketBase JS SDK unterstützt Real-time Subscriptions
- API-Rules auf `""` = öffentlicher Read-Zugriff ohne Login
- Deployment: Single Binary, ~50-100MB RAM
- Coolify unterstützt PocketBase nativ
