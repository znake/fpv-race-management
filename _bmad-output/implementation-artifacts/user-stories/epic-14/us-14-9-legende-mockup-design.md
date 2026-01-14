# US-14.9: Legende im Mockup-Design

| Feld | Wert |
|------|------|
| **Story ID** | US-14.9 |
| **Epic** | Epic 14: Visuelle Integration Bracket-Mockup |
| **Priorität** | LOW |
| **Geschätzter Aufwand** | 2 Story Points (0.5 Tage) |
| **Abhängigkeiten** | US-14.1 (CSS-Variablen) |
| **Status** | DONE |

---

## User Story

**Als** neuer Zuschauer  
**möchte ich** eine Legende die alle Farben erklärt  
**sodass** ich das Bracket sofort verstehe

---

## Akzeptanzkriterien

### AC1: Legende Container
- [x] Position: unterhalb des Brackets
- [x] Hintergrund: `--night`
- [x] Border-Radius: 8px
- [x] Padding: 10px 14px
- [x] Margin-Top: 25px
- [x] Font-Size: 10px

### AC2: Flex-Layout
- [x] Display: flex
- [x] Gap: 20px zwischen Items
- [x] Flex-Wrap: wrap (erlaubt Umbruch bei kleinen Bildschirmen)

### AC3: Line-Items (für Bracket-Typen)
- [x] Farbige Linie: 20px × 2px
- [x] Beschreibungstext daneben
- [x] Gap zwischen Linie und Text: 6px

### AC4: Line-Farben
- [x] Qualifikation: Cyan (`--quali-blue`)
- [x] Winner Bracket: Grün (`--winner-green`)
- [x] Loser Bracket: Rot (`--loser-red`)
- [x] Grand Finale: Gold (`--gold`)

### AC5: Color-Items (für Platzierungen)
- [x] Quadrat: 14px × 14px
- [x] Border-Radius: 3px
- [x] Border: 1px solid (entsprechende Farbe)
- [x] Beschreibungstext daneben

### AC6: Color-Varianten
- [x] Platz 1+2 (weiter): `--bg-winner` Hintergrund, grüner Border
- [x] Platz 3+4 (raus/LB): `--bg-loser` Hintergrund, roter Border

### AC7: Spezial-Items
- [x] "3x = 3-Pilot Heat" als Text-Item
- [x] Font-Weight: 600 für das "3x"
- [x] Farbe: `--neon-cyan`

### AC8: Item-Styling
- [x] Flex-Display für jedes Item
- [x] Align-Items: center
- [x] Gap: 6px
- [x] Farbe: `--steel` für Text

---

## Technische Hinweise

### Betroffene Dateien

| Datei | Änderungsart |
|-------|--------------|
| `src/components/bracket/BracketLegend.tsx` | Rewrite mit Mockup-Design |

### Komponenten-Struktur

```tsx
// BracketLegend.tsx
interface LegendLineItem {
  color: string
  label: string
}

interface LegendColorItem {
  bgColor: string
  borderColor: string
  label: string
}

const lineItems: LegendLineItem[] = [
  { color: 'var(--quali-blue)', label: 'Qualifikation' },
  { color: 'var(--winner-green)', label: 'Winner Bracket' },
  { color: 'var(--loser-red)', label: 'Loser Bracket' },
  { color: 'var(--gold)', label: 'Grand Finale' }
]

const colorItems: LegendColorItem[] = [
  { 
    bgColor: 'var(--bg-winner)', 
    borderColor: 'var(--winner-green)', 
    label: 'Platz 1+2 (weiter)' 
  },
  { 
    bgColor: 'var(--bg-loser)', 
    borderColor: 'var(--loser-red)', 
    label: 'Platz 3+4 (raus/LB)' 
  }
]

export function BracketLegend() {
  return (
    <div className="legend">
      {/* Line Items */}
      {lineItems.map((item) => (
        <div key={item.label} className="legend-item">
          <div 
            className="legend-line" 
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </div>
      ))}
      
      {/* Color Items */}
      {colorItems.map((item) => (
        <div key={item.label} className="legend-item">
          <div 
            className="legend-color" 
            style={{ 
              backgroundColor: item.bgColor,
              borderColor: item.borderColor 
            }}
          />
          {item.label}
        </div>
      ))}
      
      {/* Special Item */}
      <div className="legend-item">
        <span style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>3x</span>
        3-Pilot Heat
      </div>
    </div>
  )
}
```

### CSS-Styling

```css
.legend {
  display: flex;
  gap: 20px;
  padding: 10px 14px;
  background: var(--night);
  border-radius: 8px;
  margin-top: 25px;
  flex-wrap: wrap;
  font-size: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--steel);
}

.legend-line {
  width: 20px;
  height: 2px;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border-width: 1px;
  border-style: solid;
}
```

---

## Migration von bestehendem Code

Die aktuelle `BracketLegend.tsx` enthält möglicherweise andere Strukturen. Ein vollständiger Rewrite ist erforderlich, um exakt dem Mockup zu entsprechen.

---

## Mockup-Referenz

Aus `bracket-tree-dynamic-svg.html`:

```html
<div class="legend">
  <div class="legend-item">
    <div class="legend-line blue"></div>
    Qualifikation
  </div>
  <div class="legend-item">
    <div class="legend-line green"></div>
    Winner Bracket
  </div>
  <div class="legend-item">
    <div class="legend-line red"></div>
    Loser Bracket
  </div>
  <div class="legend-item">
    <div class="legend-line gold"></div>
    Grand Finale
  </div>
  <div class="legend-item">
    <div class="legend-color winner"></div>
    Platz 1+2 (weiter)
  </div>
  <div class="legend-item">
    <div class="legend-color loser"></div>
    Platz 3+4 (raus/LB)
  </div>
  <div class="legend-item">
    <span style="color: var(--neon-cyan); font-weight: 600;">3x</span>
    3-Pilot Heat
  </div>
</div>
```

---

## Definition of Done

- [x] Alle Akzeptanzkriterien erfüllt
- [x] BracketLegend mit Mockup-Design
- [x] Alle Bracket-Typ Linien vorhanden (4 Stück: Quali, WB, LB, GF)
- [x] Platzierungs-Farbboxen vorhanden (2 Stück: Platz 1+2, Platz 3+4)
- [x] 3-Pilot Heat Indikator vorhanden
- [x] Flex-Layout mit Wrap funktioniert
- [x] Visueller Vergleich mit Mockup erfolgreich
- [x] Tests bestehen (30/30 Tests in 2 Test-Dateien)
- [x] Code Review durchgeführt

---

## Implementierungs-Notizen

### Geänderte Dateien:
1. `src/components/bracket/BracketLegend.tsx` - Bereits korrekt implementiert nach Mockup
2. `src/globals.css` - CSS-Klassen bereits vorhanden (Zeilen 940-977)
3. `tests/bracket-legend.test.tsx` - Aktualisiert für neues Design (Tests nutzten veraltete Klassen)

### Design-Entscheidungen:
- **Inline Styles statt CSS-Klassen** für Farben: Die Implementierung nutzt inline styles (`backgroundColor`, `borderColor`) statt CSS-Klassen wie `.green`, `.red`, `.gold`, `.winner`, `.loser`. Dies ermöglicht flexiblere Farb-Konfiguration über die data-driven Arrays.
- **7 Legend-Items total**: 4 Line-Items (Quali, WB, LB, GF) + 2 Color-Items (Platz 1+2, Platz 3+4) + 1 Spezial-Item (3x = 3-Pilot Heat)

### Test-Abdeckung:
- `tests/us-14-9-bracket-legend.test.tsx`: 16 Tests für US-14.9 spezifische Anforderungen
- `tests/bracket-legend.test.tsx`: 14 Tests für Story 11-7 (aktualisiert für neues Design)
