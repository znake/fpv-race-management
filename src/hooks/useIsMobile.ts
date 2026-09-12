/**
 * useIsMobile Hook
 * 
 * Detects if the app is running on a mobile device with a vertical/portrait orientation.
 * Useful for optimizing UI for iPhone-style 9:16 aspect ratio views.
 */

import { useState, useEffect } from 'react'

/**
 * Breakpoint for mobile detection (in pixels)
 * Covers iPhone and most mobile devices in portrait mode
 */
const MOBILE_BREAKPOINT = 768

/**
 * useIsMobile Hook
 * 
 * Returns true if the viewport width is below the mobile breakpoint.
 * Uses matchMedia for efficient detection and updates on resize.
 * 
 * @returns boolean indicating if the device is mobile-sized
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if matchMedia is available (for SSR compatibility)
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    
    // Set initial value
    setIsMobile(mediaQuery.matches)

    // Handler for media query changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }

    // Add listener (using addEventListener for modern browsers)
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return isMobile
}
