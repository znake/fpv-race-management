# FPV Racing Heats - Product Backlog: Epics & User Stories

**Datum:** 2025-12-12  
**Autor:** Product Manager (PM-Agent)  
**Quelle:** PRD (FR1-36), UX-Spec, User Journeys (Thomas/Lisa/Familie Huber), MVP-Scope  
**Validiert gegen:** Success Criteria (z.B. &lt;10s/Heat, Zero Einarbeitung, Offline), NFRs, Architecture (Hooks/Zustand)

## Überblick
- **Epics:** 8 logische Gruppen aus 36 FRs (MVP: Epics 1-7)
- **Stories:** 20+ detaillierte User Stories (Deutsch: **Als ein [Role], möchte ich [Feature], so dass [Benefit]**)
- **Priorisierung:** MoSCoW (Must=MVP, Should=Phase2, Could/Won't=Future)
- **Mapping:** Jede Story → FRs + UX-Patterns (z.B. Toggle-to-Rank)
- **Gesamt-MVP:** 100% Coverage Core Journeys

## Epics-Übersicht
| Epic | Beschreibung | FRs | MVP? | Stories |
|------|--------------|-----|------|---------|
| **EPIC-1** | Piloten-Verwaltung | FR1-5 | ✅ Must | 3 |
| **EPIC-2** | Turnier-Setup | FR6-10 | ✅ Must | 3 |
| **EPIC-3** | Heat-Durchführung | FR11-16 | ✅ Must | 2 |
| **EPIC-4** | Bracket-Management | FR17-21 | ✅ Must | 1 |
| **EPIC-5** | Finale & Abschluss | FR22-25 | ✅ Must | 1 |
| **EPIC-6** | Visualisierung & Navigation | FR26-31 | ✅ Must | 2 |
| **EPIC-7** | Persistenz | FR32-35 | ✅ Must | 1 |
| **EPIC-8** | Branding | FR36 | ⚠️ Should | 1 |

## Detaillierte User Stories

### EPIC-1: Piloten-Verwaltung (FR1-5)
| Story-ID | User Story | Akzeptanzkriterien | FRs | MoSCoW |
|----------|------------|---------------------|-----|--------|
| US-1.1 | Als ein **Organisator (Thomas)**, möchte ich **Piloten manuell mit Name + Bild-URL hinzufügen**, so dass **ich schnell vorab oder on-site Piloten erfasse**. | - Form: Name (Pflicht, &gt;2 Zeichen), Bild-URL (Pflicht, Vorschau)<br>- Live-Update in Liste<br>- &lt;3s pro Pilot<br>- UX: PilotCard mit Neon-Glow (Tailwind glow-pink) | FR1, FR5 | **Must** |
| US-1.2 | Als ein **Organisator**, möchte ich **CSV-Import aus Google Forms**, so dass **ich 20+ Piloten in Sekunden importiere**. | - Drag&amp;Drop/Upload<br>- Format: Name,Bild-URL<br>- Zod-Validierung + Fehlermeldung<br>- Duplikate mergen/skippen<br>- NFR1: &lt;5s für 35 Piloten (useDebounce) | FR4, FR5 | **Must** |
| US-1.3 | Als ein **Organisator**, möchte ich **Piloten bearbeiten/löschen**, so dass **ich Fehler korrigiere (z.B. falsche URL)**. | - Inline-Edit pro PilotCard (usePilots Hook)<br>- Löschen: Bestätigung vor Start<br>- Nach Start: &quot;Ausgefallen&quot; markieren → Freilos (Edge Case UX)<br>- Historie bleibt sichtbar | FR2, FR3 | **Must** |

### EPIC-2: Turnier-Setup (FR6-10)
| Story-ID | User Story | Akzeptanzkriterien | FRs | MoSCoW |
|----------|------------|---------------------|-----|--------|
| US-2.1 | Als ein **Organisator**, möchte ich **ein neues Turnier starten**, so dass **die App mich durch Setup führt**. | - Button &quot;Turnier starten&quot; (aktiv ab 7 Piloten, MAX=35)<br>- Auto-Heat-Vorschlag anzeigen<br>- Zero-Einarbeitung: &lt;1 Min (NFR11) | FR6 | **Must** |
| US-2.2 | Als ein **Organisator**, möchte ich **automatische Heat-Aufteilung (3/4er)**, so dass **faire Verteilung ohne Rechnen**. | - Optimiert für 7-35 Piloten (Bye-System für Ungerade)<br>- Vorschlag: z.B. 4-4-4-4-3<br>- Shuffle-Button: Neu mischen (Randomisierung) | FR7, FR8, FR10 | **Must** |
| US-2.3 | Als ein **Organisator**, möchte ich **Heat-Aufteilung bestätigen/anpassen**, so dass **ich finale Kontrolle habe**. | - Drag&amp;Drop oder +/- Buttons<br>- Bestätigung → Heat 1 lädt auto<br>- NFR: Gesamt-Setup &lt;5 Min | FR9 | **Must** |

### EPIC-3: Heat-Durchführung (FR11-16, Core Loop)
| Story-ID | User Story | Akzeptanzkriterien | FRs | MoSCoW |
|----------|------------|---------------------|-----|--------|
| US-3.1 | Als ein **Organisator**, möchte ich **aktuellen Heat starten + Gewinner anklicken (Toggle-to-Rank)**, so dass **Ergebnis in 2 Klicks eingegeben ist**. | - Klick=Platz 1, nochmal=entfernen (UX Pattern)<br>- Tastatur-Support: 1-4 Keys<br>- RankBadge: Gold(1)/Cyan(2)/Pink(3/4)<br>- NFR3: &lt;100ms Feedback | FR11, FR12 | **Must** |
| US-3.2 | Als ein **Organisator**, möchte ich **Heat mit &quot;Fertig&quot; abschließen**, so dass **nächster Heat + Bracket auto updatet**. | - Button aktiv ab 2 Piloten<br>- On-Deck-Vorschau: Nächste 4 Piloten (&quot;Drohnen vorbereiten&quot;)<br>- NFR4: Bracket-Update &lt;200ms | FR13-16 | **Must** |

### EPIC-4: Bracket-Management (FR17-21)
| Story-ID | User Story | Akzeptanzkriterien | FRs | MoSCoW |
|----------|------------|---------------------|-----|--------|
| US-4.1 | Als ein **Organisator/Pilotin (Lisa)**, möchte ich **Double-Elim Bracket (Winner/Loser) auto-updaten**, so dass **Historie sichtbar + Orientierung klar**. | - Winner=Grün/Cyan, Loser=Rot/Pink (Farbcodierung)<br>- Neon-Linien: Pfade verbinden<br>- Piloten bleiben sichtbar (Historie)<br>- Scrollbar bei 35 Piloten | FR17-21 | **Must** |

### EPIC-5: Finale & Abschluss (FR22-25)
| Story-ID | User Story | Akzeptanzkriterien | FRs | MoSCoW |
|----------|------------|---------------------|-----|--------|
| US-5.1 | Als ein **Organisator**, möchte ich **Finale auto-erkennen + 4 Plätze eingeben**, so dass **Turnier mit Siegerehrung abschließt**. | - Gold-Styling + Puls (UX Finale-Klimax)<br>- Sequentiell: 4 Klicks (Platz 1-4 auf Fotos)<br>- Screen: &quot;Turnier beendet&quot; + Platzierungen | FR22-25 | **Must** |

### EPIC-6: Visualisierung & Navigation (FR26-31)
| Story-ID | User Story | Akzeptanzkriterien | FRs | MoSCoW |
|----------|------------|---------------------|-----|--------|
| US-6.1 | Als ein **Organisator/Zuschauer**, möchte ich **Tabs (Piloten/Bracket/Heat)**, so dass **schneller Wechsel ohne Verzögerung**. | - 64px Tabs (Beamer-Targets), Neon-Akzent aktiv<br>- Instant-Wechsel (NFR5: &lt;300ms)<br>- Keyboard: ←/→ | FR26-29, FR31 | **Must** |
| US-6.2 | Als ein **Pilot/Zuschauer (Familie Huber)**, möchte ich **Piloten-Fotos + Farbcodierung in allen Views**, so dass **sofort erkennbar + mitfieberbar**. | - Große Fotos (120px Heat, 48px List/Bracket)<br>- Grün=weiter, Rot=Loser (Panzerklarheit)<br>- 10m-lesbar (NFR14/15) | FR30 | **Must** |

### EPIC-7: Persistenz (FR32-35)
| Story-ID | User Story | Akzeptanzkriterien | FRs | MoSCoW |
|----------|------------|---------------------|-----|--------|
| US-7.1 | Als ein **Organisator**, möchte ich **localStorage Auto-Save + Offline**, so dass **kein Datenverlust bei Crash/Neustart**. | - Speichern nach jeder Aktion (useLocalStorage)<br>- Auto-Load beim Start<br>- Funktioniert ohne Netz (NFR9)<br>- ~1MB für 35 Piloten | FR32-35 | **Must** |

### EPIC-8: Branding (FR36, Post-MVP)
| Story-ID | User Story | Akzeptanzkriterien | FRs | MoSCoW |
|----------|------------|---------------------|-----|--------|
| US-8.1 | Als ein **Organisator**, möchte ich **FPV OÖ Branding (Synthwave-Farben/Logo)**, so dass **App professionell + community-tauglich wirkt**. | - Tailwind: void/night/neon-pink/gold<br>- Logo-Header<br>- Grid-BG subtil (ux-design-directions.html) | FR36 | **Should** |

## Nächste Schritte (Sprint-Ready)
1. **Sprint 1:** Epics 1-3 (Setup + Core Loop) → 8 Stories
2. **RICE/Priorisierung:** (Request: Menu 2)
3. **Tasks aus Stories:** Dev-ready (z.B. US-3.1 → implement Toggle-to-Rank in heat-box.tsx)

**Änderungen tracken:** Git commit nach Review.