---
story_id: US-2.2
epic: Epic 2 - Synthwave Visual Design
title: Pixel-perfektes Design (ux-design-directions.html)
status: pending
frs: [FR36]
date: 2025-12-13
---

# US-2.2: Pixel-perfektes Design wie in ux-design-directions.html

## User Story

**Als ein** Organisator/Zuschauer,  
**möchte ich** das pixel-perfekte Design wie in ux-design-directions.html,  
**so dass** die App visuell beeindruckend und konsistent ist.

## Acceptance Criteria

### AC 1: Body & Hintergrund

**Given** die App wird angezeigt  
**When** ich den Hintergrund betrachte  
**Then** ist der Body-Hintergrund ein Gradient von void (#0d0221) zu night (#1a0533)  
**And** das Synthwave-Grid ist am unteren Rand sichtbar (300px Höhe)  
**And** das Grid hat repeating-linear-gradient mit Pink-Linien (#ff2a6d, 10% Opacity)  
**And** das Grid faded nach oben aus (transparent)

### AC 2: Tab-Styling

**Given** ich sehe die Tabs  
**When** kein Tab aktiv ist  
**Then** haben Tabs Steel-Border (#888888), Steel-Text, Night-BG  
**And** Border-Radius ist 8px, Padding 16px 32px

**When** ich über einen Tab hovere  
**Then** wird die Border Cyan (#05d9e8) und der Text Cyan

**When** ein Tab aktiv ist  
**Then** hat er Pink-Border (#ff2a6d) mit Glow-Effekt  
**And** Background ist night-light (#2a0845)  
**And** Text ist Chrome (#e0e0e0)

### AC 3: Card-Styling (PilotCard)

**Given** ich sehe eine PilotCard  
**When** die Karte im Default-State ist  
**Then** hat sie Night-BG (#1a0533)  
**And** 3px Steel-Border (#888888)  
**And** 16px Border-Radius  
**And** 24px Padding

**And** das Piloten-Foto ist:
- 120px Durchmesser
- Rund (border-radius: 50%)
- Pink→Magenta Gradient als Fallback-Hintergrund

### AC 4: Button-Styling

**Given** ich sehe den "Fertig"-Button  
**When** der Button aktiv ist  
**Then** hat er Pink-BG (#ff2a6d) mit Glow-Effekt  
**And** Text ist Void (#0d0221)  
**And** Padding 20px 48px, Border-Radius 12px

**When** ich hovere  
**Then** hebt sich der Button leicht an (translateY -2px)  
**And** Glow verstärkt sich (0 0 30px rgba(255, 42, 109, 0.7))

**When** der Button disabled ist  
**Then** ist BG Steel (#888888), kein Glow, Opacity 0.5

### AC 5: On-Deck Preview

**Given** ich sehe die On-Deck Vorschau  
**Then** hat sie Night-BG mit Steel-Border  
**And** 12px Border-Radius  
**And** Titel "NÄCHSTER HEAT – Bitte Drohnen vorbereiten" in Steel-Color, Uppercase

## Technical Notes

- Referenz: `docs/ux-design-directions.html` (komplette CSS)
- Grid-Hintergrund: Zeile 306-331
- Alle Styles 1:1 übernehmen

## Definition of Done

- [ ] Body Gradient implementiert
- [ ] Synthwave Grid-Hintergrund implementiert
- [ ] Tab-Komponente mit allen States
- [ ] PilotCard-Komponente mit korrektem Styling
- [ ] Button-Komponente mit Hover/Disabled States
- [ ] On-Deck Preview styled
- [ ] Visueller Vergleich mit ux-design-directions.html bestanden
