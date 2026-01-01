---
story_id: US-2.1
epic: Epic 2 - Synthwave Visual Design
title: FPV OÖ Branding (Synthwave-Farben/Logo)
status: pending
frs: [FR36]
date: 2025-12-13
---

# US-2.1: FPV OÖ Branding (Synthwave-Farben/Logo)

## User Story

**Als ein** Organisator,  
**möchte ich** das FPV OÖ Branding mit Synthwave-Ästhetik sehen,  
**so dass** die App professionell und community-tauglich wirkt.

## Acceptance Criteria

### AC 1: Synthwave Farbpalette

**Given** die App wird geladen  
**When** ich die Oberfläche sehe  
**Then** entsprechen alle Farben der Synthwave-Palette:
- `void`: #0d0221 (Tiefes Violett-Schwarz)
- `night`: #1a0533 (Dunkles Violett)
- `neon-pink`: #ff2a6d (Heißes Pink)
- `neon-cyan`: #05d9e8 (Leuchtendes Cyan)
- `neon-magenta`: #d300c5 (Magenta)
- `gold`: #f9c80e (Sieger-Gold)
- `winner-green`: #39ff14 (Neon-Grün)
- `loser-red`: #ff073a (Neon-Rot)
- `chrome`: #e0e0e0 (Heller Text)
- `steel`: #888888 (Gedämpfter Text)

### AC 2: Header mit Logo

**Given** die App wird geladen  
**When** ich den Header sehe  
**Then** zeigt er "FPV RACING HEATS" im Bebas Neue Font  
**And** der Text hat einen Pink→Magenta Gradient  
**And** "FPV Oberösterreich" erscheint rechts in Steel-Color  
**And** der Header hat Night-BG mit Pink-Border und Glow-Effekt

### AC 3: Tailwind Konfiguration

**Given** ich öffne tailwind.config.ts  
**When** ich die Farbdefinitionen prüfe  
**Then** sind alle Synthwave-Farben als Custom Colors definiert  
**And** Glow-Effekte sind als boxShadow-Utilities verfügbar (glow-pink, glow-cyan, glow-gold)

## Technical Notes

- Fonts: Google Fonts `Bebas Neue` (Display) + `Space Grotesk` (UI)
- Referenz: `docs/ux-design-directions.html` Zeile 8-29 (CSS Variables)
- Tailwind Config: `tailwind.config.ts` erweitern

## Definition of Done

- [ ] Tailwind Farbpalette konfiguriert
- [ ] Fonts eingebunden (Bebas Neue + Space Grotesk)
- [ ] Header-Komponente mit Logo erstellt
- [ ] Glow-Utilities in Tailwind verfügbar
- [ ] Visuell identisch mit ux-design-directions.html Header
