---
date: 2026-01-01
author: Winston (Architect)
type: documentation
context: Epic 12 - Vertical Bracket Redesign
status: draft
---

# FPV Racing Heats - Turnier-Ablauf & Spielregeln

## Das Grundprinzip

Das Turnier-Format basiert auf dem **Double-Elimination-Prinzip**: Jeder Pilot hat zwei Leben und damit zwei Chancen, das Turnier zu überstehen.

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

### Das Ziel

Jeder Pilot soll **mindestens zweimal fliegen** können. Ein einmaliger Verlust bedeutet nicht das Turnieraus – erst die zweite Niederlage eliminiert einen Piloten endgültig.

---

## Die Lebens-Regel

| Leben | Status | Bedeutung |
|-------|--------|-----------|
| Leben 1 | Aktiv | Du bist im Winner Bracket, keine Niederlage |
| Leben 2 | Aktiv | Du bist im Loser Bracket, eine Niederlage kassiert |
| Kein Leben | Eliminiert | Zwei Niederlagen → Turnier vorbei |

**Merksatz:** "Erst im Loser Bracket fliegst du raus!"

## Der Ablauf (32 Piloten Beispiel)

### 1. Qualifikation

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

### 2. Winner Bracket Runde 1

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

### 3. Loser Bracket Runde 1

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

### 4. Winner Bracket Runde 2

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

### 5. Loser Bracket Runde 2

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

### 6. Winner Bracket Finale

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

### 7. Loser Bracket Runde 3

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

### 8. Loser Bracket Runde 4

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

### 9. Loser Bracket Finale

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
└─ 2 Piloten → PLATZ 3 & 4
```

---

### 10. Grand Finale

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

## Zusammenfassung: Heat-Übersicht

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

---

## Verteilung der Pilot:innen

| Bracket | Heats | Anteil |
|---------|-------|--------|
| Quali | 8 | 25% |
| WB | 7 | 22% |
| LB | 16 | 50% |
| Finale | 1 | 3% |

---

## Die Goldenen Regeln

| # | Regel | Beschreibung |
|---|-------|--------------|
| 1 | **Quali entscheidet** | Platz 1+2 = WB, Platz 3+4 = LB |
| 2 | **WB = 1. Chance** | 1. Niederlage → LB |
| 3 | **LB = 2. Chance** | 2. Niederlage → Rausfliegen |
| 4 | **Nur 1× rausfliegen** | Wer raus ist, kommt nicht wieder |
| 5 | **Grand Finale = Best of the Best** | 4 Piloten kämpfen um Platz 1-4 |

---

## Beispiel 1: Lisa Schmidts Turnier-Reise (früh raus)

| Phase | Ergebnis | Konsequenz |
|-------|----------|------------|
| Quali | Platz 3 | → LOSER BRACKET (1. Leben verbraucht) |
| LB R1 | Platz 1 | → LB RUNDE 2 (überlebt!) |
| LB R2 | Platz 3 | → RAUSFLIEGEN! (2. Niederlage) |

Lisa ist raus, aber hatte ihre 2. Chance!

---

## Beispiel 2: Max Müllers langer Weg (spät raus)

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

## Beispiel 3: Sarah Fischers Comeback-Story (Turniersieg aus dem LB!)

| Phase | Ergebnis | Konsequenz |
|-------|----------|------------|
| Quali | Platz 4 | → LOSER BRACKET (1. Leben verbraucht) |
| LB R1 | Platz 1 | → LB RUNDE 2 (überlebt!) |
| LB R2 | Platz 2 | → LB RUNDE 3 (überlebt!) |
| LB R3 | Platz 1 | → LB RUNDE 4 (überlebt!) |
| LB R4 | Platz 1 | → LB FINALE (überlebt!) |
| LB Finale | Platz 1 | → GRAND FINALE (geschafft!) |
| Grand Finale | Platz 1 | → **TURNIERSIEG!** 🏆 |

Sarah hat in der Quali als Letzte abgeschnitten, aber sich durch das komplette Loser Bracket gekämpft und am Ende das Turnier gewonnen – eine echte Underdog-Story! Sie hat insgesamt **7 Heats** geflogen, mehr als jeder andere Pilot.

---

## Beispiel 4: Tom Bergers direkter Weg (Vizemeister ohne Niederlage)

| Phase | Ergebnis | Konsequenz |
|-------|----------|------------|
| Quali | Platz 1 | → WINNER BRACKET (1. Leben intakt) |
| WB R1 | Platz 1 | → WB RUNDE 2 (weiter im WB!) |
| WB R2 | Platz 2 | → WB FINALE (weiter im WB!) |
| WB Finale | Platz 1 | → GRAND FINALE (direkt qualifiziert!) |
| Grand Finale | Platz 2 | → **2. PLATZ** 🥈 |

Tom ist den kürzesten Weg durchs Turnier gegangen – nur **5 Heats** geflogen und nie ins Loser Bracket gefallen. Trotzdem hat er im Grand Finale gegen Sarah (die aus dem LB kam) knapp verloren. Das zeigt: Im Finale zählt nur der eine Heat!

---

## Besonderheiten

### Ungerade Pilotenzahlen

Bei anderen Teilnehmerzahlen (24, 48 Piloten) passen sich die Heat-Anzahlen entsprechend an. Das Grundprinzip bleibt gleich:
- WB: 0 Niederlagen
- LB: 1 Niederlage
- Eliminiert: 2 Niederlagen
