import '@testing-library/jest-dom/vitest'
import { vi, beforeEach } from 'vitest'

// Mock localStorage for Zustand persist middleware
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] || null
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock window.alert
Object.defineProperty(window, 'alert', {
  value: vi.fn(),
  writable: true
})

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true), // Default to true for confirm dialogs
  writable: true
})

// Reset localStorage and mocks before each test
beforeEach(() => {
  localStorageMock.clear()
  vi.clearAllMocks()
})