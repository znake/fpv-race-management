# Sprint Change Proposal - Synthwave Design Integration

**Date:** 2025-12-12  
**Project:** FPV Racing Heats  
**Issue:** Implementation ignoriert synthwave Design  
**Scope:** Minor (Direct implementation by dev team)

---

## 📊 **Issue Summary**

**Problem Statement:** Die aktuelle Implementation (`app/`) zeigt generische UI statt des spezifizierten synthwave Designs aus `docs/ux-design-directions.html`. Stories referenzieren das Design korrekt, aber Developer haben keine konkreten Design-System Requirements.

**Discovery Context:** Das Problem wurde identifiziert als User bemerkte "nach der ersten Story sieht das Design komplett anders aus als in dem Mockup, das wir generiert haben".

**Evidence:** 
- ✅ Perfektes synthwave Mockup (`ux-design-directions.html`)
- ✅ Stories referenzieren Design korrekt
- ❌ Implementation zeigt generische React Components
- ❌ Keine Tailwind-Konfiguration für synthwave Farben

---

## 🔍 **Impact Analysis**

### **Epic Impact**
- **EPIC-1 (Piloten-Verwaltung):** Betroffen - Stories 1-1 und 1-2 benötigen Design-System Integration
- **Alle zukünftigen Epics:** Betroffen - benötigen Design-System Validierung

### **Story Impact**
- **Current Stories:** 1-1 (in-progress), 1-2 (backlog) benötigen Refactor
- **Future Stories:** Alle benötigen Design-System Requirements als Template

### **Artifact Conflicts**
- **PRD:** Keine Konflikte - unterstützt Design (FR36)
- **Architecture:** Teilweise Konflikte - fehlt synthwave Design-System
- **UX/UX:** Major Konflikte - Design existiert aber wird ignoriert

### **Technical Impact**
- **Code:** Refactor von bestehenden Components, keine neuen Files
- **Configuration:** Tailwind-Konfiguration + Google Fonts nötig
- **Deployment:** Keine Auswirkungen

---

## 🎯 **Recommended Approach**

**Selected Approach: Direct Adjustment**

**Rationale:**
- **Implementation Effort:** Low - Refactor statt Neu-Entwicklung
- **Timeline Impact:** Minimal - Stories bleiben im Sprint
- **Technical Risk:** Low - bewährte Design-System Integration
- **Team Momentum:** Erhalten - kein kompletter Restart nötig

**Effort Estimate:** Medium (2-3 Tage für Refactor + Validation)
**Risk Level:** Low (bestehende Codebasis bleibt erhalten)

---

## 📝 **Detailed Change Proposals**

### **Story Changes**

#### **Story 1-1: Piloten manuell hinzufügen**

**OLD:**
```
4. Jeder Pilot wird als PilotCard mit Neon-Glow-Effekt (Tailwind: glow-pink) dargestellt
```

**NEW:**
```
4. Jeder Pilot wird als PilotCard mit exaktem synthwave Design dargestellt:
   - Background: void (#0d0221) für Haupt-Hintergrund
   - Card Background: night (#1a0533) für Piloten-Karten
   - Border: steel (#888888) default, neon-pink (#ff2a6d) bei hover/selection
   - Glow Effects: box-shadow 0 0 20px rgba(255, 42, 109, 0.5) für aktive Elemente
   - Typography: Bebas Neue für Titel, Space Grotesk für UI-Text
   - Piloten-Fotos: 120px rund mit Neon-Rahmen
```

**Rationale:** Zwingt Developer zur exakten Design-Implementierung statt generischem "Glow".

---

#### **Story 1-2: CSV Import**

**NEW (hinzugefügt):**
```
8. CSV Import Interface folgt exaktem synthwave Design:
   - Drag&Drop Zone: night (#1a0533) background, steel (#888888) border
   - Hover State: neon-cyan (#05d9e8) border mit glow-cyan Effekt
   - Success State: neon-pink (#ff2a6d) border mit glow-pink Effekt
   - Error State: loser-red (#ff073a) border mit subtilem Glow
   - Typography: Space Grotesk für UI-Text, chrome (#e0e0e0) für Haupttext
   - Buttons: neon-pink background mit glow-pink bei hover
```

**Rationale:** CSV Import UI muss zum synthwave Design passen, nicht generisch aussehen.

---

### **Architecture Changes**

#### **Architecture Document**

**NEW (hinzugefügt):**
```javascript
// Synthwave Design System Integration
colors: {
  'void': '#0d0221',           // Tiefes Violett-Schwarz
  'night': '#1a0533',          // Dunkles Violett
  'neon-pink': '#ff2a6d',      // Heißes Pink
  'neon-cyan': '#05d9e8',      // Leuchtendes Cyan
  'gold': '#f9c80e',           // Sieger-Gold
  'chrome': '#e0e0e0',         // Heller Text
  'steel': '#888888',          // Gedämpfter Text
},
boxShadow: {
  'glow-pink': '0 0 20px rgba(255, 42, 109, 0.5)',
  'glow-cyan': '0 0 20px rgba(5, 217, 232, 0.5)',
  'glow-gold': '0 0 20px rgba(249, 200, 14, 0.5)',
}
```

**Rationale:** Architecture wird zur offiziellen "Source of Truth" für synthwave Design-System.

---

### **Template Changes**

**NEW (für alle zukünftigen Stories):**
```
X. [DESIGN-SYSTEM VALIDATION] Komponente folgt exaktem synthwave Design:
   - Farben: Verwendet nur definierte synthwave Farb-Palette
   - Glow-Effekte: Nutzt definierte glow-* utilities
   - Typography: Verwendet font-display oder font-ui classes
   - Beamer-Optimierung: Alle Texte ≥14px, hohe Kontraste
   - Validierung: Component muss visuell mit ux-design-directions.html übereinstimmen
```

**Rationale:** Zwingt jeden Developer zur Design-Validierung vor Story-Abschluss.

---

## 🎯 **Implementation Handoff**

### **Change Scope Classification**
- **Scope:** Minor
- **Handoff Recipient:** Development Team
- **Success Criteria:** Components entsprechen exakt `ux-design-directions.html`

### **Developer Responsibilities**
1. **Story 1-1 Refactor:** Implementiere synthwave Design-System
2. **Tailwind-Konfiguration:** Lege synthwave Farben und Glow-Utilities an
3. **Google Fonts:** Integriere Bebas Neue + Space Grotesk
4. **Visual Validation:** Prüfe Components gegen Mockup
5. **Story 1-2:** Implementiere mit gleichen Design-System Pattern

### **Product Owner Responsibilities**
1. **Visual Review:** Validiere Story-Abschluss gegen `ux-design-directions.html`
2. **Design-System Enforcement:** Stelle sicher dass zukünftige Stories Design-Requirements enthalten

---

## ✅ **Success Criteria**

1. **Story 1-1 Completed:** PilotCard entspricht exakt synthwave Mockup
2. **Story 1-2 Ready:** CSV Import UI folgt synthwave Design
3. **Architecture Updated:** Design-System offiziell dokumentiert
4. **Template Applied:** Alle zukünftigen Stories haben Design-Validation
5. **Visual Consistency:** Gesamte App folgt synthwave Ästhetik

---

## 📞 **Next Steps**

1. **Developer Handoff:** Übergabe an Development Team mit `course-correction-handoff-2025-12-12.md`
2. **Story 1-1 Implementation:** Refactor mit synthwave Design-System
3. **Story 1-2 Implementation:** CSV Import mit synthwave Design
4. **Validation:** Product Owner prüft Visual-Consistency
5. **Template Application:** Alle zukünftigen Stories verwenden Design-System Template

---

**Prepared by:** Product Manager (Course Correction Workflow)  
**Approved by:** Jakob (User) ✅  
**Handoff to:** Development Team  
**Status:** APPROVED FOR IMPLEMENTATION