/**
 * US-14.6: SVG Connector Lines System
 * 
 * ConnectorManager Klasse für SVG-Verbindungslinien im Turnier-Bracket.
 * 
 * Features:
 * - WB-Linien (grün) für Winner Bracket Verbindungen
 * - GF-Linien (gold) für Grand Finale Verbindungen
 * - Merge-Connections (2→1) für Bracket-Progression
 * - Scale-Kompensation bei Zoom
 * - Debounced Redraw bei Resize
 * 
 * WICHTIG: LB hat KEINE Verbindungslinien (Pool-basiertes System)
 */

/**
 * AC7: Position Interface für DOM-Elemente
 */
export interface Position {
  left: number
  right: number
  top: number
  bottom: number
  centerX: number
  centerY: number
  width: number
  height: number
}

/**
 * AC10: Nur WB und GF Connection Types (keine LB-Linien)
 */
export type ConnectionType = 'wb' | 'gf'

/**
 * AC1: Connection Interface
 */
export interface Connection {
  fromId?: string
  fromIds?: string[]
  toId: string
  type: ConnectionType
  isMerge?: boolean
  isGrandFinale?: boolean
}

/**
 * AC1: ConnectorManager Klasse
 * 
 * Verwaltet SVG-Verbindungslinien zwischen Heat-Boxen im Bracket.
 */
export class ConnectorManager {
  private svg: SVGSVGElement | null
  private container: HTMLElement | null
  private connections: Connection[] = []
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null
  private currentScale: number = 1
  private resizeHandler: () => void

  /**
   * AC1: Constructor mit containerId und svgId
   */
  constructor(containerId: string, svgId: string) {
    this.container = document.getElementById(containerId)
    this.svg = document.getElementById(svgId) as SVGSVGElement | null

    // AC8: Resize-Handler registrieren
    this.resizeHandler = () => this.debouncedRedraw()
    window.addEventListener('resize', this.resizeHandler)
  }

  /**
   * AC9: Scale setzen für Zoom-Kompensation
   */
  setScale(scale: number): void {
    this.currentScale = scale
  }

  /**
   * AC1: Einfache Verbindung hinzufügen
   * @param fromId Quell-Heat-ID
   * @param toId Ziel-Heat-ID
   * @param type Connection-Type (default: 'wb')
   */
  addConnection(fromId: string, toId: string, type: ConnectionType = 'wb'): void {
    this.connections.push({
      fromId,
      toId,
      type
    })
  }

  /**
   * AC5: Merge-Connection hinzufügen (2→1)
   * @param fromIds Array von Quell-Heat-IDs
   * @param toId Ziel-Heat-ID
   * @param type Connection-Type (default: 'wb')
   */
  addMergeConnection(fromIds: string[], toId: string, type: ConnectionType = 'wb'): void {
    this.connections.push({
      fromIds,
      toId,
      type,
      isMerge: true
    })
  }

  /**
   * AC6: Grand Finale Connection hinzufügen
   * @param wbFinaleId WB-Finale Heat-ID
   * @param lbFinaleId LB-Finale Heat-ID
   * @param gfId Grand Finale Heat-ID
   */
  addGrandFinaleConnection(wbFinaleId: string, lbFinaleId: string, gfId: string): void {
    this.connections.push({
      fromIds: [wbFinaleId, lbFinaleId],
      toId: gfId,
      type: 'gf',
      isGrandFinale: true
    })
  }

  /**
   * Alle Connections abrufen (für Tests)
   */
  getConnections(): Connection[] {
    return [...this.connections]
  }

  /**
   * Alle Connections löschen
   */
  clearConnections(): void {
    this.connections = []
  }

  /**
   * AC7: Relative Position eines Elements zum Container berechnen
   * AC9: Mit Scale-Kompensation
   */
  getRelativePosition(element: HTMLElement): Position {
    if (!this.container) {
      throw new Error('Container not found')
    }

    const containerRect = this.container.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    const scale = this.currentScale || 1

    return {
      left: (elementRect.left - containerRect.left) / scale,
      right: (elementRect.right - containerRect.left) / scale,
      top: (elementRect.top - containerRect.top) / scale,
      bottom: (elementRect.bottom - containerRect.top) / scale,
      centerX: (elementRect.left - containerRect.left + elementRect.width / 2) / scale,
      centerY: (elementRect.top - containerRect.top + elementRect.height / 2) / scale,
      width: elementRect.width / scale,
      height: elementRect.height / scale
    }
  }

  /**
   * AC4: SVG-Pfad erstellen
   * Pfad-Form: vertikal nach unten → horizontal zum Ziel-X → vertikal zum Ziel
   */
  private createPath(from: Position, to: Position, type: ConnectionType): SVGPathElement {
    // AC4: Start unten-mitte, Ende oben-mitte
    const startX = from.centerX
    const startY = from.bottom
    const endX = to.centerX
    const endY = to.top

    // AC4: Mid-Point bei 50% der vertikalen Distanz
    const midY = startY + (endY - startY) / 2

    // AC4: Pfad: vertikal → horizontal → vertikal
    const d = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', d)

    // AC2: Linien-Styling
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke-linecap', 'round')
    path.setAttribute('stroke-linejoin', 'round')

    // AC3: Farbcodierung anwenden
    this.applyStyle(path, type)

    return path
  }

  /**
   * AC2 + AC3: Styling basierend auf Connection-Type anwenden
   */
  private applyStyle(path: SVGPathElement, type: ConnectionType): void {
    switch (type) {
      case 'wb':
        // AC3: WB-Linien grün (#39ff14), 0.7 Opacity
        path.setAttribute('stroke', '#39ff14')
        path.setAttribute('opacity', '0.7')
        path.setAttribute('stroke-width', '2')
        break
      case 'gf':
        // AC3: GF-Linien gold (#f9c80e), 3px, 0.8 Opacity
        path.setAttribute('stroke', '#f9c80e')
        path.setAttribute('stroke-width', '3')
        path.setAttribute('opacity', '0.8')
        break
    }
  }

  /**
   * AC1: Alle Verbindungen neu zeichnen
   */
  redraw(): void {
    if (!this.svg || !this.container) return

    // SVG leeren
    this.svg.innerHTML = ''

    // AC9: SVG-Dimensionen mit Scale-Kompensation
    const containerRect = this.container.getBoundingClientRect()
    const scale = this.currentScale || 1
    this.svg.setAttribute('width', String(containerRect.width / scale))
    this.svg.setAttribute('height', String(containerRect.height / scale))

    // Connections zeichnen
    this.connections.forEach(conn => {
      if (conn.isMerge || conn.isGrandFinale) {
        // AC5 + AC6: Merge oder Grand Finale Connection
        this.drawMergeConnection(conn)
      } else if (conn.fromId) {
        // Einfache Connection
        this.drawSimpleConnection(conn)
      }
    })
  }

  /**
   * Einfache Connection zeichnen
   */
  private drawSimpleConnection(conn: Connection): void {
    if (!conn.fromId || !this.svg) return

    const fromElement = document.getElementById(conn.fromId)
    const toElement = document.getElementById(conn.toId)

    if (!fromElement || !toElement) return

    const fromPos = this.getRelativePosition(fromElement)
    const toPos = this.getRelativePosition(toElement)

    const path = this.createPath(fromPos, toPos, conn.type)
    this.svg.appendChild(path)
  }

  /**
   * AC5 + AC6: Merge oder Grand Finale Connection zeichnen
   */
  private drawMergeConnection(conn: Connection): void {
    if (!conn.fromIds || !this.svg) return

    const toElement = document.getElementById(conn.toId)
    if (!toElement) return

    const toPos = this.getRelativePosition(toElement)

    // Grand Finale: Draw symmetrical paths that meet at a common junction point
    if (conn.isGrandFinale && conn.fromIds.length === 2) {
      this.drawSymmetricalGrandFinaleConnections(conn.fromIds, toPos, conn.type)
      return
    }

    // Für jede Quelle einen Pfad zum Ziel erstellen
    conn.fromIds.forEach(fromId => {
      const fromElement = document.getElementById(fromId)
      if (!fromElement) return

      const fromPos = this.getRelativePosition(fromElement)
      const path = this.createPath(fromPos, toPos, conn.type)
      this.svg!.appendChild(path)
    })
  }

  /**
   * Draw symmetrical Grand Finale connections from WB and LB Finale
   * Both lines go down to the same Y level, then horizontally to meet at the GF center
   */
  private drawSymmetricalGrandFinaleConnections(
    fromIds: string[], 
    toPos: Position, 
    type: ConnectionType
  ): void {
    // Get positions of both source elements
    const positions: { id: string; pos: Position; element: HTMLElement }[] = []
    
    for (const fromId of fromIds) {
      const fromElement = document.getElementById(fromId)
      if (!fromElement) continue
      positions.push({
        id: fromId,
        pos: this.getRelativePosition(fromElement),
        element: fromElement
      })
    }

    if (positions.length < 2) {
      // Fallback: draw individual paths if we don't have both sources
      positions.forEach(({ pos }) => {
        const path = this.createPath(pos, toPos, type)
        this.svg!.appendChild(path)
      })
      return
    }

    // Calculate the common junction Y position
    // Use a point that is 50px above the Grand Finale top for better text readability
    const junctionY = toPos.top - 50
    const endX = toPos.centerX
    const endY = toPos.top

    // Draw path for each source
    positions.forEach(({ pos }) => {
      const startX = pos.centerX
      const startY = pos.bottom
      
      // Path: down to junction Y, horizontal to GF center X, then down to GF
      const d = `M ${startX} ${startY} L ${startX} ${junctionY} L ${endX} ${junctionY} L ${endX} ${endY}`
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', d)
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke-linecap', 'round')
      path.setAttribute('stroke-linejoin', 'round')
      this.applyStyle(path, type)
      this.svg!.appendChild(path)
    })
  }

  /**
   * AC8: Debounced Redraw (US-14.8: 150ms for zoom/pan performance)
   */
  debouncedRedraw(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }
    this.resizeTimeout = setTimeout(() => this.redraw(), 150)
  }

  /**
   * Manager zerstören und Event-Listener entfernen
   */
  destroy(): void {
    window.removeEventListener('resize', this.resizeHandler)
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }
    this.connections = []
  }
}
