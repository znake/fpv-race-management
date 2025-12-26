/**
 * Tests for generateId utility function
 * Story 3-5: ID-Generierung standardisieren
 */

import { describe, it, expect } from 'vitest'
import { generateId } from '../src/lib/utils'

describe('generateId', () => {
  it('AC1: Should generate a valid UUID without prefix', () => {
    const id = generateId()

    // UUID format: 8-4-4-4-12 hex digits
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    expect(id).toMatch(uuidRegex)
  })

  it('AC1: Should generate a valid UUID with prefix', () => {
    const id = generateId('pilot')

    // Format: {prefix}-{uuid}
    expect(id).toMatch(/^pilot-/)

    // Rest should be a valid UUID
    const uuidPart = id.substring(6) // 'pilot-' is 6 chars
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    expect(uuidPart).toMatch(uuidRegex)
  })

  it('AC2: Should generate unique IDs each call (no collisions)', () => {
    const ids = new Set<string>()

    // Generate 1000 IDs and check for uniqueness
    for (let i = 0; i < 1000; i++) {
      ids.add(generateId())
    }

    expect(ids.size).toBe(1000)
  })

  it('AC2: Should support various entity prefixes', () => {
    const prefixes = [
      'pilot',
      'quali',
      'wb',
      'lb',
      'wb-finale',
      'lb-finale',
      'gf',
      'bracket'
    ]

    prefixes.forEach(prefix => {
      const id = generateId(prefix)
      expect(id).toMatch(new RegExp(`^${prefix}-`))
      expect(id.length).toBeGreaterThan(prefix.length + 1) // +1 for hyphen
    })
  })

  it('Should handle hyphenated prefixes correctly', () => {
    const id = generateId('wb-finale')

    // Should be 'wb-finale-{uuid}'
    expect(id).toMatch(/^wb-finale-/)
    expect(id).not.toMatch(/wb-finale-wb-finale-/) // No double prefix
  })

  it('Should handle empty string prefix', () => {
    const id = generateId('')

    // Empty prefix should just return UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    expect(id).toMatch(uuidRegex)
  })
})
