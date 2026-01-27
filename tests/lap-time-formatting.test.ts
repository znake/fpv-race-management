import { describe, it, expect } from 'vitest'
import { formatLapTime, parseLapTimeDigits } from '../src/lib/ui-helpers'

describe('lap time formatting', () => {
  describe('formatLapTime', () => {
    it('formats seconds correctly', () => {
      expect(formatLapTime(45000)).toBe('0:45')
    })

    it('formats minutes and seconds correctly', () => {
      expect(formatLapTime(83000)).toBe('1:23')
    })

    it('formats exact minutes correctly', () => {
      expect(formatLapTime(120000)).toBe('2:00')
    })

    it('formats zero correctly', () => {
      expect(formatLapTime(0)).toBe('0:00')
    })

    it('formats one minute correctly', () => {
      expect(formatLapTime(60000)).toBe('1:00')
    })
  })

  describe('parseLapTimeDigits', () => {
    it('parses 2-digit seconds', () => {
      expect(parseLapTimeDigits('45')).toBe(45000)
    })

    it('parses 3-digit M:SS', () => {
      expect(parseLapTimeDigits('123')).toBe(83000)
    })

    it('returns null for time under 20s', () => {
      expect(parseLapTimeDigits('10')).toBe(null)
    })

    it('returns null for invalid seconds (> 59)', () => {
      expect(parseLapTimeDigits('999')).toBe(null)
      expect(parseLapTimeDigits('199')).toBe(null)
    })

    it('returns null for time over 5min', () => {
      expect(parseLapTimeDigits('500')).toBe(null)
      expect(parseLapTimeDigits('501')).toBe(null)
    })

    it('returns null for empty string', () => {
      expect(parseLapTimeDigits('')).toBe(null)
    })

    it('returns null for non-digit strings', () => {
      expect(parseLapTimeDigits('abc')).toBe(null)
    })
    
    it('returns null for 1-digit strings', () => {
      expect(parseLapTimeDigits('5')).toBe(null)
    })

    it('returns null for 4+ digit strings', () => {
      expect(parseLapTimeDigits('1234')).toBe(null)
    })
  })
})
