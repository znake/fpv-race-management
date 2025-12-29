# Story 11.5: Pool-Visualisierung im Bracket

**Status:** ready
**Created:** 2025-12-28
**Story Points:** 3 (S-Shirt - Komponenten-Anpassung + Positionierung)
**Mockup:** [bracket-tree-mockup.html](../../../design/bracket-tree-mockup.html)

## Story

Als **Zuschauer auf dem Beamer**,
möchte ich **sehen welche Piloten im WB-Pool und LB-Pool auf ihren nächsten Heat warten**,
damit **ich verstehe wer noch im Turnier ist und wann sie wieder fliegen**.

## Hintergrund

Pools werden in der ersten Spalte des Brackets angezeigt:
- **WB Pool:** Mittig zwischen den Winner Bracket Heats (Runde 1)
- **LB Pool:** Mittig zwischen den Loser Bracket Heats (Runde 1)

Pools haben einen **gestrichelten Border** (dashed) um sie von aktiven Heats zu unterscheiden.

## Acceptance Criteria

### AC1: WB Pool wird angezeigt

**Given** es sind Piloten im WB Pool
**When** ich das Bracket betrachte
**Then** wird der WB Pool in der Pools-Spalte angezeigt
**And** er ist vertikal mittig zwischen den WB Runde-1 Heats positioniert
**And** hat einen grünen gestrichelten Border

### AC2: LB Pool wird angezeigt

**Given** es sind Piloten im LB Pool (loserPool State)
**When** ich das Bracket betrachte
**Then** wird der LB Pool in der Pools-Spalte angezeigt
**And** er ist vertikal mittig zwischen den LB Runde-1 Heats positioniert
**And** hat einen roten gestrichelten Border

### AC3: Pool zeigt Piloten-Avatare

**Given** ein Pool hat Piloten
**When** ich den Pool betrachte
**Then** werden die Piloten als kleine Avatare angezeigt
**And** die Anzahl wird als Text angezeigt (z.B. "3 Piloten")

### AC4: Leerer Pool wird nicht angezeigt

**Given** ein Pool hat keine Piloten
**When** ich das Bracket betrachte
**Then** wird der Pool nicht angezeigt (oder ausgegraut)

### AC5: Dashed Border unterscheidet von Heats

**Given** ein Pool wird angezeigt
**When** ich ihn mit Heat-Boxen vergleiche
**Then** hat der Pool einen gestrichelten Border (dashed)
**And** Heat-Boxen haben einen durchgezogenen Border (solid)

## Technische Anforderungen

### Pool-Box Struktur (aus Mockup)

```tsx
<div className={`pool-box ${bracketType === 'loser' ? 'lb' : ''}`}>
  <div className="pool-label">WB POOL</div>
  <div className="pool-count">2 Piloten</div>
  <div className="pool-pilots">
    {pilots.map(p => (
      <div className="pool-pilot">{getInitials(p.name)}</div>
    ))}
  </div>
</div>
```

### CSS (aus Mockup)

```css
.pool-box {
  background: var(--night);
  border: 2px dashed var(--winner-green);
  border-radius: 10px;
  padding: 10px;
  text-align: center;
  width: 120px;
}

.pool-box.lb { 
  border-color: var(--loser-red); 
}

.pool-pilot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--night-light);
  border: 2px solid var(--steel);
}
```

## Tasks

- [ ] **Task 1:** `PoolBox` Komponente erstellen oder anpassen
- [ ] **Task 2:** Dashed Border Styling implementieren
- [ ] **Task 3:** Pool-Positionierung in der Pools-Spalte
- [ ] **Task 4:** Piloten-Avatare als kleine Kreise
- [ ] **Task 5:** Anzahl-Anzeige
- [ ] **Task 6:** Leere Pools ausblenden
- [ ] **Task 7:** Integration mit Epic-9 loserPool State

## Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/components/bracket/PoolDisplay.tsx` | Anpassung für neues Design |
| `src/components/bracket/BracketTree.tsx` | Pool-Positionierung in Spalte |
| `src/globals.css` | CSS für Pool-Box |

## Dev Notes

### Abhängigkeiten
- Story 11-1 (Unified Layout) muss abgeschlossen sein
- Nutzt `loserPool` State aus Epic 9

### Wichtige Hinweise
- WB Pool enthält Piloten die auf nächsten WB-Heat warten (aus initialem Seed)
- LB Pool enthält Verlierer die auf LB-Heat warten
- Bestehende `PoolDisplay.tsx` Komponente kann als Basis verwendet werden
- Dashed Border ist der visuelle Unterschied zu Heat-Boxen

### Datenquellen
- WB Pool: `tournamentStore.pilots` die noch nicht in einem Heat sind
- LB Pool: `tournamentStore.loserPool` (aus Epic 9)

### Testszenarien
1. WB Pool mit 3 Piloten → Zeigt 3 Avatare + "3 Piloten"
2. LB Pool mit 5 Piloten → Roter gestrichelter Border
3. Leerer Pool → Wird nicht angezeigt
4. Pool vs Heat → Border-Style unterscheidbar

## References

- [Mockup: bracket-tree-mockup.html](../../../design/bracket-tree-mockup.html)
- [Epic 11 Overview](./00-epic-overview.md)
- [Epic 9: LB Pooling](../epic-9/9-1-loser-pool-state.md)
