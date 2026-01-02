# FPV Racing Heats - Dynamischer Turnierbaum (32 Piloten)

## Neue Regelstruktur nach Epic 12

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                              QUALIFIKATION (8 Heats × 4 Piloten = 32 Piloten)                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║  H1           H2           H3           H4           H5           H6           H7           H8                                    ║
║ ┌───┐        ┌───┐        ┌───┐        ┌───┐        ┌───┐        ┌───┐        ┌───┐        ┌───┐                                 ║
║ │1 2│        │1 2│        │1 2│        │1 2│        │1 2│        │1 2│        │1 2│        │1 2│                                 ║
║ │3 4│        │3 4│        │3 4│        │3 4│        │3 4│        │3 4│        │3 4│        │3 4│                                 ║
║ └───┘        └───┘        └───┘        └───┘        └───┘        └───┘        └───┘        └───┘                                 ║
║   ↓            ↓            ↓            ↓            ↓            ↓            ↓            ↓                                      ║
║  WB           WB           WB           WB           WB           WB           WB           WB           (Platz 1-2 → WB)            ║
║  LB           LB           LB           LB           LB           LB           LB           LB           (Platz 3-4 → LB)            ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
                                                  ↓
                              ┌───────────────────┴───────────────────┐
                              ↓                                       ↓
                ╔═══════════════════════════════════════════════════════════════════════╗
                ║                      WINNER BRACKET (7 Heats)                          ║
                ╠═══════════════════════════════════════════════════════════════════════╣
                ║                                                                              ║
                ║  WB RUNDE 1 (4 Heats × 4 = 16 Piloten)                                         ║
                ║  ┌───┐  ┌───┐  ┌───┐  ┌───┐                                                       ║
                ║  │H1 │  │H2 │  │H3 │  │H4 │                                                       ║
                ║  │   │  │   │  │   │  │   │                                                       ║
                ║  └───┘  └───┘  └───┘  └───┘                                                       ║
                ║    ↓      ↓      ↓      ↓                                                         ║
                ║    └──────┴──────┴──────┘                                                         ║
                ║              ↓                                                                    ║
                ║  WB RUNDE 2 (2 Heats × 4 = 8 Piloten)                                         ║
                ║  ┌───┐  ┌───┐                                                                   ║
                ║  │H5 │  │H6 │                                                                   ║
                ║  │   │  │   │                                                                   ║
                ║  └───┘  └───┘                                                                   ║
                ║    ↓      ↓                                                                     ║
                ║    └──────┴──────┐                                                                ║
                ║                   ↓                                                               ║
                ║  WB FINALE (1 Heat × 4 = 4 Piloten)                                            ║
                ║  ┌─────┐                                                                        ║
                ║  │FIN  │                                                                        ║
                ║  │     │                                                                        ║
                ║  └─────┘                                                                        ║
                ║         ↓                    ↓                                                   ║
                ║          └────────────────────┴────────────────────────────────────────────────┐  ║
                ║                                                                                  ↓  ║
                ╚════════════════════════════════════════════════════════════════════════════════════╝
                                                                                                         ↓
                              ┌────────────────────────────────────────────────────────────────────────┘
                              ↓
                ╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
                ║                                   LOSER BRACKET (16 Heats)                                                      ║
                ╠═══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
                ║                                                                                                                       ║
                ║  LB RUNDE 1 (6 Heats × 4 = 24 Piloten)                                                                               ║
                ║  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                                                                               ║
                ║  │H1 │ │H2 │ │H3 │ │H4 │ │H5 │ │H6 │                                                                               ║
                ║  │   │ │   │ │   │ │   │ │   │ │   │                                                                               ║
                ║  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘                                                                               ║
                ║    ↓      ↓      ↓      ↓      ↓      ↓                                                                             ║
                ║    └──────┴──────┴──────┴──────┴──────┘                                                                             ║
                ║              ↓                                                                                                       ║
                ║  LB RUNDE 2 (4 Heats × 4 = 16 Piloten)                                                                               ║
                ║  ┌───┐ ┌───┐ ┌───┐ ┌───┐                                                                                           ║
                ║  │H7 │ │H8 │ │H9 │ │H10│                                                                                           ║
                ║  │   │ │   │ │   │ │   │                                                                                           ║
                ║  └───┘ └───┘ └───┘ └───┘                                                                                           ║
                ║    ↓      ↓      ↓      ↓                                                                                           ║
                ║    └──────┴──────┴──────┘                                                                                           ║
                ║              ↓                                                                                                       ║
                ║  LB RUNDE 3 (3 Heats: 2×3 + 1×4 = 10 Piloten)                                                                        ║
                ║       ┌───┐  ┌───┐  ┌─────┐                                                                                         ║
                ║       │H11 │  │H12 │  │H13  │                                                                                         ║
                ║       │3x  │  │3x  │  │4x   │                                                                                         ║
                ║       └───┘  └───┘  └─────┘                                                                                         ║
                ║         ↓      ↓       ↓                                                                                            ║
                ║         └──────┴───────┘                                                                                            ║
                ║                   ↓                                                                                                  ║
                ║  LB RUNDE 4 (2 Heats × 3 = 6 Piloten)                                                                                ║
                ║       ┌───┐  ┌───┐                                                                                                  ║
                ║       │H14 │  │H15 │                                                                                                  ║
                ║       │3x  │  │3x  │                                                                                                  ║
                ║       └───┘  └───┘                                                                                                  ║
                ║         ↓      ↓                                                                                                    ║
                ║         └──────┴──────┐                                                                                             ║
                ║                        ↓                                                                                             ║
                ║  LB FINALE (1 Heat × 4 = 4 Piloten)                                                                                  ║
                ║  ┌─────┐                                                                                                            ║
                ║  │FIN  │                                                                                                            ║
                ║  │     │                                                                                                            ║
                ║  └─────┘                                                                                                            ║
                ║         ↓                                                                                                           ║
                ║         └─────────────────────────────────────────────────────────────────────────────────┐                           ║
                ║                                                           ↓                                 ↓                     ║
                ╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
                                                                                                                                    ↓
                              ┌──────────────────────────────────────────────────────────────────────────────────────────────────────┘
                              ↓
                ╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
                ║                                            ★ GRAND FINALE ★                                                         ║
                ║                                      (1 Heat × 4 Piloten)                                                           ║
                ║                                                                                                                       ║
                ║     ┌─────────────────────────────────────────────────────────────────────────────────────────────┐                  ║
                ║     │  WB Sieger 1  │  WB Sieger 2  │  LB Sieger 1  │  LB Sieger 2  │                                          ║
                ║     │   (Platz 1)   │   (Platz 2)   │   (Platz 3)   │   (Platz 4)   │                                          ║
                ║     └─────────────────────────────────────────────────────────────────────────────────────────────┘                  ║
                ║                                                                                                                       ║
                ║                          ★ Rematch-Regel: Wenn LB-Pilot GF gewinnt ★                                                 ║
                ║     ┌─────────────────────────────────────────────────────────────────────────────────────────────┐                  ║
                ║     │  LB-Platz 1 + WB-Platz 3 → 1v1 Rematch | LB-Platz 2 + WB-Platz 4 → 1v1 Rematch          │                  ║
                ║     └─────────────────────────────────────────────────────────────────────────────────────────────┘                  ║
                ╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Heat-Übersicht (32 Piloten)

| Phase | Heats | Pilot-Eintritte | Heat-Größen | Elimination |
|-------|-------|-----------------|-------------|-------------|
| **Quali** | 8 | 32 | 8× 4 Piloten | 0 |
| **WB R1** | 4 | 0 | 4× 4 Piloten | 0 |
| **LB R1** | 6 | 8 | 6× 4 Piloten | 12 |
| **WB R2** | 2 | 0 | 2× 4 Piloten | 0 |
| **LB R2** | 4 | 4 | 4× 4 Piloten | 8 |
| **WB Finale** | 1 | 0 | 1× 4 Piloten | 0 |
| **LB R3** | 3 | 2 | 2× 3 Pil + 1× 4 Pil | 4 |
| **LB R4** | 2 | 0 | 2× 3 Piloten | 2 |
| **LB Finale** | 1 | 0 | 1× 4 Piloten | 2 |
| **Grand Finale** | 1 | 4 | 1× 4 Piloten | 4 |
| **GESAMT** | **32** | **32** | | **28** |

---

## Verteilung der Pilot:innen

| Bracket | Heats | Anteil |
|---------|-------|--------|
| Quali | 8 | 25% |
| WB | 7 | 22% |
| LB | 16 | 50% |
| Finale | 1 | 3% |

---

## Mermaid-Diagramm

```mermaid
flowchart TB
    subgraph Q["QUALIFIKATION - 8 Heats × 4 Piloten"]
        Q1[H1<br/>MB, LS, TW, AH]
        Q2[H2<br/>PF, SK, DM, JH]
        Q3[H3<br/>MK, LW, SB, NW]
        Q4[H4<br/>FK, ES, JL, MR]
        Q5[H5<br/>CH, KM, RZ, LB]
        Q6[H6<br/>AW, SH, TK, JF]
        Q7[H7<br/>NS, HG, BK, VL]
        Q8[H8<br/>LF, AP, MS, CW]
    end

    subgraph WB["WINNER BRACKET"]
        subgraph WBR1["WB R1 - 4 Heats × 4"]
            WB1[H1<br/>MB, PF, LS, SK]
            WB2[H2<br/>MK, FK, LW, ES]
            WB3[H3<br/>CH, AW, KM, SH]
            WB4[H4<br/>NS, LF, HG, AP]
        end

        subgraph WBR2["WB R2 - 2 Heats × 4"]
            WB5[H5<br/>MB, MK, PF, FK]
            WB6[H6<br/>CH, NS, AW, LF]
        end

        WBF[WB Finale<br/>MB, CH, MK, NS]
    end

    subgraph LB["LOSER BRACKET"]
        subgraph LBR1["LB R1 - 6 Heats × 4 = 24 Piloten"]
            LB1[H1<br/>TW, DM, AH, JH]
            LB2[H2<br/>SB, JL, NW, MR]
            LB3[H3<br/>RZ, TK, LB, JF]
            LB4[H4<br/>BK, MS, VL, CW]
            LB5[H5<br/>LS, SK, LW, ES]
            LB6[H6<br/>KM, SH, HG, AP]
        end

        subgraph LBR2["LB R2 - 4 Heats × 4 = 16 Piloten"]
            LB7[H7<br/>TW, SB, DM, JL]
            LB8[H8<br/>RZ, BK, TK, MS]
            LB9[H9<br/>LS, KM, SK, SH]
            LB10[H10<br/>PF, FK, AW, LF]
        end

        subgraph LBR3["LB R3 - 3 Heats = 10 Piloten<br/>2× 3 Pil + 1× 4 Pil"]
            LB11[H11<br/>TW, RZ, SB]
            LB12[H12<br/>LS, PF, KM]
            LB13[H13<br/>MK, NS, BK, FK]
        end

        subgraph LBR4["LB R4 - 2 Heats × 3 = 6 Piloten"]
            LB14[H14<br/>TW, LS, RZ]
            LB15[H15<br/>MK, PF, NS]
        end

        LBF[LB Finale<br/>TW, MK, LS, PF]
    end

    GF[GRAND FINALE<br/>2× WB + 2× LB]

    %% Quali Fluss
    Q1 --> |Platz 1-2| WB1
    Q2 --> |Platz 1-2| WB1
    Q3 --> |Platz 1-2| WB2
    Q4 --> |Platz 1-2| WB2
    Q5 --> |Platz 1-2| WB3
    Q6 --> |Platz 1-2| WB3
    Q7 --> |Platz 1-2| WB4
    Q8 --> |Platz 1-2| WB4

    Q1 --> |Platz 3-4| LB1
    Q2 --> |Platz 3-4| LB1
    Q3 --> |Platz 3-4| LB2
    Q4 --> |Platz 3-4| LB2
    Q5 --> |Platz 3-4| LB3
    Q6 --> |Platz 3-4| LB3
    Q7 --> |Platz 3-4| LB4
    Q8 --> |Platz 3-4| LB4

    %% WB Fluss
    WB1 --> |Platz 1-2| WB5
    WB2 --> |Platz 1-2| WB5
    WB3 --> |Platz 1-2| WB6
    WB4 --> |Platz 1-2| WB6

    WB1 --> |Platz 3-4| LB5
    WB2 --> |Platz 3-4| LB6
    WB3 --> |Platz 3-4| LB9
    WB4 --> |Platz 3-4| LB10

    WB5 --> |Platz 1-2| WBF
    WB6 --> |Platz 1-2| WBF

    WB5 --> |Platz 3-4| LB9
    WB6 --> |Platz 3-4| LB10

    %% LB Fluss
    LB1 --> |Platz 1-2| LB7
    LB2 --> |Platz 1-2| LB7
    LB3 --> |Platz 1-2| LB8
    LB4 --> |Platz 1-2| LB8

    LB5 --> |Platz 1-2| LB9
    LB6 --> |Platz 1-2| LB9
    LB7 --> |Platz 1-2| LB10
    LB8 --> |Platz 1-2| LB10

    LB7 --> |Platz 3-4| ELIM
    LB8 --> |Platz 3-4| ELIM
    LB9 --> |Platz 3-4| ELIM
    LB10 --> |Platz 3-4| ELIM

    LB9 --> |Platz 1-2| LB11
    LB10 --> |Platz 1-2| LB11
    LB13 --> |Platz 1-2| LB12

    LB11 --> |Platz 1-2| LB14
    LB12 --> |Platz 1-2| LB14
    LB13 --> |Platz 1-2| LB15

    LB14 --> |Platz 1-2| LBF
    LB15 --> |Platz 1-2| LBF

    LB14 --> |Platz 3| ELIM
    LB15 --> |Platz 3| ELIM

    LBF --> |Platz 1-2| GF
    LBF --> |Platz 3-4| PLATZ_5_6

    WBF --> |Platz 1-2| GF
    WBF --> |Platz 3-4| LB13

    %% Grand Finale
    GF --> |SIEGER| PLATZ_1
    GF --> |2. PLATZ| PLATZ_2
    GF --> |3. PLATZ| PLATZ_3
    GF --> |4. PLATZ| PLATZ_4

    classDef elim fill:#ff073a,color:#fff,stroke:#fff,stroke-width:2px
    classDef quali fill:#00bfff,color:#fff,stroke:#fff,stroke-width:2px
    classDef wb fill:#39ff14,color:#000,stroke:#fff,stroke-width:2px
    classDef lb fill:#ff073a,color:#fff,stroke:#fff,stroke-width:2px
    classDef gf fill:#f9c80e,color:#000,stroke:#fff,stroke-width:3px

    class Q1,Q2,Q3,Q4,Q5,Q6,Q7,Q8 quali
    class WB1,WB2,WB3,WB4,WB5,WB6,WBF wb
    class LB1,LB2,LB3,LB4,LB5,LB6,LB7,LB8,LB9,LB10,LB11,LB12,LB13,LB14,LB15,LBF lb
    class GF gf
    class ELIM elim
```

---

## Zusammenfassung der Änderungen

| Alte Struktur | Neue Struktur |
|---------------|---------------|
| Fixe 4-Pilot Heats | Variable Heat-Größen (3 oder 4 Piloten) |
| LB: 3 Runden (4→2→1 Heat) | LB: 5 Runden (6→4→3→2→1 Heat) |
| LB R1: 16 Piloten | LB R1: 24 Piloten (16 Quali + 8 WB) |
| LB R2: 8 Piloten | LB R2: 16 Piloten |
| LB R3: - | LB R3: 10 Piloten (2×3 + 1×4) |
| LB R4: - | LB R4: 6 Piloten (2×3) |
| LB Finale: 4 Piloten | LB Finale: 4 Piloten |
| Keine 3-Pilot Heats | 3-Pilot Heats für ungerade Zahlen |
| Keine Rematch-Regel | Automatische Rematch-Regel im GF |
