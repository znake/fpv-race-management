import { describe, expect, it } from 'vitest'
import { parseCSV } from '@/lib/csv-parser'

describe('parseCSV', () => {
  it('omits instagramHandle when the CSV has no Instagram column', async () => {
    // Given: a valid CSV without an Instagram column
    const csv = 'Name,Bild-URL\nMax Mustermann,https://example.com/max.jpg'

    // When: the CSV is parsed
    const result = await parseCSV(csv)
    const [pilot] = result.pilots

    // Then: the optional field remains absent
    expect(pilot).toBeDefined()
    if (!pilot) return
    expect('instagramHandle' in pilot).toBe(false)
  })

  it('includes an undefined instagramHandle when the Instagram cell is blank', async () => {
    // Given: a valid CSV with an explicitly blank Instagram cell
    const csv = 'Name,Bild-URL,Instagram\nMax Mustermann,https://example.com/max.jpg,'

    // When: the CSV is parsed
    const result = await parseCSV(csv)
    const [pilot] = result.pilots

    // Then: the optional field is present to represent an explicit clear
    expect(pilot).toBeDefined()
    if (!pilot) return
    expect('instagramHandle' in pilot).toBe(true)
    expect(pilot.instagramHandle).toBeUndefined()
  })

  it('normalizes an Instagram handle without an at-sign', async () => {
    // Given: a valid CSV with an unprefixed Instagram handle
    const csv = 'Name,Bild-URL,Instagram\nMax Mustermann,https://example.com/max.jpg,keep_me'

    // When: the CSV is parsed
    const result = await parseCSV(csv)
    const [pilot] = result.pilots

    // Then: the handle is prefixed and remains present
    expect(pilot).toBeDefined()
    if (!pilot) return
    expect(pilot.instagramHandle).toBe('@keep_me')
  })

  it('recognizes Instagram-Handle as an Instagram column', async () => {
    // Given: a valid CSV using the alternate Instagram header
    const csv = 'Name,Bild-URL,Instagram-Handle\nMax Mustermann,https://example.com/max.jpg,keep_me'

    // When: the CSV is parsed
    const result = await parseCSV(csv)
    const [pilot] = result.pilots

    // Then: the alternate column supplies the normalized handle
    expect(pilot).toBeDefined()
    if (!pilot) return
    expect(pilot.instagramHandle).toBe('@keep_me')
  })
})
