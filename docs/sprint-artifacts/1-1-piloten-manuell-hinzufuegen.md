# Story 1.1: Piloten manuell hinzufügen

Status: ready-for-dev

## Story

Als ein Organisator (Thomas),
möchte ich Piloten manuell mit Name + Bild-URL hinzufügen,
so dass ich schnell vorab oder on-site Piloten erfasse.

## Acceptance Criteria

1. Eingabeformular mit Name (Pflichtfeld, mind. 3 Zeichen) und Bild-URL (Pflicht, mit Live-Vorschau)
2. Live-Update der Pilotenliste nach Hinzufügen (sofort sichtbar)
3. Hinzufügen dauert &lt; 3 Sekunden pro Pilot (Performance NFR)
4. Jeder Pilot wird als PilotCard mit Neon-Glow-Effekt (Tailwind: glow-pink) dargestellt
5. Validierung mit Zod (pilotSchema): Name zu kurz? Fehlermeldung. URL ungültig? Warnung.
6. Duplikat-Check: case-insensitive Name-Match → 'Bestehender Pilot?' Dialog (erlauben, aber warnen)

## Tasks / Subtasks

- [ ] PilotCard: src/components/pilot-card.tsx – Name/Bild lazy-load + glow-pink-500 hover + responsive 120/64px
- [ ] usePilots: src/hooks/usePilots.ts – addPilot(pilot: Pilot) + Zod pre-add + localStorage persist
- [ ] AddPilotForm in Piloten-Tab (components/tabs.tsx → Piloten Tab)
  - [ ] Form: npm i react-hook-form @hookform/resolvers/zod; useForm({ resolver: zodResolver(pilotSchema) })
  - [ ] Keyboard: Enter=Submit, ESC=Cancel
  - [ ] Submit → addPilot + Liste refresh
- [ ] Tests (tests/pilot-card.test.tsx)
  - [ ] Snapshot PilotCard
  - [ ] addPilot integration

## Dev Notes

- **Globale State:** Alle Piloten über TournamentProvider (Zustand) - kein Prop Drilling
- **Persistenz:** useLocalStorage Hook triggert nach jeder add (auto-save NFR8)
- **Bilder:** URL von Google Forms/extern, lazy load, error-fallback zu public/images/default-pilot.svg (32x32 SVG, FPV-Heli-Silhouette erstellen)
- **UX Beamer:** Große Schrift (text-2xl), hoher Kontrast (Synthwave: void-black BG, neon-pink accents)
- **CSV-Vorschau:** Bild-URLs aus CSV validieren vor Import (US-1.2 Prep)
- **Edge Cases:** 0 Piloten → Warnung "Min. 7 für Turnier", MAX 35 → Disable Add
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

### File List
- src/components/pilot-card.tsx (neu)
- src/hooks/usePilots.ts (extend)
- src/lib/schemas.ts (confirm pilotSchema)
- tests/pilot-card.test.tsx (neu)
- Keine bestehenden Files modifizieren