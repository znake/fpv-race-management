import { downloadFile, generateTimestamp } from './export-import'

const INLINE_STYLE_PROPERTIES = [
  'display',
  'flex-direction',
  'flex-wrap',
  'flex',
  'flex-grow',
  'flex-shrink',
  'align-items',
  'justify-content',
  'gap',
  'width',
  'min-width',
  'max-width',
  'height',
  'min-height',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'border',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-radius',
  'border-color',
  'border-width',
  'border-style',
  'background',
  'background-color',
  'background-image',
  'color',
  'font-family',
  'font-size',
  'font-weight',
  'letter-spacing',
  'text-align',
  'text-transform',
  'text-decoration',
  'text-overflow',
  'white-space',
  'overflow',
  'overflow-x',
  'overflow-y',
  'position',
  'top',
  'left',
  'right',
  'bottom',
  'z-index',
  'box-shadow',
  'opacity',
  'text-shadow',
  'object-fit',
  'pointer-events',
  'line-height',
  'box-sizing',
  'vertical-align',
  'cursor',
  'transform',
  'visibility'
] as const

const SVG_TAGS = new Set([
  'svg',
  'path',
  'line',
  'circle',
  'rect',
  'polyline',
  'polygon',
  'g',
  'defs',
  'marker',
  'use'
])

/**
 * Converts an image URL to a base64 data URL.
 * Returns the original URL on failure (graceful degradation).
 */
async function convertImageToBase64(url: string): Promise<string> {
  if (url.startsWith('data:')) {
    return url
  }

  try {
    const response = await fetch(url, { mode: 'cors' })
    if (!response.ok) {
      return url
    }

    const blob = await response.blob()

    return await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          resolve(url)
        }
      }
      reader.onerror = () => {
        resolve(url)
      }
      reader.readAsDataURL(blob)
    })
  } catch {
    return url
  }
}

/**
 * Converts all `<img>` element sources within a container to base64 data URLs.
 * Processes images in parallel for performance. Skips images that are already
 * data URLs and gracefully falls back to the original URL on failure.
 */
export async function convertImagesToBase64(container: HTMLElement): Promise<void> {
  const images = container.querySelectorAll<HTMLImageElement>('img')
  if (images.length === 0) {
    return
  }

  const urlMap = new Map<string, string>()
  const uniqueUrls: string[] = []

  for (const img of images) {
    const src = img.currentSrc || img.src
    if (src && !urlMap.has(src)) {
      urlMap.set(src, src)
      uniqueUrls.push(src)
    }
  }

  const conversions = await Promise.all(
    uniqueUrls.map(async (url) => {
      const base64 = await convertImageToBase64(url)
      return { url, base64 }
    })
  )

  for (const { url, base64 } of conversions) {
    urlMap.set(url, base64)
  }
  for (const img of images) {
    const src = img.currentSrc || img.src
    const base64Src = urlMap.get(src)
    if (base64Src) {
      img.src = base64Src
    }
  }
}

function buildNodePathFromAncestor(node: Element, ancestor: Element): number[] {
  const path: number[] = []
  let current: Element | null = node

  while (current && current !== ancestor) {
    const parentElement: Element | null = current.parentElement
    if (!parentElement) {
      return []
    }

    const index = Array.prototype.indexOf.call(parentElement.children, current)
    if (index < 0) {
      return []
    }

    path.unshift(index)
    current = parentElement
  }

  return current === ancestor ? path : []
}

function resolveElementByPath(root: Element, path: number[]): Element | null {
  let current: Element | null = root

  for (const index of path) {
    if (!current || index < 0 || index >= current.children.length) {
      return null
    }

    const child = current.children.item(index)
    current = child instanceof Element ? child : null
  }

  return current
}

/**
 * Recursively inlines selected computed styles from an original DOM tree into its clone.
 */
export function inlineComputedStyles(original: HTMLElement, clone: HTMLElement): void {
  const walk = (originalNode: Node, cloneNode: Node): void => {
    if (!(originalNode instanceof Element) || !(cloneNode instanceof Element)) {
      return
    }

    const tagName = originalNode.tagName.toLowerCase()
    const computedStyle = window.getComputedStyle(originalNode)

    if (computedStyle.display === 'none') {
      return
    }

    if (!SVG_TAGS.has(tagName) && cloneNode instanceof HTMLElement) {
      for (const property of INLINE_STYLE_PROPERTIES) {
        cloneNode.style.setProperty(property, computedStyle.getPropertyValue(property))
      }
    }

    if (originalNode instanceof HTMLImageElement && cloneNode instanceof HTMLImageElement) {
      cloneNode.src = originalNode.currentSrc || originalNode.src
      cloneNode.alt = originalNode.alt
    }

    const childCount = Math.min(originalNode.childNodes.length, cloneNode.childNodes.length)
    for (let index = 0; index < childCount; index += 1) {
      const originalChild = originalNode.childNodes.item(index)
      const cloneChild = cloneNode.childNodes.item(index)
      if (originalChild && cloneChild) {
        walk(originalChild, cloneChild)
      }
    }
  }

  walk(original, clone)
}

/**
 * Clones bracket DOM, inlines computed styles, converts images to base64,
 * and removes interactive-only elements.
 */
export async function captureBracketDOM(container: HTMLElement): Promise<string> {
  const clone = container.cloneNode(true) as HTMLElement

  inlineComputedStyles(container, clone)

  await convertImagesToBase64(clone)

  const sourceZoomRoot =
    (container.style.transform && container.style.transform !== 'none')
      ? container
      : container.querySelector<HTMLElement>('[style*="transform"]')

  const zoomRoot = sourceZoomRoot
    ? (sourceZoomRoot === container
      ? clone
      : resolveElementByPath(clone, buildNodePathFromAncestor(sourceZoomRoot, container)))
    : null

  if (zoomRoot instanceof HTMLElement) {
    zoomRoot.style.transform = 'none'
    zoomRoot.style.width = 'auto'
  }

  const heatBoxes = clone.querySelectorAll<HTMLElement>('.heat-box')
  for (const heatBox of heatBoxes) {
    if (heatBox.style.cursor === 'pointer') {
      heatBox.style.removeProperty('cursor')
    }
  }

  const interactiveElements = clone.querySelectorAll<HTMLElement>('.zoom-indicator, .pilot-path-toggle')
  for (const element of interactiveElements) {
    element.remove()
  }

  return clone.outerHTML
}

/**
 * Fetches the FPVOOE watermark logo and converts it to a base64 data URL.
 */
export async function convertLogoToBase64(): Promise<string> {
  try {
    const response = await fetch('/images/fpvooe-logo.webp')
    if (!response.ok) {
      throw new Error(`Logo fetch failed with status ${response.status}`)
    }

    const blob = await response.blob()

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()

      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
          return
        }

        reject(new Error('FileReader returned non-string result'))
      }

      reader.onerror = () => {
        reject(reader.error ?? new Error('Failed to read logo blob'))
      }

      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Failed to convert bracket logo to base64:', error)
    return ''
  }
}

/**
 * Assembles exported bracket markup into a complete self-contained HTML5 document.
 */
export function assembleSelfContainedHTML(
  bodyContent: string,
  title = 'FPV Racing Heats - Turnierbaum'
): string {
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
  <style>
    .bracket-export-wrapper,
    .bracket-export-wrapper *,
    .bracket-export-wrapper *::before,
    .bracket-export-wrapper *::after {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #0d0221;
      overflow: auto;
      font-family: 'Space Grotesk', sans-serif;
    }

    .bracket-export-wrapper {
      position: relative;
      background: #0d0221;
      overflow: auto;
      padding: 20px;
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <div class="bracket-export-wrapper">${bodyContent}</div>
</body>
</html>`
}

/**
 * Exports the current bracket container as a standalone HTML file with inlined styles.
 */
export function exportBracketHTML(container: HTMLElement): void {
  void (async () => {
    try {
      const logoDataUrl = await convertLogoToBase64()

      let bracketMarkup = await captureBracketDOM(container)
      if (logoDataUrl) {
        bracketMarkup = bracketMarkup.replace(/\/images\/fpvooe-logo\.webp/g, logoDataUrl)
      }

      const bracketPseudoStyle = logoDataUrl
        ? `<style>
  .bracket-container::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('${logoDataUrl}') center center / 1000px no-repeat;
    opacity: 0.08;
    pointer-events: none;
    z-index: 1;
  }
</style>`
        : ''

      const selfContainedHtml = assembleSelfContainedHTML(`${bracketPseudoStyle}${bracketMarkup}`)
      const fileName = `heats_turnierbaum_${generateTimestamp()}.html`

      downloadFile(selfContainedHtml, fileName, 'text/html')
    } catch (error) {
      console.error('Failed to export bracket HTML:', error)
    }
  })()
}
