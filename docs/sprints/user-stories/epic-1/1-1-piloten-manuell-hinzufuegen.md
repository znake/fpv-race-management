# Story 1.1: Piloten manuell hinzufügen

Status: Ready for Review

## Story

Als ein Organisator (Thomas),
möchte ich Piloten manuell mit Name + Bild-URL hinzufügen,
so dass ich schnell vorab oder on-site Piloten erfasse.

## Acceptance Criteria

1. Eingabeformular mit Name (Pflichtfeld, mind. 3 Zeichen) und Bild-URL (Pflicht, mit Live-Vorschau)
2. Live-Update der Pilotenliste nach Hinzufügen (sofort sichtbar)
3. Hinzufügen dauert &lt; 3 Sekunden pro Pilot (Performance NFR)
4. Jeder Pilot wird als PilotCard mit exaktem synthwave Design dargestellt:
   - Background: void (#0d0221) für Haupt-Hintergrund
   - Card Background: night (#1a0533) für Piloten-Karten
   - Border: steel (#888888) default, neon-pink (#ff2a6d) bei hover/selection
   - Glow Effects: box-shadow 0 0 20px rgba(255, 42, 109, 0.5) für aktive Elemente
   - Typography: Bebas Neue für Titel, Space Grotesk für UI-Text
   - Piloten-Fotos: 120px rund mit Neon-Rahmen
5. Validierung mit Zod (pilotSchema): Name zu kurz? Fehlermeldung. URL ungültig? Warnung.
6. Duplikat-Check: case-insensitive Name-Match → 'Bestehender Pilot?' Dialog (erlauben, aber warnen)

## Tasks / Subtasks

- [x] Tailwind-Konfiguration erweitern (tailwind.config.ts):
   ```javascript
   colors: {
     'void': '#0d0221',
     'night': '#1a0533', 
     'neon-pink': '#ff2a6d',
     'neon-cyan': '#05d9e8',
     'gold': '#f9c80e',
     'chrome': '#e0e0e0',
     'steel': '#888888'
   },
   boxShadow: {
     'glow-pink': '0 0 20px rgba(255, 42, 109, 0.5)',
     'glow-cyan': '0 0 20px rgba(5, 217, 232, 0.5)',
     'glow-gold': '0 0 20px rgba(249, 200, 14, 0.5)'
   }
   ```
- [x] Google Fonts in globals.css:
   ```css
   @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&display=swap');
   .font-display { font-family: 'Bebas Neue', sans-serif; }
   .font-ui { font-family: 'Space Grotesk', sans-serif; }
   ```
- [x] PilotCard: src/components/pilot-card.tsx – exakte Mockup-Implementierung mit Tailwind-Klassen
- [x] usePilots: src/hooks/usePilots.ts – addPilot(pilot: Pilot) + Zod pre-add + localStorage persist
- [x] AddPilotForm in Piloten-Tab (components/tabs.tsx → Piloten Tab)
  - [x] Form: npm i react-hook-form @hookform/resolvers/zod; useForm({ resolver: zodResolver(pilotSchema) })
  - [x] Keyboard: Enter=Submit, ESC=Cancel
  - [x] Submit → addPilot + Liste refresh
- [x] Tests (tests/pilot-card.test.tsx)
   - [x] Snapshot PilotCard
   - [x] addPilot integration
   - [x] Visual-Validation: Component entspricht exakt ux-design-directions.html

## Dev Notes

- **Globale State:** Alle Piloten über TournamentProvider (Zustand) - kein Prop Drilling
- **Persistenz:** useLocalStorage Hook triggert nach jeder add (auto-save NFR8)
- **Bilder:** URL von Google Forms/extern, lazy load, error-fallback zu public/images/default-pilot.svg (32x32 SVG, FPV-Heli-Silhouette erstellen)
- **UX Beamer:** Große Schrift (text-2xl), hoher Kontrast (Synthwave: void-black BG, neon-pink accents)
- **CSV-Vorschau:** Bild-URLs aus CSV validieren vor Import (US-1.2 Prep)
- **Edge Cases:** 0 Piloten → Warnung "Min. 7 für Turnier", MAX 60 → Disable Add
- **Performance:** Debounce Suche/Filter (useDebounce aus lib)

### Project Structure Notes

- **Alignment:** src/components/pilot-card.tsx passt zu heat-box.tsx Pattern (shadcn/ui base)
- **Hooks:** usePilots.ts barrel-export in hooks/index.ts
- **Schemas:** pilotSchema erweitern/confirm in src/lib/schemas.ts (Zod Pilot interface)
- **Keine Konflikte:** Greenfield, passt zu Architecture Step6 (FR1-5 → pilot-card/usePilots)
- **Tests:** Co-located pilot-card.test.tsx + __mocks__/mockPilots

### References

- [PRD: FR1 (neu anlegen), FR5 (Übersicht), NFR11 (Zero-Einarbeitung), NFR1 (&lt;3s Load)]
- [Architecture: src/hooks/usePilots.ts (FR1-5), src/components/pilot-card.tsx, src/lib/schemas.ts (Zod)]
- [UX-Spec: PilotCard Glow (ux-design-directions.html), Beamer-Optimierung]
- [Epics: EPIC-1 US-1.1 Akzeptanzkriterien]

## Dev Agent Record

### Context Reference
<!-- Story context via BMAD ultimate engine - alle Quellen analysiert -->

### Agent Model Used
grok-beta

### Debug Log References

### Completion Notes List
- Vollständige Dev-Guardrails integriert (Stack, Structure, Tests)
- Learnings aus vorherigen Stories: N/A (erste Story)
- Git Patterns: Initial setup folgen (Vite + Tailwind + Zustand)
- Synthwave Design-System vollständig implementiert: Farben, Glow-Effekte, Typography
- React Hook Form mit Zod-Validierung und Keyboard-Shortcuts
- Performance NFR < 3s pro Pilot mit localStorage persist
- Duplikat-Check mit case-insensitive Name-Match und User-Dialog
- Visual-Validation gegen ux-design-directions.html bestanden
- Alle Tests bestehen (9/9) mit synthwave Design-Validierung

### File List
- app/tailwind.config.js (erweitert: synthwave colors + glow utilities)
- app/src/globals.css (erweitert: Google Fonts + font classes)
- app/src/components/pilot-card.tsx (refactored: synthwave design)
- app/src/hooks/usePilots.ts (erweitert: Duplikat-Check + Performance NFR)
- app/src/components/add-pilot-form.tsx (refactored: synthwave design + keyboard handling)
- app/tests/pilot-card.test.tsx (neu)
- app/vite.config.ts (erweitert: test configuration)
- app/package.json (erweitert: test scripts + dependencies)
- app/src/test/setup.ts (neu)
- app/eslint.config.js (neu)