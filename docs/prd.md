---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
inputDocuments:
  - 'docs/README.md'
  - 'docs/tournament-rules.md'
  - 'docs/prd-validation-report.md'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 3
workflowType: 'prd'
lastStep: 12
project_name: 'FPV Racing Heats'
user_name: 'Jakob'
date: '2026-02-02'
---

# Product Requirements Document - FPV Racing Heats

**Author:** Jakob
**Date:** 2026-02-02 (aktualisiert auf Implementierungsstand)

## Executive Summary

**FPV Racing Heats** ist eine browserbasierte Turnier-App für FPV-Drohnenrennen, entwickelt für FPV Oberösterreich. Die App ermöglicht es, Double-Elimination-Turniere mit 4er-Heats einfach zu verwalten und live zu visualisieren – ohne Server, ohne Accounts, ohne Einarbeitung.

**Das Problem:** FPV-Turniere zu organisieren erfordert aktuell entweder komplexe Online-Tools mit Einarbeitungszeit oder manuelle Lösungen wie Whiteboards. Organisatoren verlieren den Überblick, Piloten wissen nicht wann sie dran sind, und Zuschauer können nicht mitfiebern.

**Die Lösung:** Eine digitale Magnettafel – Piloten eingeben, Gewinner anklicken, fertig. Die App schlägt Heat-Aufteilungen vor, verwaltet Winner- und Loser-Brackets automatisch, und zeigt den kompletten Turnierverlauf auf einem Beamer für alle sichtbar.

### Was dieses Produkt besonders macht

| Differentiator | Bedeutung |
|----------------|-----------|
| **Zero Einarbeitung** | Intuitiv wie eine Magnettafel – 2 Klicks pro Heat |
| **Offline-first** | localStorage, kein Internet oder Server nötig |
| **PWA-fähig** | Installierbar als App auf iOS/Android mit Vollbildmodus |
| **FPV OÖ Branding** | Synthwave-Design mit eigenen Farben, nicht generisch |
| **4er-Heat-optimiert** | Genau auf das Double-Elimination-Format zugeschnitten |
| **Sichtbare Historie** | Piloten bleiben wo sie waren – kompletter Turnierverlauf |

## Project Classification

**Technischer Typ:** Web Application (SPA)
**Domain:** General (Community/Event-Tool)
**Komplexität:** Medium
**Projekt-Kontext:** Greenfield - Neues Projekt

**Technologie-Ansatz:** Reine Browser-App mit localStorage-Persistenz. Keine Datenbank, kein Backend, kein Server. Später Docker-ready für einfaches Hosting.

## Success Criteria

### User Success

#### Organisator (Orga-Team)

| Kriterium | Messung | Ziel |
|-----------|---------|------|
| **Aha!-Moment** | Nach erstem abgeschlossenem Heat | Erkenntnis: "Das ist echt eine Zeitersparnis" |
| **Setup-Zeit** | Zeit von Piloten-Import bis Turnier-Start | < 5 Minuten |
| **Heat-Eingabe** | Zeit für Ergebnis-Eintragung | < 10 Sekunden (2 Klicks + Fertig) |
| **Entlastung** | "Wann bin ich dran?"-Fragen pro Event | < 5 |
| **Wiederverwendung** | Feedback nach Event | "Nächstes Mal wieder" |

#### Piloten (Die Racer)

| Kriterium | Messung | Ziel |
|-----------|---------|------|
| **Selbstständigkeit** | Piloten finden sich ohne Nachfragen zum Heat | ≥ 95% |
| **Orientierung** | Bracket-Stand auf einen Blick verständlich | Sofort erkennbar |
| **Rechtzeitigkeit** | Piloten verpassen ihren Heat | 0 |

#### Zuschauer (Das Publikum)

| Kriterium | Messung | Ziel |
|-----------|---------|------|
| **Verständnis** | Zuschauer verstehen, wer gerade fliegt | Sofort durch Visualisierung |
| **Mitfiebern** | Turnierverlauf nachvollziehbar | Bracket zeigt klaren Stand |

### Business Success

Da FPV Racing Heats ein Community-Tool ist, gelten Community-Ziele statt klassischer Business-Metriken:

| Ziel | Beschreibung | Zeitrahmen |
|------|--------------|------------|
| **Erstes Event erfolgreich** | Turnier ohne kritische Fehler durchgeführt | Erstes Event |
| **Branding** | App repräsentiert FPV OÖ professionell | Launch |
| **Weiterempfehlung** | Interesse von anderen FPV-Gruppen/RC-Szene | 3-6 Monate |

### Technical Success

| Kriterium | Ziel |
|-----------|------|
| **Stabilität** | Kein App-Absturz während Event |
| **Datenintegrität** | Kein Datenverlust (localStorage persistent) |
| **Bracket-Korrektheit** | Keine falschen Zuordnungen oder Berechnungsfehler |
| **Offline-Fähigkeit** | Funktioniert ohne Internetverbindung |
| **Beamer-Tauglichkeit** | Lesbar auf großer Projektion |

### Anti-Metriken (Was NICHT passieren darf)

| Anti-Metrik | Konsequenz |
|-------------|------------|
| **Turnier-Stopp** | Event muss wegen App-Fehler unterbrochen werden |
| **Falscher Stand** | Bracket zeigt falsche Gewinner/Verlierer |
| **Datenverlust** | Piloten oder Ergebnisse gehen verloren |
| **Workaround nötig** | Orga muss auf Zettel/Whiteboard zurückgreifen |

## Product Scope

### MVP - Minimum Viable Product

**MUSS funktionieren:**

| Feature | Beschreibung |
|---------|--------------|
| Piloten-Verwaltung | Name + Bild-URL + optional Instagram-Handle eingeben, bearbeiten, löschen, als "dropped out" markieren |
| CSV-Import | Google Forms Export → App in Sekunden, mit Drag & Drop und Vorlage-Download |
| Duplikaterkennung | Warnung bei doppelten Piloten-Namen (case-insensitive) |
| Heat-Aufteilung | App schlägt vor, User kann per Drag & Drop anpassen oder per Shuffle zufällig neu verteilen |
| Flexible Heat-Größen | Unterstützt 3er- und 4er-Heats für beliebige Pilotenanzahlen (7-60) |
| Gewinner-Auswahl | 2x Klicken + "Fertig" → automatische Bracket-Zuordnung |
| Double Elimination | Winner-Bracket + Loser-Bracket |
| Bracket-Visualisierung | Interaktiver Baum mit Zoom/Pan, Farbcodierung (Cyan/Grün/Rot/Gold) |
| Piloten-Pfade | Visualisierung der Flugwege durch das Turnier mit Toggle und Hover-Highlight |
| Channel-Anzeige | Raceband-Channels (R1, R3, R4, R6, R8) pro Heat-Position mit intelligenter Optimierung |
| Sichtbare Historie | Piloten bleiben wo sie waren |
| Tabs | Piloten / Bracket / Aktueller Heat |
| On-Deck Vorschau | Nächster Heat wird unten angezeigt → Piloten können Drohnen vorbereiten |
| Finale | Platzierungen 1, 2, 3, 4 anzeigen |
| FPV OÖ Branding | Synthwave-Design mit Farben und Logo |
| localStorage | Offline-fähig, kein Server |
| JSON/CSV Export | Turnier-Backup (JSON) und Ergebnisliste (CSV) exportieren |
| JSON Import | Turnier-Stand aus Backup wiederherstellen |
| PWA | Als App installierbar auf iOS/Android mit Vollbildmodus |
| Keyboard Shortcuts | Schnelle Eingabe (P, Escape) |
| Rundenzeiten | Optionale Zeiterfassung pro Pilot nach Heat |

### Growth Features (Post-MVP)

| Feature | Priorität | Status |
|---------|-----------|--------|
| ~~Zeiterfassung pro Pilot~~ | ~~Hoch~~ | ✅ Implementiert |
| Countdown-Timer | Hoch | Offen |
| Nachrichten-Textfeld | Mittel | Offen |
| Turnier-Templates | Mittel | Offen |
| Statistiken | Niedrig | Offen |

### Vision (Future)

| Feature | Beschreibung |
|---------|--------------|
| Konfigurierbares Branding | Nicht nur FPV OÖ |
| Docker-Deployment | Einfaches Hosting |
| QR-Code | Mobile Bracket-Ansicht für Zuschauer |
| Export | PDF/CSV für Dokumentation |

## User Journeys

### Journey 1: Thomas vom Orga-Team – Vom Chaos zur Kontrolle

Thomas ist seit drei Jahren bei FPV OÖ und hat schon dutzende Turniere mitorganisiert. Heute steht er wieder neben der Strecke, Laptop aufgeklappt, Beamer angeschlossen. Früher bedeutete das: Excel-Tabelle, Whiteboard, und ständig Piloten die fragen "Wann bin ich dran?". Letztes Mal hat er einen Heat vergessen anzusagen und zwei Piloten waren nicht rechtzeitig am Start.

Diesmal hat er FPV Racing Heats als PWA auf seinem iPad installiert – läuft im Vollbildmodus, keine Browser-UI. Die 23 Piloten sind bereits drin – er hat gestern Abend einfach den CSV-Export aus Google Forms importiert. Er bemerkt, dass zwei Piloten denselben Namen haben – die App warnt ihn sofort. Er ändert einen Namen schnell ab.

Ein Klick auf "Turnier starten", die App schlägt die Heat-Aufteilung vor: 4-4-4-4-4-3. Thomas sieht, dass Lisa und Max in denselben Heat fallen – er verschiebt Lisa per Drag & Drop in einen anderen Heat. Dann klickt er "Shuffle" für eine zufällige Verteilung. Die Channel-Optimierung sorgt dafür, dass Piloten wo möglich auf ihrem bevorzugten Kanal bleiben.

Der erste Heat läuft. Nach dem Rennen klickt Thomas die Piloten in der Reihenfolge ihrer Platzierung an und gibt die Rundenzeiten ein (123 für 1:23). Das Bracket aktualisiert sich sofort. Er zoomt etwas heraus um den Überblick zu behalten.

Nach drei Heats merkt er: Kein einziger Pilot hat gefragt wann er dran ist. Er exportiert kurz ein JSON-Backup – sicher ist sicher. Am Ende des Tages exportiert er die Ergebnisse als CSV für die Vereins-Homepage. "Das war der entspannteste Turniertag seit Jahren."

### Journey 2: Lisa die Pilotin – Vom Nachfragen zum Selbstständig-Sein

Lisa fliegt seit einem Jahr FPV, aber heute ist ihr erstes richtiges Turnier. Sie ist nervös – nicht wegen des Fliegens, sondern weil sie keine Ahnung hat wie Double Elimination funktioniert und Angst hat, ihren Heat zu verpassen.

Als sie ankommt, sieht sie den großen Beamer-Screen. Dort ist ein Bracket zu sehen, und sie findet sofort ihr Foto mit Namen. Sie ist in Heat 2. Neben ihrem Namen sieht sie "R1" – ihr zugewiesener Raceband-Channel. Gut, sie kann auf ihrem bevorzugten Kanal bleiben.

Auf dem "Aktueller Heat"-Tab sieht sie: Heat 1 läuft gerade, sie ist als nächstes dran. Unten die "On-Deck"-Vorschau zeigt: "Lisa, Max, Anna – bitte Drohnen vorbereiten". Perfekt – noch Zeit für einen Akku-Check und Kanal-Einstellung.

Ihr erster Heat: Sie wird Dritte. Kurz Panik – bin ich raus? Aber nein, sie sieht sich im Loser-Bracket, rot markiert. Sie klickt auf den Piloten-Pfade-Toggle (jemand sagte ihr, Taste P funktioniert auch). Plötzlich sieht sie ihren Weg durch das Turnier als gelbe Linie – sie ist noch dabei! Sie fährt mit der Maus über ihr Foto und sieht sofort ihren Pfad hervorgehoben.

Im Bracket-Tab kann sie genau nachvollziehen: Noch zwei Siege im Loser-Bracket und sie könnte ins Finale kommen. Sie zoomt in den Baum rein um die Details zu sehen, schiebt die Ansicht etwas nach rechts.

Drei Stunden später steht sie tatsächlich im kleinen Finale – Platz 4. Nicht schlecht fürs erste Turnier! Ihre Rundenzeiten wurden mitgeschrieben, sie kann sie im Bracket sehen. Und sie hat den ganzen Tag niemanden fragen müssen, wann sie dran ist.

### Journey 3: Familie Huber – Vom Verwirrtsein zum Mitfiebern

Familie Huber ist zufällig beim Event gelandet – der Sohn wollte "die coolen Drohnen" sehen. Anfangs verstehen sie gar nichts. Kleine Drohnen rasen durch Tore, vier gleichzeitig, und dann ist es vorbei?

Dann schauen sie auf den Beamer. Da sind vier große Fotos mit Namen: "Heat 5 – Marco, Julia, Kevin, Sarah". Ah, das sind die vier die gerade fliegen! Die Drohnenfarben passen zu den Rahmen um die Fotos. Jeder hat einen kleinen Badge mit "R1", "R3", "R6", "R8" – die Funkkanäle.

Nach dem Heat tippen die Kinder aufgeregt: "Papa, schau! Marco und Julia sind grün, die sind weiter! Kevin und Sarah sind jetzt da unten im roten Bereich." Der Vater versteht langsam: Das ist wie ein Pokal-System, nur dass man zweimal verlieren muss um rauszufliegen.

Ein Orga-Mitglied aktiviert die Piloten-Pfade auf dem Screen. Plötzlich sehen alle farbige Linien durch den Bracket-Baum – die Reise jedes Piloten durchs Turnier. "Schau, Papa! Die gelbe Linie ist Marco – der ist im Winner Bracket durchgekommen, dann einmal runter ins Loser Bracket, und jetzt kämpft er sich wieder hoch!"

Eine Stunde später fiebert die ganze Familie mit Marco mit – der ist jetzt im Loser-Bracket-Finale. Der Screen zeigt die Kanäle, die Zeiten, die Historie. Als Marco es tatsächlich ins große Finale schafft (Gold-Highlight!), jubeln sie mit. "Das ist ja spannender als Fußball!", sagt die Mutter. Sie sieht auf ihrem Handy die mobile Ansicht – jemand hat einen QR-Code geteilt – und kann auch von weiter weg mitfiebern.

### Journey Requirements Summary

Diese Journeys zeigen, welche Capabilities die App braucht:

| Journey | Revealed Requirements |
|---------|----------------------|
| **Thomas (Orga)** | PWA für mobile Nutzung, CSV-Import mit Drag & Drop, Duplikaterkennung, Heat-Vorschlag mit Drag & Drop Anpassung, Shuffle-Funktion, Channel-Optimierung, Keyboard-Shortcuts (1-4), Rundenzeiten-Eingabe, Zoom/Pan im Bracket, JSON-Backup-Export, CSV-Ergebnis-Export |
| **Lisa (Pilot)** | Sichtbare Piloten-Fotos im Bracket, Channel-Badges (R1-R8), klarer aktueller Heat-Status mit On-Deck-Vorschau, Loser-Bracket-Visualisierung, Piloten-Pfade Toggle mit Hover-Highlight, Zoom/Pan für Detail-Ansicht, Farbcodierung (Cyan/Grün/Rot/Gold), sichtbare Rundenzeiten |
| **Familie Huber (Zuschauer)** | Große lesbare Fotos/Namen auf Beamer, Heat-Fokus-Ansicht mit Channel-Anzeige, verständliche Bracket-Darstellung mit Piloten-Pfade-Visualisierung, visuelle Turnier-Historie, mobile Ansicht für Zuschauer |

### Neue Features aus aktualisierten Journeys

| Feature | Journey | Nutzen |
|---------|---------|--------|
| **PWA Installation** | Thomas | Mobile Nutzung am Event-Standort |
| **Duplikaterkennung** | Thomas | Datenqualität bei Import |
| **Drag & Drop Heat-Zuweisung** | Thomas | Manuelle Anpassung möglich |
| **Shuffle-Funktion** | Thomas | Zufällige faire Verteilung |
| **Channel-Optimierung** | Thomas & Lisa | Weniger Kanalwechsel, schnellere Vorbereitung |
| **Keyboard Shortcuts** | Thomas | Schnellere Ergebniseingabe |
| **Rundenzeiten** | Thomas & Lisa | Zeitmessung für Ranglisten |
| **Zoom/Pan im Bracket** | Thomas & Lisa | Navigation in komplexen Turnieren |
| **Piloten-Pfade** | Lisa & Familie Huber | Nachvollziehbare Turnier-Historie |
| **JSON Backup/Import** | Thomas | Datensicherheit |
| **CSV Export** | Thomas | Dokumentation & Weitergabe |
| **On-Deck Vorschau** | Lisa | Frühzeitige Vorbereitung |
| **Mobile Ansicht** | Familie Huber | Zuschauer-Engagement |

## Web Application Specific Requirements

### Project-Type Overview

FPV Racing Heats ist eine Single-Page-Application (SPA) für den lokalen Einsatz auf einem Orga-Laptop mit Beamer-Projektion. Kein Server, keine Internet-Abhängigkeit, keine Multi-Device-Synchronisation.

### Technical Architecture Considerations

| Aspekt | Entscheidung | Begründung |
|--------|--------------|------------|
| **Architektur** | SPA (Single Page Application) | Kein Page-Reload, flüssige Interaktion |
| **Rendering** | Client-side mit async Loading | Keine Blockierung der UI während Datenverarbeitung |
| **State Management** | localStorage-basiert | Offline-fähig, persistiert Browser-Neustart |
| **Backend** | Keines | Reine Browser-App ohne Server |

### Browser Support

| Browser | Support-Level |
|---------|---------------|
| **Chrome (aktuell)** | ✅ Primär - Hauptentwicklung und Test |
| **Firefox, Safari, Edge** | ⚠️ Sekundär - sollte funktionieren, nicht aktiv getestet |
| **Ältere Browser / IE** | ❌ Nicht unterstützt |

**Zielumgebung:** Ein dedizierter Orga-Laptop mit aktuellem Chrome-Browser.

### Responsive Design

| Viewport | Priorität | Anwendung |
|----------|-----------|-----------|
| **Desktop/Laptop (1920x1080)** | ✅ Primär | Orga-Laptop + Beamer |
| **Tablet** | ⚠️ Nice-to-have | Eventuell mobiler Orga-Einsatz |
| **Mobile** | ❌ Nicht priorisiert | Kein aktiver Use Case |

**Beamer-Optimierung:** Große Schrift, hoher Kontrast, lesbar aus 10m Entfernung.

### Performance Targets

| Metrik | Ziel | Begründung |
|--------|------|------------|
| **Initial Load** | < 3 Sekunden | Schneller Start am Event-Tag |
| **Heat-Wechsel** | < 500ms | Keine spürbare Verzögerung |
| **Ergebnis-Eingabe** | Instant | 2 Klicks + Fertig ohne Warten |
| **Bracket-Update** | < 200ms | Sofortige visuelle Rückmeldung |

### SEO & Accessibility

| Aspekt | Entscheidung |
|--------|--------------|
| **SEO** | Nicht relevant - lokale App ohne Internet |
| **Accessibility (WCAG)** | Nicht priorisiert - spezifischer Use Case mit Beamer-Fokus |

### UI/UX Considerations

#### Synthwave-Design

Die App verwendet ein durchgängiges Synthwave-Theme mit animierten visuellen Effekten, optimiert für Beamer-Präsentation bei Live-Events.

#### Heat-Fokus-Ansicht mit "On-Deck" Vorschau

Die aktuelle Heat-Ansicht zeigt zusätzlich den **nächsten Heat** als Vorschau an:

| Element | Beschreibung |
|---------|--------------|
| **Aktueller Heat** | Große Piloten-Fotos, Ergebnis-Eingabe-Buttons |
| **Nächster Heat (On-Deck)** | Kleinere Anzeige unten: Namen/Fotos der nächsten Piloten mit Hinweis "Bitte Drohnen vorbereiten" |
| **Zweck** | Piloten können während aktuellem Heat bereits Setup machen (Funkverbindung, Kanal-Check) |

#### Bracket-Farbcodierung

| Farbe | Bedeutung |
|-------|-----------|
| Cyan | Qualification Heats |
| Grün | Winner Bracket |
| Rot | Loser Bracket |
| Gold | Grand Finale |

#### Interaktive Navigation

| Aktion | Methode |
|--------|---------|
| Zoom | Mausrad oder Touchpad |
| Pan | Ziehen mit Maus |
| Reset | Doppelklick |
| Piloten-Pfade | Toggle-Button oder Taste P |

#### Keyboard Shortcuts

| Kürzel | Aktion |
|--------|--------|
| `P` | Piloten-Pfade ein-/ausblenden |
| `Escape` | Modal schließen |
| `Scroll` | Zoom im Bracket |

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP-Ansatz:** Problem-Solving MVP
**Begründung:** FPV Racing Heats löst ein konkretes, klar definiertes Problem (Turnier-Chaos) mit einer fokussierten Lösung (digitale Magnettafel). Der Scope ist bewusst schlank gehalten.

**Ressourcen-Anforderungen:**
- Team: 1-2 Entwickler
- Zeitrahmen: 2-4 Wochen bis erstes testbares MVP
- Skills: Frontend (SPA), localStorage, Bracket-Algorithmus

### MVP Feature Set (Phase 1)

**Core User Journeys unterstützt:**
- ✅ Thomas (Orga): Kompletter Flow von Import bis Finale
- ✅ Lisa (Pilot): Selbstständige Orientierung im Bracket
- ✅ Familie Huber (Zuschauer): Verständliche Visualisierung

**Must-Have Capabilities (alle validiert):**

| Feature | Begründung für MVP |
|---------|-------------------|
| Piloten-Verwaltung | Kernfunktion - ohne geht nichts |
| CSV-Import | Zeitersparnis bei 20+ Piloten |
| Heat-Aufteilung mit Vorschlag | Kernfunktion - automatisiert Turnier-Logik |
| Flexible Heat-Größen (3er/4er) | Notwendig für beliebige Pilotenanzahlen |
| Gewinner-Auswahl (2 Klicks + Fertig) | Kerninteraktion - das Herzstück |
| Double Elimination Bracket | Kernfunktion - Winner + Loser Bracket |
| Bracket-Visualisierung mit Farbcodierung | Kernfunktion - visuelle Orientierung |
| Sichtbare Historie | Turnierverlauf nachvollziehbar |
| Tabs (Piloten/Bracket/Heat) | Beamer-optimierte Navigation |
| On-Deck Vorschau | Reduziert Wartezeit, optimiert Event-Flow |
| Finale Platzierungen (1-4) | Abschluss des Turniers |
| FPV OÖ Branding | Professioneller Eindruck beim ersten Event |
| localStorage Persistenz | Offline-fähig, kein Datenverlust |

### Post-MVP Features

**Phase 2 (Growth):**

| Feature | Priorität | Nutzen |
|---------|-----------|--------|
| **Zeiterfassung pro Pilot** | Hoch | Zeitmessung für Ranglisten und Tie-Breaking |
| Countdown-Timer | Hoch | Piloten kommen selbstständig zum Start |
| Nachrichten-Textfeld | Mittel | Ansagen ohne Rufen |
| Turnier-Templates | Mittel | Einstellungen für wiederkehrende Events |
| Statistiken | Niedrig | Meistgeflogene Piloten, Turnier-Historie |

**Phase 3 (Expansion):**

| Feature | Beschreibung |
|---------|--------------|
| Konfigurierbares Branding | Andere FPV-Gruppen / RC-Szene |
| Docker-Deployment | Einfaches Hosting für andere Teams |
| QR-Code für Zuschauer | Mobile Bracket-Ansicht |
| Export (PDF/CSV) | Turnier-Dokumentation |

### Risk Mitigation Strategy

**Technische Risiken:**

| Risiko | Wahrscheinlichkeit | Mitigation |
|--------|-------------------|------------|
| Bracket-Algorithmus komplex | Mittel | Früh prototypen, mit 8 Piloten testen |
| localStorage-Limit erreicht | Niedrig | 60 Piloten + Bilder = ~2MB, Limit ist 5-10MB |
| Browser-Absturz = Datenverlust | Mittel | Auto-Save nach jeder Aktion |

**Markt-Risiken:**

| Risiko | Mitigation |
|--------|------------|
| App passt nicht zum realen Event-Ablauf | Erstes Event als Validierung, schnell iterieren |
| Piloten ignorieren Beamer | Klare visuelle Hierarchie, große Schrift |

**Ressourcen-Risiken:**

| Risiko | Mitigation |
|--------|------------|
| Weniger Zeit als geplant | Branding kann notfalls später kommen |
| Minimaler Scope nötig | Tabs + On-Deck könnten zu Phase 2 verschoben werden |

## Functional Requirements

### Piloten-Verwaltung

- **FR1:** Organisator kann einen neuen Piloten mit Name, Bild-URL und optionalem Instagram-Handle anlegen
- **FR2:** Organisator kann bestehende Piloten-Daten bearbeiten
- **FR3:** Organisator kann Piloten aus dem Turnier entfernen
- **FR4:** Organisator kann Piloten-Liste aus CSV-Datei importieren (Drag & Drop oder Dateiauswahl, Vorlage downloadbar)
- **FR5:** System zeigt alle registrierten Piloten in einer Übersicht an
- **FR5a:** System erkennt doppelte Piloten-Namen (case-insensitive) und warnt
- **FR5b:** Organisator kann Piloten während des Turniers als "dropped out" markieren

### Turnier-Setup

- **FR6:** Organisator kann ein neues Turnier starten
- **FR7:** System schlägt automatisch eine Heat-Aufteilung basierend auf Pilotenanzahl vor
- **FR8:** System unterstützt flexible Heat-Größen (3er- und 4er-Heats)
- **FR9:** Organisator kann vorgeschlagene Heat-Aufteilung per Drag & Drop anpassen
- **FR9a:** Organisator kann Heat-Aufteilung per "Shuffle" zufällig neu verteilen
- **FR10:** System berechnet optimale Verteilung für 7-60 Piloten

### Heat-Durchführung

- **FR11:** Organisator kann den aktuellen Heat starten
- **FR12:** Organisator kann in normalen Heats zwei Gewinner durch sequentielles Anklicken auswählen (1. Klick = Platz 1, 2. Klick = Platz 2)
- **FR13:** Organisator kann Heat-Ergebnis mit "Fertig"-Button bestätigen
- **FR14:** System ordnet Gewinner automatisch dem Winner-Bracket zu
- **FR15:** System ordnet Verlierer automatisch dem Loser-Bracket zu
- **FR16:** System zeigt den nächsten Heat (On-Deck) als Vorschau an

### Bracket-Verwaltung

- **FR17:** System verwaltet Double-Elimination-Bracket mit Winner- und Loser-Bracket
- **FR18:** System aktualisiert Bracket automatisch nach jedem Heat-Ergebnis
- **FR19:** System behält Piloten-Historie sichtbar (Piloten bleiben wo sie waren)
- **FR20:** System zeigt Farbcodierung für Bracket-Status (Grün = weiter, Rot = Loser-Bracket)
- **FR21:** System ermittelt automatisch die nächsten Heat-Paarungen

### Finale & Platzierungen

- **FR22:** System erkennt automatisch wenn das Finale erreicht ist
- **FR23:** Organisator kann im Finale alle vier Platzierungen durch sequentielles Anklicken eingeben (1. Klick = Platz 1, 2. Klick = Platz 2, 3. Klick = Platz 3, 4. Klick = Platz 4)
- **FR24:** System zeigt die eingegebene Platzierungszahl gut lesbar auf dem Piloten-Bild an (ohne das Bild unkenntlich zu machen)
- **FR25:** System markiert das Turnier als abgeschlossen nach dem Finale

### Visualisierung & Navigation

- **FR26:** System zeigt Piloten-Tab mit allen registrierten Piloten
- **FR27:** System zeigt Bracket-Tab mit vollständigem Turnier-Baum
- **FR28:** System zeigt Aktueller-Heat-Tab mit Fokus auf laufenden Heat
- **FR29:** Benutzer kann zwischen Tabs wechseln
- **FR30:** System zeigt Piloten mit Foto und Namen in allen Ansichten
- **FR31:** System optimiert Darstellung für Beamer-Projektion (große Elemente, hoher Kontrast)

### Bracket-Interaktion

- **FR31a:** Benutzer kann im Bracket zoomen (Mausrad oder Touchpad)
- **FR31b:** Benutzer kann im Bracket pannen (Ziehen mit Maus)
- **FR31c:** Benutzer kann Zoom per Doppelklick zurücksetzen
- **FR31d:** System zeigt Zoom-Indikator mit aktueller Zoomstufe
- **FR31e:** System zeigt Piloten-Pfade durch das Turnier (Toggle mit Taste P)
- **FR31f:** System hebt Piloten-Pfad bei Hover hervor
- **FR31g:** System zeigt X-Marker wo Piloten eliminiert wurden

### Channel-Management

- **FR31h:** System zeigt Raceband-Channels (R1, R3, R4, R6, R8) pro Heat-Position als Badges
- **FR31i:** System merkt sich zuletzt verwendeten Channel pro Pilot
- **FR31j:** System optimiert Channel-Zuweisung bei neuen Heats um Kanalwechsel zu minimieren

### Datenpersistenz

- **FR32:** System speichert alle Turnier-Daten im localStorage
- **FR33:** System lädt gespeicherte Daten beim Neustart automatisch
- **FR34:** System speichert Änderungen automatisch nach jeder Aktion
- **FR35:** System funktioniert ohne Internetverbindung

### Export & Import

- **FR35a:** Organisator kann kompletten Turnier-State als JSON exportieren (Backup)
- **FR35b:** Organisator kann Turnier-State aus JSON-Datei importieren (Wiederherstellung)
- **FR35c:** Organisator kann Piloten und Ergebnisse als CSV exportieren (Dokumentation)
- **FR35d:** System zeigt Bestätigungsdialog mit Piloten-/Heat-Anzahl vor JSON-Import
- **FR35e:** System bietet automatischen CSV-Export bei Siegerehrung an

### PWA & Installation

- **FR35f:** System kann als Progressive Web App (PWA) installiert werden
- **FR35g:** Installierte App läuft im Vollbildmodus (ohne Browser-UI)
- **FR35h:** System unterstützt Installation auf iOS (Safari) und Android (Chrome)

### Keyboard Shortcuts

- **FR35i:** Benutzer kann Piloten-Pfade mit Taste P ein-/ausblenden
- **FR35j:** Benutzer kann Modals mit Escape schließen

### Branding

- **FR36:** System zeigt FPV OÖ Branding (Farben und Logo)

### Zeiterfassung

- **FR37:** Organisator kann optional eine Zeit pro Pilot nach Heat-Ergebnis eingeben
- **FR38:** System akzeptiert Zeiteingabe als Ziffernfolge: 1-2 Ziffern = Sekunden (z.B. "45" → 0:45), 3-4 Ziffern = Minuten:Sekunden (z.B. "123" → 1:23)
- **FR38a:** System unterstützt Zeitbereich von 0:01 bis 9:59
- **FR39:** System zeigt erfasste Zeiten in der Heat-Ansicht und im Bracket an (wenn vorhanden)
- **FR40:** System formatiert Zeiten automatisch lesbar (z.B. "1:23" für Eingabe "123")
- **FR40a:** System inkludiert Rundenzeiten im CSV-Export

## Non-Functional Requirements

### Performance

| NFR | Anforderung | Messung |
|-----|-------------|---------|
| **NFR1** | App lädt initial innerhalb von 3 Sekunden | Zeit bis interaktiv |
| **NFR2** | Heat-Wechsel erfolgt ohne spürbare Verzögerung | < 500ms |
| **NFR3** | Ergebnis-Eingabe reagiert sofort auf Klicks | < 100ms Feedback |
| **NFR4** | Bracket-Update nach Bestätigung erfolgt instant | < 200ms |
| **NFR5** | Tab-Wechsel erfolgt ohne Verzögerung | < 300ms |

### Reliability (Zuverlässigkeit)

| NFR | Anforderung | Messung |
|-----|-------------|---------|
| **NFR6** | App läuft stabil über gesamte Event-Dauer (4-6 Stunden) | Keine Abstürze |
| **NFR7** | Kein Datenverlust bei Browser-Neustart | localStorage Persistenz |
| **NFR8** | Auto-Save nach jeder Benutzeraktion | Keine manuelle Speicherung nötig |
| **NFR9** | App funktioniert ohne Internetverbindung | Vollständig offline-fähig |
| **NFR10** | Bracket-Berechnungen sind 100% korrekt | Keine falschen Zuordnungen |

### Usability (Benutzerfreundlichkeit)

| NFR | Anforderung | Messung |
|-----|-------------|---------|
| **NFR11** | Organisator kann App ohne Einarbeitung bedienen | Erste Nutzung erfolgreich |
| **NFR12** | Ergebnis-Eingabe in unter 10 Sekunden möglich | 2 Klicks + Fertig |
| **NFR13** | Bracket-Stand auf einen Blick erkennbar | Keine Erklärung nötig |
| **NFR14** | Beamer-Lesbarkeit aus 10m Entfernung | Große Schrift, hoher Kontrast |
| **NFR15** | Piloten-Fotos klar erkennbar | Auch auf Beamer identifizierbar |

### Compatibility (Kompatibilität)

| NFR | Anforderung | Messung |
|-----|-------------|---------|
| **NFR16** | Primär Chrome (aktuell) unterstützt | Vollständige Funktionalität |
| **NFR17** | Desktop-Viewport (1920x1080) optimiert | Beamer-ready |
| **NFR18** | CSV-Import akzeptiert Google Forms Export | Standard CSV-Format |
| **NFR19** | PWA-Installation auf iOS (Safari) und Android (Chrome) | App läuft im Vollbildmodus |
| **NFR20** | Touch-Interaktion auf mobilen Geräten | Zoom/Pan funktioniert mit Touchpad |

