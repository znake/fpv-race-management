# Change Proposal: Bracket-Struktur Redesign

**Datum:** 2025-12-16  
**Autor:** PM  
**Status:** Proposed  
**Betrifft:** Story 4-3 (Bracket-Visualisierung)

---

## 1. Problem Statement

Die aktuelle Bracket-Implementierung entspricht **nicht** der erwarteten Double-Elimination-Struktur:

### Ist-Zustand (Problematisch)
- Alle Initial-Heats werden als flache Liste im "Winner Bracket" angezeigt
- Keine echte Baumstruktur mit Progression
- Loser-Bracket wird nur als Nebenprodukt der Ergebnisse gezeigt
- Keine Qualifikationsrunde als separate Sektion
- Bracket-Struktur ist nicht von Anfang an sichtbar

### Soll-Zustand (Erwartung)
- **3 separate Sektionen:** Qualifikation → Winner Bracket → Loser Bracket
- Klassische **Esports-Bracket-Baumstruktur** mit Verbindungslinien
- Struktur **von Anfang an sichtbar** (leere Platzhalter)
- **Automatischer View-Wechsel** nach Heat-Abschluss zum Bracket

---

## 2. Neue Anforderungen

### 2.1 Drei-Sektionen-Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         QUALIFIKATION (Runde 1)                             │
│                                                                             │
│   [Heat 1]    [Heat 2]    [Heat 3]    [Heat 4]    [Heat 5]    ...          │
│                                                                             │
│   → Platz 1+2 → Winner Bracket                                              │
│   → Platz 3+4 → Loser Bracket                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            WINNER BRACKET                                   │
│                                                                             │
│   Runde 2         Runde 3         Semifinale      WB Finale                │
│                                                                             │
│   [WB-1]────┐                                                               │
│             ├────[WB-5]────┐                                                │
│   [WB-2]────┘              │                                                │
│                            ├────[WB Semi]────┐                              │
│   [WB-3]────┐              │                 │                              │
│             ├────[WB-6]────┘                 ├────[WB Final]                │
│   [WB-4]────┘                                │                              │
│                                              │                              │
└──────────────────────────────────────────────┼──────────────────────────────┘
                                               │
                              ┌────────────────┴────────────────┐
                              │         GRAND FINALE            │
                              │                                 │
                              │   WB Winner vs LB Winner        │
                              │         [FINALE]                │
                              │                                 │
                              └────────────────┬────────────────┘
                                               │
┌──────────────────────────────────────────────┼──────────────────────────────┐
│                            LOSER BRACKET     │                              │
│                                              │                              │
│   LB Runde 1      LB Runde 2      LB Semi    LB Finale                      │
│                                                                             │
│   [LB-1]────┐                                                               │
│             ├────[LB-3]────┐                                                │
│   [LB-2]────┘              │                                                │
│                            ├────[LB Semi]────[LB Final]────┘                │
│   [LB-3]────┐              │                                                │
│             ├────[LB-4]────┘                                                │
│   [LB-4]────┘                                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Bracket-Berechnung basierend auf Pilotenanzahl

| Piloten | Quali-Heats | WB Runden | LB Runden | Gesamt Heats |
|---------|-------------|-----------|-----------|--------------|
| 7-8     | 2           | 1         | 1         | ~5           |
| 9-12    | 3           | 2         | 2         | ~8           |
| 13-16   | 4           | 2         | 3         | ~12          |
| 17-24   | 5-6         | 3         | 4         | ~18          |
| 25-32   | 7-8         | 3         | 5         | ~25          |
| 33-48   | 9-12        | 4         | 6         | ~35          |
| 49-60   | 13-15       | 4         | 7         | ~45          |

### 2.3 Visuelle Darstellung

#### Leere Platzhalter (vor Befüllung)
```
┌─────────────────┐
│  HEAT ?         │
│  ┌───┐ ┌───┐    │
│  │ ? │ │ ? │    │  ← Gestrichelte Border
│  └───┘ └───┘    │     Grauer Text "Wartet..."
│  ┌───┐ ┌───┐    │
│  │ ? │ │ ? │    │
│  └───┘ └───┘    │
└─────────────────┘
```

#### Befüllte HeatBox
```
┌─────────────────┐
│  HEAT 5         │
│  ┌───┐ Anna  1  │  ← Gold Badge
│  │ 🖼 │         │
│  └───┘ Ben   2  │  ← Cyan Badge
│  ┌───┐ Chris 3  │  ← Pink Badge (→ Loser)
│  │ 🖼 │         │
│  └───┘ Dana  4  │  ← Pink Badge (→ Loser)
└─────────────────┘
```

### 2.4 Automatischer View-Wechsel

**Nach Heat-Abschluss:**
1. Ergebnis wird bestätigt (Fertig-Button)
2. **Automatisch** zum Bracket-Tab wechseln
3. Kurze Animation zeigt, wo Piloten gelandet sind
4. Optional: Nach 3-5 Sekunden zurück zum Heats-Tab (oder manuell)

**Oder alternativ:**
- Modal/Overlay das kurz die Bracket-Änderung zeigt
- "Weiter zum nächsten Heat" Button

---

## 3. Betroffene Komponenten

### Zu ändern:

| Datei | Änderung |
|-------|----------|
| `src/lib/bracket-calculator.ts` | **Komplett neu:** 3-Sektionen-Struktur berechnen |
| `src/components/bracket-tree.tsx` | **Komplett neu:** Klassische Bracket-Baum-Darstellung |
| `src/stores/tournamentStore.ts` | Bracket-Struktur bei Turnier-Start generieren |
| `src/App.tsx` | Auto-Tab-Wechsel nach Heat-Abschluss |

### Neu zu erstellen:

| Datei | Beschreibung |
|-------|--------------|
| `src/lib/bracket-structure-generator.ts` | Berechnet komplette Struktur basierend auf Pilotenanzahl |
| `src/components/bracket-section.tsx` | Wiederverwendbare Sektion (Quali/Winner/Loser) |
| `src/components/bracket-connection-lines.tsx` | SVG-Verbindungen zwischen Heats |

---

## 4. Akzeptanzkriterien (Aktualisiert)

### AC 1: Drei-Sektionen-Layout ✨ NEU
**Given** ein Turnier wurde gestartet  
**When** ich den Bracket-Tab öffne  
**Then** sehe ich drei separate Bereiche:
- Qualifikation (oben) - Alle Initial-Heats
- Winner Bracket (mitte) - Klassische Baumstruktur
- Loser Bracket (unten) - Klassische Baumstruktur

### AC 2: Vorab sichtbare Struktur ✨ NEU
**Given** ein Turnier wurde gestartet  
**When** noch keine Heats gespielt wurden  
**Then** sehe ich die komplette Bracket-Struktur mit leeren Platzhaltern  
**And** gestrichelte Borders zeigen "Wartet..." an

### AC 3: Klassische Bracket-Darstellung ✨ NEU
**Given** ich betrachte das Winner- oder Loser-Bracket  
**When** ich die Struktur anschaue  
**Then** sehe ich eine Baumstruktur wie bei Esports-Turnieren  
**And** Verbindungslinien zeigen Progression von links nach rechts

### AC 4: Automatischer View-Wechsel ✨ NEU
**Given** ein Heat wurde abgeschlossen  
**When** ich auf "Fertig" klicke  
**Then** wechselt die Ansicht automatisch zum Bracket-Tab  
**And** die neuen Positionen der Piloten sind hervorgehoben

### AC 5: Dynamische Bracket-Größe ✨ NEU
**Given** ein Turnier mit X Piloten  
**When** das Bracket generiert wird  
**Then** hat es die korrekte Anzahl Runden basierend auf Pilotenanzahl

---

## 5. Risiken & Aufwand

### Risiken

| Risiko | Auswirkung | Mitigation |
|--------|------------|------------|
| Komplexität der Berechnung | Hoch | Schrittweise implementieren, Tests first |
| Breaking Changes | Hoch | Bestehende Tests anpassen |
| Performance bei vielen Piloten | Mittel | Lazy Rendering, Virtualisierung |

### Aufwand-Schätzung

| Komponente | Story Points | Anmerkung |
|------------|--------------|-----------|
| Bracket-Struktur-Generator | 5 | Komplexe Mathematik |
| BracketTree Redesign | 8 | Komplett neu, SVG-Linien |
| Auto-View-Wechsel | 2 | Relativ einfach |
| Tests | 3 | Viele Edge Cases |
| **Gesamt** | **18** | ~2-3 Tage Entwicklung |

---

## 6. Empfehlung

### Option A: Story 4-3 überarbeiten (Empfohlen)
- Story 4-3 als "nicht fertig" markieren
- Neue Sub-Tasks für die korrekte Implementierung erstellen
- Bestehenden Code refactoren

### Option B: Neue Story erstellen
- Story 4-3 als "Done (mit Einschränkungen)" belassen
- Neue Story "4-4: Bracket-Struktur Redesign" erstellen
- Später implementieren

### Meine Empfehlung: **Option A**

Die aktuelle Implementierung entspricht nicht den ursprünglichen Anforderungen aus der Story. Es ist besser, jetzt zu korrigieren als später technische Schulden aufzubauen.

---

## 7. Nächste Schritte

1. [ ] Feedback von Jakob zu diesem Proposal
2. [ ] Story 4-3 Status auf "In Progress" zurücksetzen
3. [ ] Neue Tasks für Redesign erstellen
4. [ ] Implementierung starten

---

## Anhang: Beispiel Bracket für 16 Piloten

```
QUALIFIKATION (4 Heats × 4 Piloten = 16 Piloten)
================================================
  [Q1]          [Q2]          [Q3]          [Q4]
  A B C D       E F G H       I J K L       M N O P
  ↓ ↓ ↓ ↓       ↓ ↓ ↓ ↓       ↓ ↓ ↓ ↓       ↓ ↓ ↓ ↓
  1 2 3 4       1 2 3 4       1 2 3 4       1 2 3 4
  
  Platz 1+2 → Winner Bracket (8 Piloten)
  Platz 3+4 → Loser Bracket (8 Piloten)


WINNER BRACKET (8 Piloten → 4 → 2 → 1)
======================================
  Runde 2              Semifinale           WB Finale
  
  [Q1-1st]────┐
              ├────[WB-3]────┐
  [Q2-1st]────┘              │
                             ├────[WB Final]────→ Grand Finale
  [Q3-1st]────┐              │
              ├────[WB-4]────┘
  [Q4-1st]────┘


LOSER BRACKET (8 Piloten → 4 → 2 → 1)
=====================================
  LB Runde 1         LB Runde 2         LB Semi        LB Finale
  
  [Q1-3rd]────┐
              ├────[LB-3]────┐
  [Q2-3rd]────┘              │
                             ├────[LB Semi]────[LB Final]────→ Grand Finale
  [Q3-3rd]────┐              │
              ├────[LB-4]────┘
  [Q4-3rd]────┘


GRAND FINALE
============
  [WB Winner] vs [LB Winner]
  
  Platzierungen: 1, 2, 3, 4
```
