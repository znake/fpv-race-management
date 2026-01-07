# US-14.8: Zoom & Pan Funktionalität

| Feld | Wert |
|------|------|
| **Story ID** | US-14.8 |
| **Epic** | Epic 14: Visuelle Integration Bracket-Mockup |
| **Priorität** | MEDIUM |
| **Geschätzter Aufwand** | 5 Story Points (1-1.5 Tage) |
| **Abhängigkeiten** | US-14.1 (Container), US-14.6 (SVG-Linien Scale-Kompensation) |

---

## User Story

**Als** Turnierleiter  
**möchte ich** das Bracket zoomen und verschieben können  
**sodass** ich Details sehen oder den Überblick behalten kann

---

## Akzeptanzkriterien

### AC1: Zoom-Wrapper Container
- [ ] Umschließt den gesamten Bracket-Container
- [ ] CSS: `overflow: auto; position: relative`
- [ ] Cursor: default (normal), grab (pan-mode), grabbing (dragging)

### AC2: Zoom zur Mausposition
- [ ] Ctrl/Cmd + Scroll aktiviert Zoom
- [ ] Zoom zentriert sich auf Mausposition
- [ ] Zoom-Step: 0.15 (15% pro Scroll)
- [ ] Zoom-Range: 0.25 (25%) bis 3.0 (300%)
- [ ] `transform-origin: 0 0` für korrektes Zoom-Verhalten

### AC3: Pan mit Space + Drag
- [ ] Space-Taste aktiviert Pan-Modus
- [ ] Cursor wechselt zu `grab`
- [ ] Mouse-Drag verschiebt den Bracket-Container
- [ ] Cursor wechselt zu `grabbing` während Drag
- [ ] Space loslassen beendet Pan-Modus

### AC4: Zoom-Indicator (Fixed)
- [ ] Position: fixed, bottom-right (20px)
- [ ] Hintergrund: `--night`
- [ ] Border: 1px solid `--neon-cyan`
- [ ] Border-Radius: 8px
- [ ] Padding: 8px 14px
- [ ] Box-Shadow: Cyan-Glow

### AC5: Zoom-Controls
- [ ] + Button: Zoom in (zur Mitte des sichtbaren Bereichs)
- [ ] - Button: Zoom out
- [ ] Zoom-Level Anzeige: "100%"
- [ ] Hint-Text: "Strg/⌘+Scroll | Space+Drag"

### AC6: Zoom-Button Styling
- [ ] Background: transparent
- [ ] Border: 1px solid `--neon-cyan`
- [ ] Color: `--neon-cyan`
- [ ] Size: 24px × 24px
- [ ] Border-Radius: 4px
- [ ] Hover: rgba(5, 217, 232, 0.2) Hintergrund

### AC7: Reset-Funktion
- [ ] Doppelklick + Ctrl/Cmd = Reset zu 100%
- [ ] Setzt scale, translateX, translateY zurück

### AC8: SVG-Linien Update
- [ ] Bei Zoom/Pan werden SVG-Linien neu gezeichnet
- [ ] Debounced (150ms) um Performance zu schonen
- [ ] Scale wird an ConnectorManager übergeben

---

## Technische Hinweise

### Betroffene Dateien

| Datei | Änderungsart |
|-------|--------------|
| `src/components/bracket/BracketTree.tsx` | Zoom-Wrapper hinzufügen |
| `src/hooks/useZoomPan.ts` | NEU erstellen |
| `src/components/bracket/ZoomIndicator.tsx` | NEU erstellen |

### useZoomPan Hook

```typescript
// src/hooks/useZoomPan.ts
interface ZoomPanState {
  scale: number
  translateX: number
  translateY: number
}

interface UseZoomPanOptions {
  minScale?: number  // Default: 0.25
  maxScale?: number  // Default: 3.0
  step?: number      // Default: 0.15
  onScaleChange?: (scale: number) => void
}

interface UseZoomPanReturn {
  state: ZoomPanState
  containerRef: RefObject<HTMLDivElement>
  wrapperRef: RefObject<HTMLDivElement>
  isPanning: boolean
  isDragging: boolean
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
}

export function useZoomPan(options: UseZoomPanOptions = {}): UseZoomPanReturn {
  const {
    minScale = 0.25,
    maxScale = 3.0,
    step = 0.15,
    onScaleChange
  } = options
  
  const [state, setState] = useState<ZoomPanState>({
    scale: 1,
    translateX: 0,
    translateY: 0
  })
  
  const [isPanning, setIsPanning] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Zoom zur Mausposition
  const zoomAtPoint = useCallback((newScale: number, clientX: number, clientY: number) => {
    newScale = Math.max(minScale, Math.min(maxScale, newScale))
    if (newScale === state.scale) return
    
    const wrapper = wrapperRef.current
    if (!wrapper) return
    
    const wrapperRect = wrapper.getBoundingClientRect()
    const mouseX = clientX - wrapperRect.left + wrapper.scrollLeft
    const mouseY = clientY - wrapperRect.top + wrapper.scrollTop
    
    const contentX = (mouseX - state.translateX) / state.scale
    const contentY = (mouseY - state.translateY) / state.scale
    
    const newTranslateX = mouseX - contentX * newScale
    const newTranslateY = mouseY - contentY * newScale
    
    setState({
      scale: newScale,
      translateX: newTranslateX,
      translateY: newTranslateY
    })
    
    onScaleChange?.(newScale)
  }, [state, minScale, maxScale, onScaleChange])
  
  // Wheel Handler (Ctrl/Cmd + Scroll)
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    
    const handleWheel = (e: WheelEvent) => {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -step : step
        zoomAtPoint(state.scale + delta, e.clientX, e.clientY)
      }
    }
    
    wrapper.addEventListener('wheel', handleWheel, { passive: false })
    return () => wrapper.removeEventListener('wheel', handleWheel)
  }, [state.scale, step, zoomAtPoint])
  
  // Space Key für Pan-Modus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        setIsPanning(true)
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPanning(false)
        setIsDragging(false)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('keyup', handleKeyUp)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  
  // Mouse Drag für Panning
  const dragStartRef = useRef({ x: 0, y: 0, translateX: 0, translateY: 0 })
  
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    
    const handleMouseDown = (e: MouseEvent) => {
      if (isPanning) {
        e.preventDefault()
        setIsDragging(true)
        dragStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          translateX: state.translateX,
          translateY: state.translateY
        }
      }
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStartRef.current.x
        const dy = e.clientY - dragStartRef.current.y
        setState(prev => ({
          ...prev,
          translateX: dragStartRef.current.translateX + dx,
          translateY: dragStartRef.current.translateY + dy
        }))
      }
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
    }
    
    wrapper.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      wrapper.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isPanning, isDragging, state.translateX, state.translateY])
  
  // Zoom zur Mitte (für Buttons)
  const zoomToCenter = useCallback((delta: number) => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    
    const rect = wrapper.getBoundingClientRect()
    zoomAtPoint(
      state.scale + delta,
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    )
  }, [state.scale, zoomAtPoint])
  
  const zoomIn = useCallback(() => zoomToCenter(step), [zoomToCenter, step])
  const zoomOut = useCallback(() => zoomToCenter(-step), [zoomToCenter, step])
  
  const reset = useCallback(() => {
    setState({ scale: 1, translateX: 0, translateY: 0 })
    onScaleChange?.(1)
  }, [onScaleChange])
  
  return {
    state,
    containerRef,
    wrapperRef,
    isPanning,
    isDragging,
    zoomIn,
    zoomOut,
    reset
  }
}
```

### ZoomIndicator Komponente

```tsx
// src/components/bracket/ZoomIndicator.tsx
interface ZoomIndicatorProps {
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
}

export function ZoomIndicator({
  scale,
  onZoomIn,
  onZoomOut
}: ZoomIndicatorProps) {
  return (
    <div className="zoom-indicator">
      <button onClick={onZoomOut}>−</button>
      <span className="zoom-level">{Math.round(scale * 100)}%</span>
      <button onClick={onZoomIn}>+</button>
      <span className="zoom-hint">Strg/⌘+Scroll | Space+Drag</span>
    </div>
  )
}
```

### Integration in BracketTree

```tsx
// BracketTree.tsx
import { useZoomPan } from '../../hooks/useZoomPan'
import { ZoomIndicator } from './ZoomIndicator'

export function BracketTree(...) {
  const {
    state,
    containerRef,
    wrapperRef,
    isPanning,
    isDragging,
    zoomIn,
    zoomOut,
    reset
  } = useZoomPan({
    onScaleChange: (scale) => {
      // SVG-Linien neu zeichnen
      connectorManager.current?.setScale(scale)
      connectorManager.current?.debouncedRedraw()
    }
  })
  
  return (
    <>
      <div 
        ref={wrapperRef}
        className={cn(
          'zoom-wrapper',
          isPanning && 'panning',
          isDragging && 'dragging'
        )}
        onDoubleClick={(e) => {
          if (e.metaKey || e.ctrlKey) reset()
        }}
      >
        <div 
          ref={containerRef}
          className="bracket-container"
          style={{
            transform: `translate(${state.translateX}px, ${state.translateY}px) scale(${state.scale})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Bracket-Inhalt */}
        </div>
      </div>
      
      <ZoomIndicator
        scale={state.scale}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
      />
    </>
  )
}
```

### CSS

```css
.zoom-wrapper {
  overflow: auto;
  position: relative;
  cursor: default;
}

.zoom-wrapper.panning {
  cursor: grab;
}

.zoom-wrapper.panning:active,
.zoom-wrapper.dragging {
  cursor: grabbing;
}

.zoom-wrapper .bracket-container {
  transform-origin: 0 0;
}

.zoom-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--night);
  border: 1px solid var(--neon-cyan);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 11px;
  color: var(--neon-cyan);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 0 10px rgba(5, 217, 232, 0.3);
}

.zoom-indicator button {
  background: transparent;
  border: 1px solid var(--neon-cyan);
  color: var(--neon-cyan);
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-indicator button:hover {
  background: rgba(5, 217, 232, 0.2);
}

.zoom-hint {
  font-size: 9px;
  color: var(--steel);
  margin-left: 5px;
}
```

---

## Definition of Done

- [ ] Alle Akzeptanzkriterien erfüllt
- [ ] useZoomPan Hook implementiert
- [ ] Zoom zur Mausposition funktioniert
- [ ] Pan mit Space + Drag funktioniert
- [ ] ZoomIndicator zeigt aktuellen Zoom-Level
- [ ] +/- Buttons zoomen zur Mitte
- [ ] Doppelklick + Ctrl/Cmd resettet
- [ ] SVG-Linien werden bei Zoom/Pan aktualisiert
- [ ] Cursor-Änderungen korrekt
- [ ] Keine Konflikte mit anderen Keyboard-Events
- [ ] Performance bei großen Brackets akzeptabel
- [ ] Code Review durchgeführt
