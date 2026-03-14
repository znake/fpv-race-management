import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  assembleSelfContainedHTML,
  inlineComputedStyles,
  captureBracketDOM,
  convertImagesToBase64,
  convertLogoToBase64,
} from '@/lib/export-bracket-html'

const originalCreateObjectURL = globalThis.URL.createObjectURL
const originalRevokeObjectURL = globalThis.URL.revokeObjectURL

describe('export-bracket-html', () => {
  beforeEach(() => {
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock')
    globalThis.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    globalThis.URL.createObjectURL = originalCreateObjectURL
    globalThis.URL.revokeObjectURL = originalRevokeObjectURL
    vi.restoreAllMocks()
  })

  describe('assembleSelfContainedHTML', () => {
    it('returns valid HTML5 document with DOCTYPE', () => {
      const html = assembleSelfContainedHTML('<div>test</div>')
      expect(html).toMatch(/^<!doctype html>/)
      expect(html).toContain('<html lang="de">')
      expect(html).toContain('</html>')
    })

    it('includes Google Fonts links for all three font families', () => {
      const html = assembleSelfContainedHTML('<div/>')
      expect(html).toContain('fonts.googleapis.com')
      expect(html).toContain('Bebas+Neue')
      expect(html).toContain('Space+Grotesk')
      expect(html).toContain('JetBrains+Mono')
    })

    it('includes CSS custom properties in style block', () => {
      const html = assembleSelfContainedHTML('<div/>')
      expect(html).toContain('<style>')
      expect(html).toContain('box-sizing: border-box')
      expect(html).toContain('#0d0221')
    })

    it('embeds provided body content inside wrapper div', () => {
      const content = '<div class="bracket-tree">bracket content</div>'
      const html = assembleSelfContainedHTML(content)
      expect(html).toContain('bracket-export-wrapper')
      expect(html).toContain(content)
    })

    it('uses provided title', () => {
      const html = assembleSelfContainedHTML('<div/>', 'Custom Title')
      expect(html).toContain('<title>Custom Title</title>')
    })

    it('uses default title when none provided', () => {
      const html = assembleSelfContainedHTML('<div/>')
      expect(html).toContain('<title>FPV Racing Heats - Turnierbaum</title>')
    })

    it('sets body background to void color and correct font', () => {
      const html = assembleSelfContainedHTML('<div/>')
      expect(html).toContain("background: #0d0221")
      expect(html).toContain("font-family: 'Space Grotesk', sans-serif")
    })

    it('includes charset and viewport meta tags', () => {
      const html = assembleSelfContainedHTML('<div/>')
      expect(html).toContain('charset="UTF-8"')
      expect(html).toContain('viewport')
      expect(html).toContain('width=device-width')
    })
  })

  describe('inlineComputedStyles', () => {
    it('copies computed display property to clone inline style', () => {
      const original = document.createElement('div')
      document.body.appendChild(original)
      const clone = original.cloneNode(true) as HTMLElement

      inlineComputedStyles(original, clone)

      expect(clone.style.display).toBeTruthy()
      document.body.removeChild(original)
    })

    it('recursively processes child elements', () => {
      const original = document.createElement('div')
      const child = document.createElement('div')
      child.textContent = 'hello'
      original.appendChild(child)
      document.body.appendChild(original)

      const clone = original.cloneNode(true) as HTMLElement
      inlineComputedStyles(original, clone)

      const cloneChild = clone.children[0] as HTMLElement
      expect(cloneChild).toBeTruthy()
      expect(cloneChild.style.length).toBeGreaterThan(0)
      document.body.removeChild(original)
    })

    it('skips SVG elements for style inlining', () => {
      const original = document.createElement('div')
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', 'M0 0 L10 10')
      path.setAttribute('stroke', 'green')
      svg.appendChild(path)
      original.appendChild(svg)
      document.body.appendChild(original)

      const clone = original.cloneNode(true) as HTMLElement
      inlineComputedStyles(original, clone)

      const clonePath = clone.querySelector('path')
      expect(clonePath).toBeTruthy()
      expect(clonePath!.getAttribute('d')).toBe('M0 0 L10 10')
      expect(clonePath!.getAttribute('stroke')).toBe('green')
      document.body.removeChild(original)
    })

    it('preserves image src and alt attributes', () => {
      const original = document.createElement('div')
      const img = document.createElement('img')
      img.src = 'https://example.com/photo.jpg'
      img.alt = 'Pilot Photo'
      original.appendChild(img)
      document.body.appendChild(original)

      const clone = original.cloneNode(true) as HTMLElement
      inlineComputedStyles(original, clone)

      const cloneImg = clone.querySelector('img')
      expect(cloneImg).toBeTruthy()
      expect(cloneImg!.alt).toBe('Pilot Photo')
      document.body.removeChild(original)
    })

    it('handles empty containers without errors', () => {
      const original = document.createElement('div')
      document.body.appendChild(original)
      const clone = original.cloneNode(true) as HTMLElement

      expect(() => inlineComputedStyles(original, clone)).not.toThrow()
      document.body.removeChild(original)
    })
  })

  describe('captureBracketDOM', () => {
    it('clones container and returns outerHTML', async () => {
      const container = document.createElement('div')
      container.innerHTML = '<div class="heat-box">Heat 1</div>'
      document.body.appendChild(container)

      const result = await captureBracketDOM(container)

      expect(result).toContain('Heat 1')
      expect(result).toContain('heat-box')
      document.body.removeChild(container)
    })

    it('removes zoom transform from container with inline transform', async () => {
      const container = document.createElement('div')
      container.style.transform = 'translate(100px, 50px) scale(2.5)'
      container.innerHTML = '<span>content</span>'
      document.body.appendChild(container)

      const result = await captureBracketDOM(container)

      expect(result).toContain('transform: none')
      document.body.removeChild(container)
    })

    it('removes zoom transform from nested element with transform', async () => {
      const container = document.createElement('div')
      const inner = document.createElement('div')
      inner.style.transform = 'translate(50px, 30px) scale(1.5)'
      inner.innerHTML = '<span>inner content</span>'
      container.appendChild(inner)
      document.body.appendChild(container)

      const result = await captureBracketDOM(container)

      expect(result).toContain('transform: none')
      document.body.removeChild(container)
    })

    it('removes interactive elements (zoom-indicator, pilot-path-toggle)', async () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <div class="heat-box">Heat</div>
        <div class="zoom-indicator">100%</div>
        <div class="pilot-path-toggle">Toggle</div>
      `
      document.body.appendChild(container)

      const result = await captureBracketDOM(container)

      expect(result).not.toContain('zoom-indicator')
      expect(result).not.toContain('pilot-path-toggle')
      expect(result).toContain('heat-box')
      document.body.removeChild(container)
    })

    it('preserves SVG elements in output', async () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <svg class="svg-lines" width="500" height="300">
          <path d="M10 10 L100 100" stroke="green" fill="none" />
        </svg>
      `
      document.body.appendChild(container)

      const result = await captureBracketDOM(container)

      expect(result).toContain('<svg')
      expect(result).toContain('<path')
      expect(result).toContain('M10 10 L100 100')
      document.body.removeChild(container)
    })

    it('returns valid HTML string for empty container', async () => {
      const container = document.createElement('div')
      document.body.appendChild(container)

      const result = await captureBracketDOM(container)

      expect(result).toContain('<div')
      expect(result).toContain('</div>')
      document.body.removeChild(container)
    })
  })

  describe('convertImagesToBase64', () => {
    it('does nothing when container has no images', async () => {
      const container = document.createElement('div')
      container.innerHTML = '<span>no images</span>'

      await expect(convertImagesToBase64(container)).resolves.toBeUndefined()
    })

    it('skips images that are already data URLs', async () => {
      const container = document.createElement('div')
      const img = document.createElement('img')
      const dataUrl = 'data:image/png;base64,iVBOR...'
      img.src = dataUrl
      container.appendChild(img)

      await convertImagesToBase64(container)

      expect(img.src).toBe(dataUrl)
    })

    it('deduplicates identical image URLs', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(new Blob(['fake'], { type: 'image/png' }), { status: 200 })
      )

      const container = document.createElement('div')
      for (let i = 0; i < 3; i++) {
        const img = document.createElement('img')
        img.src = 'https://example.com/same-image.png'
        container.appendChild(img)
      }

      await convertImagesToBase64(container)

      expect(fetchSpy).toHaveBeenCalledTimes(1)
    })

    it('gracefully falls back to original URL on fetch failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))

      const container = document.createElement('div')
      const img = document.createElement('img')
      img.src = 'https://example.com/broken.png'
      container.appendChild(img)

      await convertImagesToBase64(container)

      expect(img.src).toContain('broken.png')
    })
  })

  describe('convertLogoToBase64', () => {
    it('returns empty string on fetch failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Not found'))
      vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await convertLogoToBase64()

      expect(result).toBe('')
    })

    it('returns empty string on non-ok response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(null, { status: 404 })
      )
      vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await convertLogoToBase64()

      expect(result).toBe('')
    })
  })
})
