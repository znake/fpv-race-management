---
date: 2026-01-01
author: Winston (Architect)
type: documentation
context: Epic 12 - Vertical Bracket Redesign
status: draft
---

# FPV Racing Heats - Turnier-Ablauf & Spielregeln

## 1. Das Grundprinzip

Das Turnier-Format basiert auf dem **Double-Elimination-Prinzip**: Jeder Pilot hat zwei Leben und damit zwei Chancen, das Turnier zu überstehen.

### Die Lebens-Regel

| Leben | Status | Bedeutung |
|-------|--------|-----------|
| Leben 1 | Aktiv | Du bist im Winner Bracket, keine Niederlage |
| Leben 2 | Aktiv | Du bist im Loser Bracket, eine Niederlage kassiert |
| Kein Leben | Eliminiert | Zwei Niederlagen → Turnier vorbei |

**Merksatz:** "Erst im Loser Bracket fliegst du raus!"

### Die Goldenen Regeln

| # | Regel | Beschreibung |
|---|-------|--------------|
| 1 | **Quali entscheidet** | Platz 1+2 = WB, Platz 3+4 = LB |
| 2 | **WB = 1. Chance** | 1. Niederlage → LB |
| 3 | **LB = 2. Chance** | 2. Niederlage → Rausfliegen |
| 4 | **Nur 1× rausfliegen** | Wer raus ist, kommt nicht wieder |
| 5 | **Grand Finale = Best of the Best** | 4 Piloten kämpfen um Platz 1-4 |

### Das Ziel

Jeder Pilot soll **mindestens zweimal fliegen** können. Ein einmaliger Verlust bedeutet nicht das Turnieraus – erst die zweite Niederlage eliminiert einen Piloten endgültig.

---

## 2. Die Turnier-Phasen

### Qualifikation

Alle Piloten werden zufällig in Heats eingeteilt. Die Heat-Größe beträgt standardmäßig 4 Piloten. Bei einer ungeraden Gesamtzahl werden auch 3er-Heats verwendet, damit alle Piloten fliegen können.

**Beispiel:** Bei 10 Piloten → 2× Dreier-Heats + 1× Vierer-Heat.

| Heat-Größe | Top 2 Plätze | Untere Plätze |
|------------|--------------|---------------|
| 4 Piloten | → WINNER BRACKET | → LOSER BRACKET |
| 3 Piloten | → WINNER BRACKET | → LOSER BRACKET |

### Winner Bracket

Im Winner Bracket sind alle Piloten mit ihrem ersten "Leben". Hier gilt:

- **Gewinnen (Platz 1-2):** Du sicherst dein erstes Leben und kommst in die nächste Runde des Winner Brackets.
- **Verlieren (Platz 3-4):** Du verlierst dein erstes Leben, hast aber eine zweite Chance und wandert in die nächste Runde des Loser Brackets.

### Loser Bracket

Im Loser Bracket sammeln sich alle Piloten, die bereits einmal verloren haben. Hier gilt:

- **Gewinnen (Platz 1-2):** Du überlebt und kommst in die nächste Runde des Loser Brackets.
- **Verlieren (Platz 3-4):** Du verlierst dein zweites Leben und bist eliminiert.

### Warum gibt es mehr Loser-Bracket-Runden?

Weil nach jeder Winner-Bracket-Runde die Verlierer (Platz 3-4) ins Loser Bracket hinzustoßen. Das bedeutet: Das Loser Bracket wächst mit jeder Runde an und hat daher mehr Phasen als das Winner Bracket.

### Grand Finale

Im Grand Finale treffen die besten 4 Piloten aufeinander:
- 2 Piloten aus dem Winner Bracket (nie verloren)
- 2 Piloten aus dem Loser Bracket (1× verloren)

| Ergebnis | Ziel |
|----------|------|
| Platz 1 | → SIEGER |
| Platz 2 | → 2. PLATZ |
| Platz 3 | → 3. PLATZ |
| Platz 4 | → 4. PLATZ |

### Grand Finale Rematch-Regel

#### Das Problem

Im Grand Finale treffen 2 Piloten aus dem Winner Bracket (nie verloren) auf 2 Piloten aus dem Loser Bracket (1× verloren). Ohne Rematch-Regel könnte ein LB-Pilot das Turnier gewinnen, obwohl ein WB-Pilot nie eine zweite Chance bekommen hat – das widerspricht dem Double-Elimination-Prinzip.

#### Die Lösung: Automatisches Rematch

Nach dem Grand Finale Heat wird automatisch ein **1v1-Rematch** gespielt, wenn die Bedingungen erfüllt sind:

| Grand Finale Platz | Wenn Pilot aus LB | Rematch gegen |
|--------------------|-------------------|---------------|
| Platz 1 | ✓ | Platz 3 (wenn aus WB) |
| Platz 2 | ✓ | Platz 4 (wenn aus WB) |
| Platz 3 | – | Kein Rematch |
| Platz 4 | – | Kein Rematch |

#### Ablauf nach dem Grand Finale Heat

```
1. Prüfe Platz 1:
   └─ Ist LB-Pilot UND Platz 3 ist WB-Pilot?
      → JA: Rematch 1v1 zwischen Platz 1 und Platz 3
      → NEIN: Kein Rematch für Platz 1

2. Prüfe Platz 2:
   └─ Ist LB-Pilot UND Platz 4 ist WB-Pilot?
      → JA: Rematch 1v1 zwischen Platz 2 und Platz 4
      → NEIN: Kein Rematch für Platz 2

3. Rematch-Ergebnis:
   └─ Gewinner bekommt den höheren Platz
   └─ Verlierer bekommt den niedrigeren Platz
```

#### Warum diese Regel fair ist

- **WB-Piloten** haben sich durch das ganze Turnier ohne Niederlage gekämpft – sie verdienen ihre zweite Chance
- **LB-Piloten** müssen im Rematch beweisen, dass ihr Finale-Ergebnis kein Zufall war
- Die Regel gilt nur für **direkte Nachbarn** (1↔3, 2↔4) – wer deutlich schlechter fliegt, löst kein Rematch aus

---

## 3. Beispiel-Ablauf (32 Piloten)

### 3.1 Qualifikation

**8 Heats × 4 Piloten = 32 Piloten**

| Ergebnis | Ziel |
|----------|------|
| Platz 1+2 | → WINNER BRACKET (1. Leben intakt) |
| Platz 3+4 | → LOSER BRACKET (1. Leben verbraucht) |

```markdown
32 Piloten
├─ 16 Piloten → WINNER BRACKET
└─ 16 Piloten → LOSER BRACKET
```

---

### 3.2 Winner Bracket Runde 1

**4 Heats × 4 Piloten = 16 Piloten**

| Ergebnis | Ziel |
|----------|------|
| Platz 1+2 | → WB RUNDE 2 |
| Platz 3+4 | → INS LOSER BRACKET RUNDE 1 |

```markdown
16 Piloten
├─ 8 Piloten → WB RUNDE 2
└─ 8 Piloten → LB R1
```

---

### 3.3 Loser Bracket Runde 1

**6 Heats × 4 Piloten = 24 Piloten**

| Ergebnis | Ziel |
|----------|------|
| Platz 1+2 | → LB RUNDE 2 |
| Platz 3+4 | → RAUSFLIEGEN! |

**Zusammensetzung:**
- 16 Piloten aus Quali (Platz 3+4)
- 8 Piloten aus WB R1 (Platz 3+4)

```markdown
24 Piloten
├─ 12 Piloten → LB R2
└─ 12 Piloten → ELIMINIERT
```

---

### 3.4 Winner Bracket Runde 2

**2 Heats × 4 Piloten = 8 Piloten**

| Ergebnis | Ziel |
|----------|------|
| Platz 1+2 | → WB FINALE |
| Platz 3+4 | → INS LOSER BRACKET RUNDE 2 |

```markdown
8 Piloten
├─ 4 Piloten → WB FINALE
└─ 4 Piloten → LB R2
```

---

### 3.5 Loser Bracket Runde 2

**4 Heats × 4 Piloten = 16 Piloten**

| Ergebnis | Ziel |
|----------|------|
| Platz 1+2 | → LB RUNDE 3 |
| Platz 3+4 | → RAUSFLIEGEN! |

**Zusammensetzung:**
- 12 Piloten aus LB R1 (Gewinner)
- 4 Piloten aus WB R2 (Platz 3+4)

```markdown
16 Piloten
├─ 8 Piloten → LB R3
└─ 8 Piloten → ELIMINIERT
```

---

### 3.6 Winner Bracket Finale

**1 Heat × 4 Piloten = 4 Piloten**

| Ergebnis | Ziel |
|----------|------|
| Platz 1+2 | → GRAND FINALE |
| Platz 3+4 | → INS LOSER BRACKET RUNDE 3 |

```markdown
4 Piloten
├─ 2 Piloten → GRAND FINALE
└─ 2 Piloten → LB R3
```

---

### 3.7 Loser Bracket Runde 3

**10 Piloten = 2× Dreier-Heats + 1× Vierer-Heat**

| Heat-Typ | Anzahl | Piloten |
|----------|--------|---------|
| Dreier-Heat | 2× | 6 Piloten |
| Vierer-Heat | 1× | 4 Piloten |
| **Gesamt** | **3 Heats** | **10 Piloten** |

| Ergebnis | Ziel |
|----------|------|
| Platz 1+2 | → LB RUNDE 4 |
| Platz 3+4 | → RAUSFLIEGEN! |

**Zusammensetzung:**
- 8 Piloten aus LB R2 (Gewinner)
- 2 Piloten aus WB Finale (Platz 3+4)

```markdown
10 Piloten
├─ 6 Piloten → LB R4
└─ 4 Piloten → ELIMINIERT
```

---

### 3.8 Loser Bracket Runde 4

**6 Piloten = 2× Dreier-Heats**

| Heat-Typ | Anzahl | Piloten |
|----------|--------|---------|
| Dreier-Heat | 2× | 6 Piloten |

| Ergebnis | Ziel |
|----------|------|
| Platz 1+2 | → LB FINALE |
| Platz 3 | → ELIMINIERT |

**Zusammensetzung:**
- 6 Piloten aus LB R3 (Gewinner)

```markdown
6 Piloten
├─ 4 Piloten → LB FINALE
└─ 2 Piloten → ELIMINIERT
```

---

### 3.9 Loser Bracket Finale

**4 Piloten = 1× Vierer-Heat**

**Zusammensetzung:**
- 4 Piloten aus LB R4 (Gewinner)

| Ergebnis | Ziel |
|----------|------|
| Platz 1 | → GRAND FINALE |
| Platz 2 | → GRAND FINALE |
| Platz 3 | → 5. PLATZ (Gesamt-Turnier) |
| Platz 4 | → 6. PLATZ (Gesamt-Turnier) |

```markdown
4 Piloten
├─ 2 Piloten → GRAND FINALE
└─ 2 Piloten → PLATZ 5 & 6
```

---

### 3.10 Grand Finale

**1 Heat × 4 Piloten = 4 Piloten**

**Zusammensetzung:**
- 2 Piloten aus WB Finale (Platz 1+2)
- 2 Piloten aus LB Finale (Platz 1+2)

| Ergebnis | Ziel |
|----------|------|
| Platz 1 | → SIEGER |
| Platz 2 | → 2. PLATZ |
| Platz 3 | → 3. PLATZ |
| Platz 4 | → 4. PLATZ |

---

### Heat-Übersicht (32 Piloten)

| Phase | Heats | Pilot-Eintritte | Elimination |
|-------|-------|-----------------|-------------|
| Quali | 8 | 32 | 0 |
| WB R1 | 4 | 0 | 0 |
| LB R1 | 6 | 8 | 12 |
| WB R2 | 2 | 0 | 0 |
| LB R2 | 4 | 4 | 8 |
| WB Finale | 1 | 0 | 0 |
| LB R3 | 3 | 2 | 4 |
| LB R4 | 2 | 0 | 2 |
| LB Finale | 1 | 0 | 2 |
| Grand Finale | 1 | 4 | 4 |
| **GESAMT** | **32** | **32** | **28** |

### Verteilung der Pilot:innen

| Bracket | Heats | Anteil |
|---------|-------|--------|
| Quali | 8 | 25% |
| WB | 7 | 22% |
| LB | 16 | 50% |
| Finale | 1 | 3% |

---

## 4. Pilot-Beispiele

### Beispiel 1: Lisa Schmidts Turnier-Reise (früh raus)

| Phase | Ergebnis | Konsequenz |
|-------|----------|------------|
| Quali | Platz 3 | → LOSER BRACKET (1. Leben verbraucht) |
| LB R1 | Platz 1 | → LB RUNDE 2 (überlebt!) |
| LB R2 | Platz 3 | → RAUSFLIEGEN! (2. Niederlage) |

Lisa ist raus, aber hatte ihre 2. Chance!

---

### Beispiel 2: Max Müllers langer Weg (spät raus)

| Phase | Ergebnis | Konsequenz |
|-------|----------|------------|
| Quali | Platz 1 | → WINNER BRACKET (1. Leben intakt) |
| WB R1 | Platz 2 | → WB RUNDE 2 (weiter im WB!) |
| WB R2 | Platz 4 | → LOSER BRACKET R2 (1. Leben verbraucht) |
| LB R2 | Platz 1 | → LB RUNDE 3 (überlebt!) |
| LB R3 | Platz 2 | → LB RUNDE 4 (überlebt!) |
| LB R4 | Platz 3 | → RAUSFLIEGEN! (2. Niederlage) |

Max hat lange gekämpft – 6 Heats geflogen und erst in LB R4 verloren!

---

### Beispiel 3: Sarah Fischers Comeback-Story (Turniersieg aus dem LB!)

| Phase | Ergebnis | Konsequenz |
|-------|----------|------------|
| Quali | Platz 4 | → LOSER BRACKET (1. Leben verbraucht) |
| LB R1 | Platz 1 | → LB RUNDE 2 (überlebt!) |
| LB R2 | Platz 2 | → LB RUNDE 3 (überlebt!) |
| LB R3 | Platz 1 | → LB RUNDE 4 (überlebt!) |
| LB R4 | Platz 1 | → LB FINALE (überlebt!) |
| LB Finale | Platz 1 | → GRAND FINALE (geschafft!) |
| Grand Finale | Platz 1 | → **TURNIERSIEG!** |

Sarah hat in der Quali als Letzte abgeschnitten, aber sich durch das komplette Loser Bracket gekämpft und am Ende das Turnier gewonnen – eine echte Underdog-Story! Sie hat insgesamt **7 Heats** geflogen, mehr als jeder andere Pilot.

---

### Beispiel 4: Tom Bergers Revanche (Rematch zum Vizemeister!)

| Phase | Ergebnis | Konsequenz |
|-------|----------|------------|
| Quali | Platz 1 | → WINNER BRACKET |
| WB R1 | Platz 1 | → WB RUNDE 2 |
| WB R2 | Platz 2 | → WB FINALE |
| WB Finale | Platz 2 | → GRAND FINALE |
| Grand Finale | Platz 4 | → Rematch gegen Platz 2 (Sarah ist LB) |
| Rematch | Sieg vs Sarah | → **2. PLATZ** |

**Grand Finale Ergebnis:**

| Platz | Pilot | Herkunft |
|-------|-------|----------|
| 1 | Lisa | WB |
| 2 | Sarah | LB |
| 3 | Max | LB |
| 4 | Tom | WB |

**Rematch-Prüfung:**
- Platz 1 (Lisa): WB-Pilot → Kein Rematch
- Platz 2 (Sarah): LB-Pilot + Platz 4 (Tom) ist WB → **Rematch!**

**Rematch: Tom vs Sarah**

| Rematch | Ergebnis | Konsequenz |
|---------|----------|------------|
| Tom vs Sarah | Tom gewinnt! | Tom → **Platz 2**, Sarah → Platz 4 |

**Finale Platzierung nach Rematch:**

| Platz | Pilot | Herkunft |
|-------|-------|----------|
| 1 | Lisa | WB |
| 2 | Tom | WB |
| 3 | Max | LB |
| 4 | Sarah | LB |

Tom hatte im Grand Finale Heat einen schlechten Tag und landete auf Platz 4. Aber dank der Rematch-Regel bekam er als WB-Pilot seine verdiente zweite Chance – und nutzte sie! Er kämpfte sich vom letzten Platz auf den **Vizemeister-Titel**.

Das zeigt: Im Double Elimination bekommt jeder seine zwei Chancen – auch im Finale!

---

## 5. Rematch-Szenarien (Referenz)

### Szenario A: WB dominiert → Kein Rematch

| Platz | Pilot | Herkunft | Rematch? |
|-------|-------|----------|----------|
| 1 | Tom | WB | Ist WB-Pilot |
| 2 | Lisa | WB | Ist WB-Pilot |
| 3 | Sarah | LB | – |
| 4 | Max | LB | – |

**Ergebnis:** Turnier vorbei. Tom ist Sieger.

---

### Szenario B: LB gewinnt, WB auf Platz 3 → 1 Rematch

| Platz | Pilot | Herkunft | Rematch? |
|-------|-------|----------|----------|
| 1 | Sarah | LB | Platz 3 ist WB → Rematch |
| 2 | Tom | WB | Kein Rematch |
| 3 | Lisa | WB | Rematch gegen Platz 1 |
| 4 | Max | LB | – |

**Automatisches Rematch:** Sarah vs Lisa (1v1 für Platz 1 & 3)

| Rematch-Ergebnis | Finale Platzierung |
|------------------|-------------------|
| Lisa gewinnt | Lisa → **Platz 1**, Sarah → Platz 3 |
| Sarah gewinnt | Sarah bleibt **Platz 1**, Lisa bleibt Platz 3 |

---

### Szenario C: Beide LB-Piloten auf 1+2 → 2 Rematches

| Platz | Pilot | Herkunft | Rematch? |
|-------|-------|----------|----------|
| 1 | Sarah | LB | Platz 3 ist WB → Rematch |
| 2 | Max | LB | Platz 4 ist WB → Rematch |
| 3 | Tom | WB | Rematch gegen Platz 1 |
| 4 | Lisa | WB | Rematch gegen Platz 2 |

**2 automatische Rematches:**
1. Sarah vs Tom (für Platz 1 & 3)
2. Max vs Lisa (für Platz 2 & 4)

---

### Szenario D: LB gewinnt, aber Platz 3 auch LB → Kein Rematch

| Platz | Pilot | Herkunft | Rematch? |
|-------|-------|----------|----------|
| 1 | Sarah | LB | Prüfe Platz 3... |
| 2 | Tom | WB | Ist WB-Pilot |
| 3 | Max | LB | Ist LB-Pilot |
| 4 | Lisa | WB | – |

**Kein Rematch für Platz 1!** Sarah bleibt Turniersiegerin.

*Warum?* Lisa (WB) ist auf Platz 4 – sie war zu weit hinten. Die WB-"Versicherung" gilt nur für den direkten Nachbarn.

---

## 6. Besonderheiten

### Ungerade Pilotenzahlen

Bei anderen Teilnehmerzahlen (24, 48 Piloten) passen sich die Heat-Anzahlen entsprechend an. Das Grundprinzip bleibt gleich:
- WB: 0 Niederlagen
- LB: 1 Niederlage
- Eliminiert: 2 Niederlagen
