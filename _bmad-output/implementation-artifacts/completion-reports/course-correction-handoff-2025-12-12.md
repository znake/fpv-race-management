# Course Correction Implementation Handoff

**Date:** 2025-12-12  
**Project:** FPV Racing Heats  
**Issue:** Implementation ignoriert synthwave Design  
**Scope:** Minor (Direct implementation by dev team)

---

## 🎯 **Problem Summary**

Die aktuelle Implementation (`app/`) zeigt generische UI statt des spezifizierten synthwave Designs aus `docs/ux-design-directions.html`. Stories referenzieren das Design korrekt, aber Developer haben keine konkreten Design-System Requirements.

---

## 🚀 **Solution Approach**

**Direct Adjustment:** Stories werden mit konkreten Design-System Requirements ausgestattet, Developer refactort bestehende Components.

---

## 📋 **Implementation Tasks**

### **Story 1-1: Piloten manuell hinzufügen (IN-PROGRESS)**

**Developer Instructions:**
1. **Tailwind-Konfiguration anlegen** (tailwind.config.ts):
   - Synthwave Farb-Palette integrieren (void, night, neon-pink, etc.)
   - Glow-Utilities definieren (glow-pink, glow-cyan, etc.)

2. **Google Fonts integrieren** (src/globals.css):
   - Bebas Neue + Space Grotesk importieren
   - font-display und font-ui Klassen definieren

3. **PilotCard refactor** (src/components/pilot-card.tsx):
   - Verwende bg-night, border-steel, hover:border-neon-pink
   - Implementiere glow-pink Effekte
   - Nutze font-display für Namen, font-ui für UI-Text

4. **AddPilotForm refactor** (components/tabs.tsx):
   - Form-Elemente mit synthwave Design
   - Buttons mit bg-neon-pink hover:glow-pink

**Success Criteria:**
- Component entspricht exakt `docs/ux-design-directions.html`
- Alle Farben und Glow-Effekte implementiert
- Typography korrekt (Bebas Neue + Space Grotesk)

---

### **Story 1-2: CSV Import (BACKLOG → READY-FOR-DEV NACH 1-1)**

**Developer Instructions:**
1. **CSV Import Component** (src/components/csv-import.tsx):
   - Drag&Drop Zone: bg-night border-steel hover:border-neon-cyan
   - Preview Table: bg-night text-chrome
   - Progress Bar: neon-cyan mit glow
   - Error Messages: text-loser-red mit glow-red
   - Success Messages: text-winner-green mit glow-green

---

## 🎨 **Design System Reference**

**Colors:**
- void: #0d0221 (Hintergrund)
- night: #1a0533 (Karten)
- neon-pink: #ff2a6d (Primär-Akzent)
- neon-cyan: #05d9e8 (Sekundär-Akzent)
- chrome: #e0e0e0 (Haupttext)
- steel: #888888 (Gedämpfter Text)

**Glow Effects:**
- glow-pink: 0 0 20px rgba(255, 42, 109, 0.5)
- glow-cyan: 0 0 20px rgba(5, 217, 232, 0.5)

**Typography:**
- font-display: Bebas Neue (Titel)
- font-ui: Space Grotesk (UI-Text)

---

## ✅ **Validation Process**

1. **Visual Check:** Component gegen `docs/ux-design-directions.html` halten
2. **Color Validation:** Nur definierte synthwave Farben verwenden
3. **Glow Validation:** Glow-Effekte mit box-shadow implementieren
4. **Font Validation:** Korrekte Google Fonts geladen und angewendet
5. **Beamer Test:** 10m-Lesbarkeit prüfen (min 18px body, 24px headlines)

---

## 🎯 **Next Steps**

1. **Story 1-1 abschließen** mit synthwave Design
2. **Story 1-2 auf ready-for-dev setzen** nach 1-1 completion
3. **Visual Validation** durch Product Owner vor Story-Abschluss
4. **Restliche Stories** folgen automatisch dem Design-System Pattern

---

## 📞 **Support**

**Questions?** Design-System Details in `docs/architecture.md` unter "Synthwave Design System Integration".

**Visual Reference:** `docs/ux-design-directions.html` - exakte Vorlage für alle Components.