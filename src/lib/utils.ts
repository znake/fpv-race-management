import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a unique ID with an optional prefix
 * Format: {prefix}-{uuid} or just {uuid}
 *
 * @param prefix - Optional prefix for the ID (e.g., 'pilot', 'wb-heat', 'lb-heat')
 * @returns A unique identifier string
 *
 * @example
 * generateId('pilot')     // 'pilot-a1b2c3d4-e5f6-...'
 * generateId('wb-heat')   // 'wb-heat-a1b2c3d4-e5f6-...'
 * generateId()            // 'a1b2c3d4-e5f6-...'
 */
export function generateId(prefix?: string): string {
  const uuid = crypto.randomUUID()
  return prefix ? `${prefix}-${uuid}` : uuid
}

/**
 * Debounce utility for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Fisher-Yates Shuffle - unbiased random permutation
 *
 * @param array - Array to shuffle
 * @param seed - Optional seed for deterministic shuffling (für Tests)
 */
export function shuffleArray<T>(array: T[], seed?: number): T[] {
  const shuffled = [...array]

  // Seeded random für deterministische Tests
  let random: () => number
  if (seed !== undefined) {
    // Simple seeded PRNG (Mulberry32)
    let s = seed
    random = () => {
      s |= 0
      s = (s + 0x6D2B79F5) | 0
      let t = Math.imul(s ^ (s >>> 15), 1 | s)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  } else {
    random = Math.random
  }

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}
