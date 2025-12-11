---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - 'docs/analysis/brainstorming-session-2025-12-11.md'
workflowType: 'product-brief'
lastStep: 5
project_name: 'FPV Racing Heats'
user_name: 'Jakob'
date: '2025-12-11'
---

# Product Brief: FPV Racing Heats

**Date:** 2025-12-11
**Author:** Jakob

---

## Executive Summary

**FPV Racing Heats** ist eine browserbasierte Turnier-App für FPV-Drohnenrennen, entwickelt für FPV Oberösterreich. Die App ermöglicht es, Double-Elimination-Turniere mit 4er-Heats einfach zu verwalten und live zu visualisieren – ohne Server, ohne Accounts, ohne Einarbeitung.

**Kernversprechen:** Piloten eingeben, Gewinner anklicken, fertig.

---

## Core Vision

### Problem Statement

FPV-Drohnenrennen im Turnier-Format zu organisieren erfordert aktuell entweder komplexe Online-Tools mit Einarbeitungszeit oder manuelle Lösungen wie Whiteboards und Zettelwirtschaft. Beides ist unbefriedigend: Organisatoren verlieren den Überblick, Piloten wissen nicht wann sie dran sind, und Zuschauer verstehen nicht was gerade passiert.

### Problem Impact

| Betroffene | Auswirkung |
|------------|------------|
| **Organisator** | Ständiges manuelles Tracking, Ansagen, Fehleranfälligkeit |
| **Piloten** | Unklarheit über nächsten Einsatz, ständiges Nachfragen |
| **Zuschauer** | Keine Orientierung, wer fliegt und wie der Stand ist |

### Why Existing Solutions Fall Short

Existierende Turnier-Tools wie Challonge oder Smash.gg sind für E-Sports optimiert, nicht für lokale FPV-Events. Sie erfordern:

- Online-Verbindung und Accounts
- Einarbeitungszeit
- Generisches Design ohne eigenes Branding
- Keine Optimierung für 4er-Heat-Format mit Winner/Loser-Bracket

### Proposed Solution

Eine **digitale Magnettafel** – eine browserbasierte App, die:

- Pilotendaten per CSV-Import oder manuell aufnimmt (Name + Bild)
- Heats automatisch einteilt (inkl. Bye-System für ungerade Zahlen)
- Gewinner per Klick auswählt und Bracket automatisch aktualisiert
- Alles lokal im Browser speichert (localStorage)
- Im FPV OÖ Branding gestaltet ist

### Key Differentiators

| Differentiator | Bedeutung |
|----------------|-----------|
| **Zero Einarbeitung** | Intuitiv wie eine Magnettafel |
| **Offline-first** | Kein Internet, kein Server nötig |
| **Eigenes Branding** | FPV OÖ Farben und Logo |
| **4er-Heat-optimiert** | Genau auf euer Format zugeschnitten |
| **CSV-Import** | Google Forms → App in Sekunden |

---

## Target Users

### Primary Users

#### 1. Der Organisator – "Das Orga-Team"

**Profil:**
- Mitglieder von FPV OÖ (technikaffin)
- 2-4 Personen, die das Tool bedienen können
- Stehen am Laptop neben der Strecke, Beamer angeschlossen

**Ziel:**
- Turnier effizient durchführen ohne Zettelwirtschaft
- Überblick behalten: Wer fliegt? Wer kommt als nächstes?
- Ergebnisse schnell eintragen (2 Klicks + Fertig)

**Pain Points ohne App:**
- Manuelles Tracking fehleranfällig
- Ständig "Wer ist dran?" beantworten
- Kein visueller Überblick für alle

**Success Moment:**
- Turnier läuft flüssig, keine Fragen mehr, alle schauen auf den Beamer

---

#### 2. Die Piloten – "Die Racer"

**Profil:**
- 20-35 Piloten pro Event
- ~50% fliegen zum ersten Mal ein Turnier in diesem Format
- Kein App-Zugriff, schauen auf Beamer

**Ziel:**
- Wissen, wann sie dran sind
- Verstehen, wie sie im Bracket stehen
- Sehen, gegen wen sie als nächstes fliegen

**Pain Points ohne App:**
- "Wann bin ich dran?" – ständiges Nachfragen
- Unklarheit über Turnier-Stand
- Verpassen fast ihren Heat

**Success Moment:**
- Ein Blick auf den Beamer → "Ah, ich bin in 2 Heats dran, gegen die drei"

---

### Secondary Users

#### 3. Die Zuschauer – "Das Publikum"

**Profil:**
- ~100 Gäste (Freunde, Familie, zufällige Besucher)
- Keine FPV-Kenntnisse vorausgesetzt
- Schauen auf Beamer

**Ziel:**
- Verstehen, was gerade passiert
- Mitfiebern können ("Wer gewinnt?")
- Event-Atmosphäre genießen

**Pain Points ohne App:**
- "Wer sind die vier da oben?"
- "Wer liegt vorne im Turnier?"
- Keine Orientierung, kein Mitfiebern möglich

**Success Moment:**
- Sehen die Piloten-Bilder, Namen, Bracket → "Ah, der Tim muss jetzt gewinnen, sonst ist er raus!"

---

### User Journey

| Phase | Organisator | Pilot | Zuschauer |
|-------|-------------|-------|-----------|
| **Vor Event** | CSV-Import, Piloten checken | Anmeldung (Google Forms) | – |
| **Event-Start** | Turnier starten, Heat-Aufteilung bestätigen | Bracket anschauen am Beamer | Bracket sehen, Überblick |
| **Während Heats** | 2 Gewinner anklicken → Fertig | Heat-Fokus schauen, wann dran? | Heat-Fokus: Wer fliegt gerade? |
| **Zwischen Heats** | Nächsten Heat starten | Bracket checken: Wie steh ich? | Bracket: Wer liegt vorne? |
| **Finale** | Finales Ergebnis eintragen | Siegerehrung | Sieger feiern! |

---

## Success Metrics

### User Success Metrics

#### Organisator-Erfolg

| Metrik | Ziel |
|--------|------|
| **Turnier-Start** | App startet ohne Fehler mit beliebiger Pilotenanzahl (7-35) |
| **Heat-Eingabe** | Ergebnis in <10 Sekunden eingetragen (2 Klicks + Fertig) |
| **Keine Nachfragen** | Piloten schauen auf Beamer statt Orga zu fragen |
| **Wiederverwendung** | "Würden wir beim nächsten Event wieder nutzen" |

#### Piloten-Erfolg

| Metrik | Ziel |
|--------|------|
| **Rechtzeitig am Start** | Piloten finden sich selbstständig zum Heat ein |
| **Keine Verwirrung** | Bracket-Stand ist für alle klar ersichtlich |
| **Countdown hilft** | Timer/Nachrichten werden wahrgenommen und befolgt |

#### Zuschauer-Erfolg

| Metrik | Ziel |
|--------|------|
| **Orientierung** | Zuschauer verstehen, wer gerade fliegt |
| **Mitfiebern** | Bracket-Visualisierung ermöglicht Turnier-Verfolgung |

---

### Business Objectives

Da FPV Racing Heats ein Community-Tool für FPV OÖ ist, keine klassischen Business-Ziele.

**Stattdessen Community-Ziele:**

| Ziel | Beschreibung |
|------|--------------|
| **Erstes Event erfolgreich** | Turnier am ersten Einsatztag ohne kritische Fehler |
| **Branding** | App repräsentiert FPV OÖ professionell |
| **Weiterempfehlung** | Andere FPV-Gruppen oder RC-Szene zeigt Interesse |

---

### Key Performance Indicators

#### MVP Launch KPIs (Erstes Event)

| KPI | Messung | Ziel |
|-----|---------|------|
| **Kritische Fehler** | Anzahl Abstürze oder falsche Bracket-Stände | 0 |
| **Setup-Zeit** | Zeit von CSV-Import bis Turnier-Start | < 5 Min |
| **Heat-Turnaround** | Zeit zwischen Heats (inkl. Ergebnis-Eingabe) | Kein Bottleneck durch App |
| **Piloten-Nachfragen** | "Wann bin ich dran?" Fragen an Orga | Deutlich reduziert |

#### Anti-Metriken (Was NICHT passieren darf)

| Anti-Metrik | Beschreibung |
|-------------|--------------|
| **Turnier-Stopp** | Event muss unterbrochen werden wegen App-Fehler |
| **Falscher Stand** | Bracket zeigt falsche Gewinner/Verlierer |
| **Datenverlust** | Piloten oder Ergebnisse gehen verloren |
| **Workaround nötig** | Orga muss auf Zettel zurückgreifen |

---

## MVP Scope

### Core Features (MUSS funktionieren)

#### Piloten-Verwaltung

- Manuelle Eingabe: Name + Bild-URL
- Piloten bearbeiten/löschen nach Eingabe
- localStorage Speicherung

#### Turnier-Logik

- Automatische Heat-Aufteilung (App schlägt vor, User bestätigt)
- Bye-System für ungerade Pilotenanzahlen (7-35 Piloten)
- Double Elimination: Winner-Bracket + Loser-Bracket
- Gewinner-Auswahl: 2 Piloten anklicken → "Fertig" → nächster Heat

#### Visualisierung

- Bracket-Baum mit Winner/Loser-Pfaden
- Farbcodierung: Grün (weiter) / Rot (Loser-Bracket)
- Piloten bleiben sichtbar wo sie waren (Historie)
- Tabs: Piloten / Bracket / Aktueller Heat
- Finale zeigt Platzierungen 1, 2, 3, 4
- FPV OÖ Branding (Farben, Logo)

#### Technisch

- Browserbasiert (kein Server)
- localStorage (offline-fähig)
- Beamer-tauglich (responsive, große Elemente)

---

### Nice-to-Have (wenn Zeit bleibt)

| Feature | Aufwand | Nutzen |
|---------|---------|--------|
| CSV-Import | Niedrig | Zeitersparnis bei Piloten-Eingabe |
| Countdown-Timer | Mittel | Piloten selbstständig zum Start |
| Nachrichten-Textfeld | Niedrig | Ansagen ohne Rufen |

---

### Out of Scope (bewusst NICHT im MVP)

| Feature | Grund |
|---------|-------|
| Punktesystem | Bracket zeigt Sieger bereits |
| Online-Sync | Nicht nötig für lokales Event |
| User Accounts | Overkill |
| Zeitmessung | Extern durchgeführt |
| Export (PDF/CSV) | Später nachrüstbar |
| Mobile App | Browser reicht |
| Mehrere Turniere parallel | Komplexität |

---

### MVP Success Criteria

Das MVP ist erfolgreich wenn:

1. **Turnier durchführbar:** Event läuft von Start bis Finale ohne App-Absturz
2. **Bracket korrekt:** Keine falschen Zuordnungen oder Berechnungsfehler
3. **Visualisierung klar:** Piloten/Zuschauer verstehen den Stand auf einen Blick
4. **Wiederverwendung:** Orga-Team sagt "Ja, nächstes Mal wieder"

---

### Future Vision (Nach MVP)

#### Version 2.0 Kandidaten

- CSV-Import (falls nicht in MVP)
- Countdown-Timer & Nachrichten
- Turnier-Templates speichern
- Statistiken (meistgeflogene Piloten, etc.)

#### Langfristig denkbar

- Andere FPV-Gruppen / RC-Szene
- Konfigurierbares Branding (nicht nur FPV OÖ)
- Docker-Deployment für einfaches Hosting
- QR-Code für Zuschauer → Mobile Bracket-Ansicht

---
