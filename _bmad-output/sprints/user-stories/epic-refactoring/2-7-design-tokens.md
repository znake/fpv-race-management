# Story 2.7: Design-Token-Konsistenz herstellen

**Epic:** Komponenten Refactoring
**Aufwand:** M
**Priorität:** 5 (Sprint 5)
**Abhängigkeiten:** Nach Stories 2.4-2.6 (um alle Komponenten in finaler Form zu haben)

## Beschreibung

Als Entwickler möchte ich inkonsistentes Styling (Border-Radius, Glow-Shadows, Buttons) durch zentrale Design-Tokens in `tailwind.config.js` standardisieren, damit visuelle Konsistenz gewährleistet ist und Styling-Änderungen zentral erfolgen können.

## Akzeptanzkriterien

- [ ] AC1: `tailwind.config.js` definiert einheitliche `borderRadius` Tokens für das Projekt
- [ ] AC2: Alle `rounded-xl`, `rounded-2xl`, `rounded-[16px]` werden durch semantische Tokens ersetzt
- [ ] AC3: Glow-Shadows sind als `boxShadow` Tokens in Tailwind-Config definiert: `glow-pink`, `glow-cyan`, `glow-gold`
- [ ] AC4: Alle inline Glow-Definitionen verwenden Tailwind-Tokens
- [ ] AC5: Button-Variants in `ui/button.tsx` sind vollständig via CVA definiert (keine inline Styles)
- [ ] AC6: Dokumentation der Design-Tokens als Kommentar in `tailwind.config.js`

## Technische Details

### Betroffene Dateien
- `tailwind.config.js`
- `src/globals.css`
- `src/components/ui/button.tsx`
- Alle Komponenten mit inline Border-Radius und Glow-Styles

### Aktuelle Inkonsistenzen

**Border-Radius:**
```
rounded-xl      → 12px  (heat-card, csv-import)
rounded-2xl     → 16px  (pilot-card, heat-box, dialogs)
rounded-[16px]  → 16px  (pilot-card, active-heat-view - explizit)
rounded-lg      → 8px   (buttons)
```

**Glow-Shadows:**
```css
/* Verschiedene Definitionen in Komponenten: */
shadow-[0_0_20px_rgba(0,255,255,0.3)]
shadow-[0_0_30px_rgba(236,72,153,0.4)]
shadow-glow-cyan  /* In globals.css definiert */
shadow-glow-pink  /* Verwendet aber nicht in Tailwind! */
```

### Neue Tailwind-Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      // Semantische Border-Radius Tokens
      borderRadius: {
        'card': '16px',      // Karten, Dialoge
        'button': '8px',     // Buttons
        'badge': '9999px',   // Badges, Pills
        'input': '8px',      // Inputs
      },
      
      // Glow-Shadow Tokens
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 255, 255, 0.3)',
        'glow-cyan-lg': '0 0 30px rgba(0, 255, 255, 0.4)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.3)',
        'glow-pink-lg': '0 0 30px rgba(236, 72, 153, 0.4)',
        'glow-gold': '0 0 20px rgba(250, 204, 21, 0.3)',
        'glow-gold-lg': '0 0 30px rgba(250, 204, 21, 0.4)',
      },
      
      // ... bestehende Farben etc.
    },
  },
};
```

### Migration in Komponenten

**Vorher:**
```tsx
className="rounded-2xl shadow-[0_0_20px_rgba(0,255,255,0.3)]"
className="rounded-[16px]"
```

**Nachher:**
```tsx
className="rounded-card shadow-glow-cyan"
```

### Button-Konsolidierung

Alle Button-Styles in `ui/button.tsx` via CVA:

```typescript
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-button font-medium transition-all',
  {
    variants: {
      variant: {
        primary: 'bg-neon-pink text-white hover:shadow-glow-pink',
        secondary: 'bg-transparent border border-cyber-cyan text-cyber-cyan hover:shadow-glow-cyan',
        ghost: 'bg-transparent text-gray-400 hover:text-white',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
      glow: {
        true: '',  // Glow wird durch variant bestimmt
        false: 'shadow-none',
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      glow: false,
    },
  }
);
```

## Migrations-Schritte

1. **Tailwind-Config erweitern** mit neuen Tokens
2. **globals.css bereinigen** - redundante Definitionen entfernen
3. **ui/button.tsx aktualisieren** - alle Variants via CVA
4. **Komponenten migrieren** (Suche nach `rounded-` und `shadow-[`):
   - `pilot-card.tsx`
   - `heat-card.tsx`
   - `heat-box.tsx`
   - `bracket/` Komponenten
   - `csv-import.tsx`
   - Dialog-Komponenten
5. **Visuelle Regression-Tests**

### Such-Pattern für Migration

```bash
# Finde alle inline Border-Radius
grep -r "rounded-\[" src/components/

# Finde alle inline Shadows
grep -r "shadow-\[" src/components/
```

## Testplan

1. `npm run build` - Build muss erfolgreich sein
2. `npm test` - alle Tests müssen grün bleiben
3. **Visuelle Prüfung** aller Komponenten:
   - Pilot-Cards
   - Heat-Cards
   - Dialoge/Modals
   - Buttons
   - Bracket-Ansicht
4. Prüfe, dass keine `rounded-[` oder `shadow-[` mehr in Komponenten existieren
