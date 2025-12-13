---
story_id: US-2.3
epic: Epic 2 - Synthwave Visual Design
title: Animierte Auswahl-Hervorhebung
status: pending
frs: [FR36]
date: 2025-12-13
---

# US-2.3: Animierte Auswahl-Hervorhebung bei Piloten-Karten

## User Story

**Als ein** Organisator,  
**möchte ich** animierte Hervorhebung bei Piloten-Karten,  
**so dass** klar erkennbar ist welche Karte ausgewählt oder gehovered ist.

## Acceptance Criteria

### AC 1: Hover-Effekt

**Given** eine PilotCard ist im Default-State  
**When** ich mit der Maus darüber fahre  
**Then** wechselt die Border zu Cyan (#05d9e8)  
**And** die Karte hebt sich leicht an (translateY: -4px)  
**And** die Transition dauert 200ms ease

### AC 2: Auswahl-Animation (Selected State)

**Given** ich klicke auf eine PilotCard (Rang vergeben)  
**When** die Karte ausgewählt ist  
**Then** erscheint ein animierter Magenta-Streifen der um den Border "fährt"  
**And** die Animation nutzt CSS conic-gradient oder @keyframes border-animation  
**And** ein pulsierender Glow-Effekt verstärkt die Auswahl  
**And** die Animation ist subtil aber deutlich sichtbar (nicht ablenkend)

### AC 3: Rang-spezifische Farben

**Given** ein Pilot hat Rang 1 (Gold)  
**When** die Karte ausgewählt ist  
**Then** ist die Border Gold (#f9c80e) mit Gold-Glow

**Given** ein Pilot hat Rang 2 (Cyan)  
**When** die Karte ausgewählt ist  
**Then** ist die Border Cyan (#05d9e8) mit Cyan-Glow

**Given** ein Pilot hat Rang 3 oder 4 (Pink)  
**When** die Karte ausgewählt ist  
**Then** ist die Border Pink (#ff2a6d) mit subtlem Pink-Glow

### AC 4: Accessibility (Reduced Motion)

**Given** der User hat `prefers-reduced-motion: reduce` aktiviert  
**When** eine Karte ausgewählt wird  
**Then** werden Animationen deaktiviert/stark reduziert  
**And** die Auswahl ist trotzdem durch statischen Glow + Border-Farbe erkennbar

### AC 5: RankBadge Animation

**Given** ein Rang wird vergeben  
**When** der RankBadge erscheint  
**Then** hat er eine kurze Scale-In Animation (0 → 1, 150ms)  
**And** der Badge hat entsprechenden Glow (Gold/Cyan/Pink)

## Technical Notes

### CSS Animation für Border-Streifen

```css
/* Konzept: Animated Border mit conic-gradient */
.pilot-card.selected::before {
  content: '';
  position: absolute;
  inset: -3px;
  background: conic-gradient(
    from var(--angle),
    transparent 0deg,
    var(--neon-magenta) 60deg,
    transparent 120deg
  );
  border-radius: 19px; /* 16px + 3px */
  animation: rotate-border 2s linear infinite;
  z-index: -1;
}

@keyframes rotate-border {
  from { --angle: 0deg; }
  to { --angle: 360deg; }
}

/* CSS Custom Property Animation (benötigt @property) */
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .pilot-card.selected::before {
    animation: none;
    background: var(--neon-magenta);
    opacity: 0.3;
  }
}
```

## Definition of Done

- [ ] Hover-Effekt implementiert (Cyan-Border + Lift)
- [ ] Animierter Border-Streifen bei Auswahl
- [ ] Rang-spezifische Farben (Gold/Cyan/Pink)
- [ ] Pulsierender Glow-Effekt
- [ ] RankBadge mit Scale-In Animation
- [ ] prefers-reduced-motion respektiert
- [ ] Performance: Keine Ruckler bei Animation
- [ ] Visuell getestet auf 1920x1080 (Beamer-Simulation)
