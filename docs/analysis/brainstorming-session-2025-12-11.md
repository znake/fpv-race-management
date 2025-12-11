---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'FPV Drohnenrennen Turnier-Visualisierung - Browserbasierte Double Elimination Bracket App'
session_goals: 'MVP-Plan erstellen: Was, wo, wann - klein und fokussiert halten'
selected_approach: 'ai-recommended'
techniques_used: ['First Principles Thinking', 'SCAMPER Method', 'Resource Constraints']
ideas_generated: 15
context_file: 'project-context-template.md'
session_active: false
workflow_completed: true
---

# Brainstorming Session Results

**Facilitator:** Jakob
**Date:** 2025-12-11

---

## Session Overview

**Topic:** FPV Drohnenrennen Turnier-Visualisierung - Browserbasierte Double Elimination Bracket App

**Goals:** MVP-Plan erstellen für eine browserbasierte Anwendung zur Verwaltung und Visualisierung von FPV-Drohnenrennen im Double Elimination Format (4er-Heats mit Winner/Loser Bracket). Fokus auf Minimalismus und klare Priorisierung.

---

## Technique Execution Results

### Phase 1: First Principles Thinking

**Fokus:** Was ist das absolute Minimum, das eine FPV-Turniervisualisierung wirklich braucht?

**Fundamentale Wahrheiten identifiziert:**

| Entität | Attribute | Essenz |
|---------|-----------|--------|
| **Pilot** | Name + Bild | Mehr nicht nötig |
| **Heat** | 4 Piloten, Platzierungen | Minimale Datenstruktur |
| **Bracket-Baum** | Winner-Pfad, Loser-Pfad | Die Kernvisualisierung |

**Kern-Metapher:** Die App ist eine **digitale Magnettafel** – Piloten-Bilder die verschoben werden, ein Baum der sich füllt.

**Kern-Interaktionsmodell:**
```
1. Klick auf Pilot → "1" erscheint auf seinem Bild
2. Klick auf nächsten Pilot → "2" erscheint
3. Klick auf "Fertig" → Automatische Zuordnung
   └─ Pilot 1 & 2 → Winner-Bracket
   └─ Pilot 3 & 4 → Loser-Bracket (automatisch)
```

**Wichtige Erkenntnis:** Piloten werden nicht "verschoben", sondern **erscheinen zusätzlich** in der nächsten Runde → komplette Turnier-Historie sichtbar.

---

### Phase 2: SCAMPER Method

**Fokus:** Systematische Feature-Exploration und bewusstes Weglassen

#### E – Eliminate (Weglassen)

**RAUS für MVP:**
- ❌ Online-Sync
- ❌ User Accounts / Login
- ❌ Statistiken
- ❌ Seeding / Setzliste
- ❌ Team-Modus
- ❌ Benachrichtigungen
- ❌ Export (PDF, CSV)
- ❌ Zeitmessung (extern durchgeführt)
- ❌ Punktesystem (ergibt sich aus Bracket-Position)

**DRIN für MVP:**
- ✅ Zuschauer-Ansicht

#### C – Combine (Kombinieren)

**Erkenntnis:** Keine separate Admin- und Zuschauer-App nötig!

**Lösung:** Eine App mit **Tabs**:
- Tab 1: Piloten verwalten
- Tab 2: Bracket-Ansicht
- Tab 3: Aktueller Heat (Fokus-Ansicht)

Admin-Buttons dürfen auf Beamer sichtbar sein – stört niemanden.

#### A – Adapt (Anpassen)

**UI-Prinzipien von der Magnettafel übernommen:**
- Große Piloten-Fotos als visueller Anker
- Sichtbare Verbindungslinien im Baum
- Klare Farbcodierung: **Grün** = Weiter, **Rot** = Loser-Bracket

---

### Phase 3: Resource Constraints

**Fokus:** Brutaler MVP-Cut – Was wenn nur 1 Wochenende Zeit?

#### Kritische Erkenntnis: Ungerade Pilotenanzahlen

**Problem:** Was bei 7, 9, 11, 13 Piloten?

**Lösung:** "Byes" (Freilose) – manche Piloten kommen automatisch weiter

**MVP-Ansatz:** App **schlägt vor**, User **bestätigt**:
```
User: Gibt 11 Piloten ein, klickt "Turnier starten"

App: "Vorschlag:
      • Heat 1: Anna, Ben, Chris, Dana
      • Heat 2: Erik, Flo, Gina, Hans  
      • Heat 3: Ida, Jan, Kim (+ 1 Bye)
      
      OK so? [Bestätigen] [Anpassen]"
```

#### Bild-Upload vereinfacht

**MVP-Lösung:** Nur **URL/Link eingeben** (kein File-Upload)
- Instagram-Profilbild-Link
- Oder jedes beliebige Bild aus dem Web
- Minimal zu implementieren (nur Textfeld)

#### Finale-Sonderbehandlung

- Platzierungen (1, 2, 3, 4) **nur im letzten Heat** anzeigen
- Davor reichen die Farben (Grün/Rot)

---

## MVP Feature-Scope (Finalisiert)

### ✅ MUSS (Kern-Features)

| Feature | Beschreibung |
|---------|--------------|
| Piloten eingeben | Name + Bild-URL |
| Heat-Aufteilung | App schlägt vor, User bestätigt |
| Gewinner auswählen | 2x Klicken + "Fertig" |
| Bracket-Baum | Winner + Loser-Bracket mit Farbcodierung |
| Historie sichtbar | Piloten bleiben wo sie waren |
| Bye-System | Für ungerade Pilotenanzahlen |
| localStorage | Offline-fähig, kein Server |

### ✅ MVP (Nice-to-have, aber machbar)

| Feature | Beschreibung |
|---------|--------------|
| Tabs | Piloten / Bracket / Aktueller Heat |
| Finale-Platzierungen | 1, 2, 3, 4 nur am Ende |
| Farbcodierung | Grün = Weiter, Rot = Loser |

### ❌ SPÄTER (Bewusst rausgelassen)

| Feature | Grund |
|---------|-------|
| Punktesystem | Bracket zeigt Sieger bereits |
| Online-Sync | Nicht nötig für lokales Event |
| User Accounts | Overkill für MVP |
| Export | Später nachrüstbar |
| Zeitmessung | Extern durchgeführt |

---

## Technische Architektur (MVP)

```
┌─────────────────────────────────────────────────┐
│                Browser-App                       │
├─────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────────────┐  │
│  │ Piloten │  │ Bracket │  │ Aktueller Heat  │  │
│  │   Tab   │  │   Tab   │  │      Tab        │  │
│  └─────────┘  └─────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────┤
│                 localStorage                     │
│  • Piloten-Liste (Name, Bild-URL)               │
│  • Heat-Struktur                                 │
│  • Bracket-Zustand                               │
└─────────────────────────────────────────────────┘
```

**Keine Datenbank, kein Backend, kein Server.**

---

## Datenmodell (Entwurf)

```typescript
interface Pilot {
  id: string;
  name: string;
  imageUrl: string;
}

interface Heat {
  id: string;
  pilots: Pilot[];          // 3-4 Piloten
  results?: number[];       // Platzierungen [pilotId, pilotId, ...]
  bracket: 'winner' | 'loser';
  round: number;
}

interface Tournament {
  pilots: Pilot[];
  heats: Heat[];
  currentHeat?: string;     // Heat-ID
  status: 'setup' | 'running' | 'finished';
}
```

---

## User Flow (Zusammenfassung)

```
1. SETUP
   └─ Piloten eingeben (Name + Bild-URL)
   └─ "Turnier starten" klicken
   └─ App schlägt Heat-Aufteilung vor
   └─ Bestätigen oder Anpassen

2. RENNEN
   └─ Heat wird angezeigt (4 Piloten)
   └─ Nach dem Flug: 2 Gewinner anklicken (1, 2)
   └─ "Fertig" klicken
   └─ App aktualisiert Bracket automatisch
   └─ Nächster Heat...

3. FINALE
   └─ Letzter Heat: Platzierungen 1-4 anzeigen
   └─ Sieger steht fest!
```

---

## Nächste Schritte

### Sofort (Diese Woche)

1. **Tech-Stack entscheiden**
   - Empfehlung: React/Vue + localStorage
   - Später Docker-ready

2. **Wireframes/Mockups**
   - Piloten-Tab
   - Bracket-Visualisierung
   - Heat-Fokus-Ansicht

3. **Bracket-Logik recherchieren**
   - Double Elimination Algorithmus
   - Bye-Berechnung für ungerade Zahlen

### Kurzfristig (Nächste 2 Wochen)

4. **MVP implementieren**
   - Piloten-Verwaltung
   - Einfacher Bracket-Baum
   - Gewinner-Auswahl-Mechanik

5. **Testen**
   - Mit 8 Piloten (ideal)
   - Mit ungeraden Zahlen (7, 9, 11)

---

## Session-Zusammenfassung

**Was wir erreicht haben:**

- ✅ Klares MVP-Scope definiert (nicht aufgebläht!)
- ✅ Kern-Interaktionsmodell gefunden (2x Klick + Fertig)
- ✅ Bewusst Features weggelassen (Punkte, Accounts, Sync)
- ✅ Flexible Pilotenanzahl konzipiert (Bye-System)
- ✅ Eine App statt Admin/Zuschauer getrennt
- ✅ Technische Architektur skizziert

**Die App in einem Satz:**

> **Eine digitale Magnettafel für FPV-Turniere: Piloten-Bilder anklicken, Gewinner markieren, Bracket füllt sich automatisch.**

---

*Session durchgeführt am 2025-12-11 mit First Principles Thinking, SCAMPER Method und Resource Constraints.*
