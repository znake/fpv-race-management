import { describe, it, expect } from 'vitest'
import { formatLapTime, parseLapTimeDigits, formatPartialTimeEntry } from '@/lib/ui-helpers'

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

    it('formats tenths correctly', () => {
      expect(formatLapTime(83400)).toBe('1:23.4')
    })

    it('formats hundredths correctly', () => {
      expect(formatLapTime(83450)).toBe('1:23.45')
    })

    it('formats tenths with trailing zero as single digit', () => {
      expect(formatLapTime(83500)).toBe('1:23.5')
    })

    it('formats hundredths with leading zero', () => {
      expect(formatLapTime(83050)).toBe('1:23.05')
    })

    it('does not show fractional part for whole seconds', () => {
      expect(formatLapTime(83000)).toBe('1:23')
    })
  })

  describe('parseLapTimeDigits', () => {
    it('parses 3-digit MSS (0:45)', () => {
      expect(parseLapTimeDigits('045')).toBe(45000)
    })

    it('parses 3-digit MSS (1:23)', () => {
      expect(parseLapTimeDigits('123')).toBe(83000)
    })

    it('parses 4-digit MSSt with tenths', () => {
      expect(parseLapTimeDigits('1234')).toBe(83400)
    })

    it('parses 5-digit MSSTh with hundredths', () => {
      expect(parseLapTimeDigits('12345')).toBe(83450)
    })

    it('parses tenths with zero', () => {
      expect(parseLapTimeDigits('1230')).toBe(83000)
    })

    it('parses hundredths with leading zero', () => {
      expect(parseLapTimeDigits('12305')).toBe(83050)
    })

    it('returns null for time under 20s', () => {
      expect(parseLapTimeDigits('010')).toBe(null)
    })

    it('returns null for invalid seconds (> 59)', () => {
      expect(parseLapTimeDigits('999')).toBe(null)
      expect(parseLapTimeDigits('199')).toBe(null)
    })

    it('returns null for time over 9:59', () => {
      expect(parseLapTimeDigits('999')).toBe(null)
      expect(parseLapTimeDigits('960')).toBe(null)
    })

    it('accepts valid times up to 9:59', () => {
      expect(parseLapTimeDigits('500')).toBe(300000)
      expect(parseLapTimeDigits('959')).toBe(599000)
    })

    it('accepts valid times with tenths up to 9:59.9', () => {
      expect(parseLapTimeDigits('9599')).toBe(599900)
    })

    it('accepts valid times with hundredths up to 9:59.99', () => {
      expect(parseLapTimeDigits('95999')).toBe(599990)
    })

    it('returns null for empty string', () => {
      expect(parseLapTimeDigits('')).toBe(null)
    })

    it('returns null for non-digit strings', () => {
      expect(parseLapTimeDigits('abc')).toBe(null)
    })
    
    it('returns null for 1-2 digit strings', () => {
      expect(parseLapTimeDigits('5')).toBe(null)
      expect(parseLapTimeDigits('45')).toBe(null)
    })

    it('returns null for 6+ digit strings', () => {
      expect(parseLapTimeDigits('123456')).toBe(null)
    })
  })

  describe('formatPartialTimeEntry', () => {
    it('returns empty string for empty input', () => {
      expect(formatPartialTimeEntry('')).toBe('')
    })

    it('formats single digit with placeholder', () => {
      expect(formatPartialTimeEntry('1')).toBe('1:__')
      expect(formatPartialTimeEntry('0')).toBe('0:__')
    })

    it('formats two digits with placeholder', () => {
      expect(formatPartialTimeEntry('04')).toBe('0:4_')
      expect(formatPartialTimeEntry('12')).toBe('1:2_')
    })

    it('formats three digits as M:SS', () => {
      expect(formatPartialTimeEntry('045')).toBe('0:45')
      expect(formatPartialTimeEntry('123')).toBe('1:23')
      expect(formatPartialTimeEntry('459')).toBe('4:59')
    })

    it('formats four digits as M:SS.t', () => {
      expect(formatPartialTimeEntry('1234')).toBe('1:23.4')
      expect(formatPartialTimeEntry('0450')).toBe('0:45.0')
    })

    it('formats five digits as M:SS.th', () => {
      expect(formatPartialTimeEntry('12345')).toBe('1:23.45')
      expect(formatPartialTimeEntry('04500')).toBe('0:45.00')
    })

    it('truncates to 5 digits for longer input', () => {
      expect(formatPartialTimeEntry('123456')).toBe('1:23.45')
    })
  })
})
