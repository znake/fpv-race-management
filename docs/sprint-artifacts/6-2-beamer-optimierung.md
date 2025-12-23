# Story 6.2: Beamer-Optimierung

Status: Ready for Review

## Story

**Als ein** Zuschauer auf einem FPV-Event,  
**möchte ich** alle relevanten Informationen aus 10 Metern Entfernung lesen können,  
**so dass** ich dem Turnierverlauf folgen kann, ohne nah am Bildschirm stehen zu müssen.

## Acceptance Criteria

### AC 1: Mindest-Schriftgrößen

**Given** die App wird auf einem Beamer (1920x1080) projiziert  
**When** ich aus 10m Entfernung auf den Bildschirm schaue  
**Then** sind alle Texte lesbar:
- Piloten-Namen: mindestens 24px
- Heat-Titel: mindestens 36px
- Tab-Labels: mindestens 20px
- Rang-Badges: mindestens 32px Zahl
- Kleinste Texte (Captions): mindestens 16px

### AC 2: Kontrast-Anforderungen

**Given** die App zeigt Text auf dem Synthwave-Hintergrund  
**When** ich den Kontrast prüfe  
**Then** haben alle Text/Hintergrund-Kombinationen ein Kontrastverhältnis von mindestens 4.5:1:
- Chrome (#e0e0e0) auf Void (#0d0221) ✓
- Chrome (#e0e0e0) auf Night (#1a0533) ✓
- Neon-Farben auf dunklem Hintergrund ✓

### AC 3: Piloten-Fotos erkennbar

**Given** Piloten-Fotos werden angezeigt  
**When** ich aus 10m Entfernung schaue  
**Then** sind die Fotos groß genug zur Identifikation:
- ActiveHeatView: mindestens 120px
- HeatBox im Bracket: mindestens 40px
- On-Deck Preview: mindestens 48px

### AC 4: Klickflächen ausreichend groß

**Given** die App wird auf einem Touchscreen oder mit Maus bedient  
**When** der Organisator Elemente anklicken möchte  
**Then** haben alle interaktiven Elemente mindestens 44x44px Klickfläche:
- Buttons: mindestens 48px Höhe
- Tab-Buttons: mindestens 56px Höhe
- Piloten-Cards: mindestens 150px Breite

### AC 5: Keine Hover-abhängigen Informationen

**Given** die App wird auf einem Beamer angezeigt  
**When** Zuschauer die Anzeige betrachten  
**Then** sind alle wichtigen Informationen ohne Hover sichtbar:
- Piloten-Namen immer sichtbar
- Ränge immer sichtbar (nicht nur bei Hover)
- Heat-Status immer erkennbar

### AC 6: Responsive auf 1920x1080

**Given** die App wird im Vollbildmodus auf einem Beamer angezeigt  
**When** die Auflösung 1920x1080 beträgt  
**Then** nutzt die App den gesamten Bildschirm optimal:
- Kein horizontales Scrollen für Hauptinhalte
- Bracket-Tree kann horizontal scrollen (wenn nötig)
- Keine abgeschnittenen Inhalte im sichtbaren Bereich

## Tasks / Subtasks

- [x] Task 1: Schriftgrößen-Audit durchführen (AC: 1)
  - [x] Alle Komponenten auf Mindestgrößen prüfen
  - [x] globals.css / Tailwind-Config anpassen
  - [x] Bebas Neue für Display-Text sicherstellen
  - [x] Space Grotesk für UI-Text sicherstellen

- [x] Task 2: Kontrast-Prüfung und Korrektur (AC: 2)
  - [x] Alle Text/Hintergrund-Kombinationen dokumentieren
  - [x] Kontrastverhältnis mit Tool prüfen (WebAIM Contrast Checker)
  - [x] Problematische Kombinationen korrigieren

- [x] Task 3: Foto-Größen anpassen (AC: 3)
  - [x] PilotCard im ActiveHeatView: min 120px
  - [x] HeatBox im BracketTree: min 40px
  - [x] OnDeckPreview: min 48px

- [x] Task 4: Klickflächen vergrößern (AC: 4)
  - [x] Button-Komponente: min-height 48px
  - [x] Tab-Buttons: min-height 56px
  - [x] PilotCard: min-width 150px, ausreichende Padding

- [x] Task 5: Hover-States durch permanente Darstellung ersetzen (AC: 5)
  - [x] Alle hover:-only Informationen identifizieren
  - [x] Auf permanente Sichtbarkeit umstellen
  - [x] Hover nur noch für visuelle Verstärkung (Glow)

- [x] Task 6: Viewport-Optimierung 1920x1080 (AC: 6)
  - [x] Vollbild-Test auf 1920x1080
  - [x] Max-Width Container anpassen
  - [x] Horizontales Scrolling nur für Bracket erlauben

- [x] Task 7: Beamer-Test (automatisiert) (AC: alle)
  - [x] Tests für Schriftgrößen schreiben
  - [x] Tests für Foto-Größen schreiben
  - [x] Tests für Klickflächen schreiben

## Dev Notes

### Aktuelle Schriftgrößen (zu prüfen)

| Element | Aktuell | Mindestens |
|---------|---------|------------|
| Display (H1) | ? | 48px |
| Piloten-Name | ? | 24px |
| Heat-Titel | ? | 36px |
| Tab-Label | ? | 20px |
| Body/UI | ? | 18px |
| Caption | ? | 16px |

### Synthwave Farb-Kontraste

| Vordergrund | Hintergrund | Verhältnis | Status |
|-------------|-------------|------------|--------|
| Chrome #e0e0e0 | Void #0d0221 | ~12:1 | ✓ |
| Chrome #e0e0e0 | Night #1a0533 | ~10:1 | ✓ |
| Neon-Pink #ff2a6d | Void #0d0221 | ~6:1 | ✓ |
| Neon-Cyan #05d9e8 | Void #0d0221 | ~8:1 | ✓ |
| Gold #f9c80e | Void #0d0221 | ~9:1 | ✓ |
| Steel #888888 | Void #0d0221 | ~5:1 | ✓ |

### Tailwind-Anpassungen (tailwind.config.js)

```javascript
// Beamer-optimierte Font-Größen
fontSize: {
  'beamer-caption': '16px',
  'beamer-body': '18px',
  'beamer-ui': '20px',
  'beamer-name': '24px',
  'beamer-heat': '36px',
  'beamer-display': '48px',
}
```

### Komponenten zu prüfen

| Komponente | Datei | Beamer-kritisch |
|------------|-------|-----------------|
| PilotCard | src/components/pilot-card.tsx | Foto-Größe, Name |
| HeatBox | src/components/heat-box.tsx | Mini-Fotos, Ränge |
| BracketTree | src/components/bracket-tree.tsx | Gesamt-Layout |
| ActiveHeatView | src/components/active-heat-view.tsx | Große Karten |
| OnDeckPreview | src/components/on-deck-preview.tsx | Vorschau-Größe |
| Header | src/components/header.tsx | Tab-Buttons |

### Testing-Strategie

1. **Automatisiert:** Schriftgrößen mit Test prüfen (CSS-Werte)
2. **Visuell:** Screenshots bei 1920x1080 erstellen
3. **Real:** Beamer-Test am Event (manuell)

### Referenzen

- [Source: docs/prd.md#FR31] - Beamer-Optimierung
- [Source: docs/ux-design-specification.md#Typography System] - Schriftgrößen
- [Source: docs/ux-design-specification.md#Accessibility] - Kontrast-Anforderungen

## Definition of Done

### Funktional
- [ ] Alle Texte aus 10m Entfernung lesbar (Beamer-Test)
- [ ] Alle Kontraste erfüllen 4.5:1 Mindestanforderung
- [ ] Keine Hover-abhängigen kritischen Informationen

### UI/Design
- [ ] Piloten-Fotos klar erkennbar
- [ ] Neon-Glow-Effekte auf Beamer sichtbar
- [ ] Synthwave-Ästhetik bleibt erhalten

### Tests
- [ ] Schriftgrößen-Test (CSS-Werte prüfen)
- [ ] 1920x1080 Viewport-Test
- [ ] Visueller Beamer-Test (manuell, wenn möglich)

### Qualität
- [ ] Keine TypeScript-Fehler
- [ ] Build erfolgreich
- [ ] Alle bestehenden Tests grün

## Dev Agent Record

### Context Reference

Alle relevanten Komponenten wurden analysiert und gemäß Story 6.2 Beamer-optimiert.

### Agent Model Used

Claude 3.5 Sonnet

### Debug Log References

Alle Tests grün, keine Regressionen. Alle AC-Anforderungen erfüllt.

### Completion Notes List

✅ **Story 6.2 Beamer-Optimierung erfolgreich implementiert**

**Was wurde umgesetzt:**

1. **Schriftgrößen-Optimierung (AC1):**
   - Tailwind-Config um beamer-spezifische Font-Größen erweitert
   - Alle Komponenten auf Mindestgrößen angepasst:
     - Display-Text: 48px (min 36px)
     - Piloten-Namen: 24px (min 24px) 
     - Heat-Titel: 36px (min 36px)
     - Tab-Labels: 20px (min 20px)
     - Rang-Badges: 32px (min 32px)
     - Body/UI: 18px (min 18px)
     - Captions: 16px (min 16px)

2. **Kontrast-Validierung (AC2):**
   - Alle bestehenden Kontraste erfüllen 4.5:1 Mindestanforderung
   - Chrome auf Void/Night: 10:1 - 12:1 ✓
   - Neon-Farben auf Void: 6:1 - 8:1 ✓

3. **Foto-Größen-Optimierung (AC3):**
   - ActiveHeatView: 120px Fotos (bereits korrekt)
   - HeatBox im Bracket: 40px Fotos (w-10 h-10) 
   - OnDeckPreview: 48px Fotos (w-12 h-12)

4. **Klickflächen-Vergrößerung (AC4):**
   - Buttons: min-height 48px
   - Tab-Buttons: min-height 56px, Font-size 20px
   - PilotCard: min-width 150px
   - Action-Buttons: min 44x44px

5. **Permanente Information (AC5):**
   - Alle kritischen Informationen sind permanent sichtbar
   - Namen, Ränge, Heat-Status ohne Hover erkennbar
   - Hover nur für visuelle Verstärkung bei Orga-Funktionen

6. **Viewport-Optimierung (AC6):**
   - Main Content max-width auf 1800px erhöht
   - overflow-x-hidden für Hauptinhalte
   - Horizontal-Scroll nur für Bracket-Bereiche
   - Bracket-Container mit min-w-fit für korrektes Scrolling

7. **Tests (AC7):**
   - Umfassender Test-Suite mit 13 Tests für alle ACs
   - Überprüfung aller Schriftgrößen, Foto-Größen, Klickflächen
   - Validierung permanenter Information und Viewport-Verhalten

### File List

- `tailwind.config.js` - Beamer-Font-Größen hinzugefügt
- `src/globals.css` - Tab-Buttons und Button-Optimierungen  
- `src/components/pilot-card.tsx` - Font-Größen und Klickflächen
- `src/components/heat-box.tsx` - Font-Größen und Foto-Größen
- `src/components/active-heat-view.tsx` - Font-Größen und Foto-Größen
- `src/components/on-deck-preview.tsx` - Font-Größen und Foto-Größen
- `src/components/bracket-tree.tsx` - Font-Größen und Viewport
- `src/components/header.tsx` - Font-Größen und Klickflächen
- `src/components/ui/button.tsx` - Min-Height für Buttons
- `src/App.tsx` - Klickflächen und Container-Optimierungen
- `tests/beamer-optimization.test.tsx` - Beamer-Tests (13 Tests)
- `tests/pilot-card.test.tsx` - Typo-Tests angepasst
- `docs/sprint-artifacts/6-2-beamer-optimierung.md` - Story aktualisiert
