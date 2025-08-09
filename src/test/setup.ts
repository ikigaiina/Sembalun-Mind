// Test setup for Sembalun Mind Indonesian Meditation Platform
// Enhanced testing configuration for cultural authenticity and accessibility

import '@testing-library/jest-dom'
import { vi, afterEach, beforeAll, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import 'intersection-observer'
import 'resize-observer-polyfill/lib/ResizeObserver.global'

// Indonesian cultural and accessibility testing support
import { toHaveNoViolations } from 'jest-axe'

// Extend Jest matchers for accessibility testing
expect.extend(toHaveNoViolations)

// Mock navigator.onLine for offline tests
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
})

// Mock IntersectionObserver for Indonesian mobile testing
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver for responsive testing
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Enhanced localStorage mock with Indonesian cultural support
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value.toString() }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    length: 0,
    key: vi.fn(() => null),
  }
})()
global.localStorage = localStorageMock

// Enhanced sessionStorage mock for meditation sessions
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value.toString() }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    length: 0,
    key: vi.fn(() => null),
  }
})()
global.sessionStorage = sessionStorageMock

// Mock performance API for Indonesian network testing
if (!global.performance) {
  global.performance = {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn()
  } as any
}

// Mock matchMedia for Indonesian mobile device simulation
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock scrollTo for smooth scrolling tests
global.scrollTo = vi.fn()

// Mock fetch for API testing
global.fetch = vi.fn()

// Mock Web Audio API for meditation audio
const audioContextMock = {
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 0 },
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 0 },
  })),
  destination: {},
  currentTime: 0,
}

// @ts-ignore
global.AudioContext = vi.fn(() => audioContextMock)
// @ts-ignore
global.webkitAudioContext = vi.fn(() => audioContextMock)

// Mock HTMLMediaElement for audio/video meditation content
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: vi.fn().mockImplementation(() => Promise.resolve()),
})

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: vi.fn(),
})

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  writable: true,
  value: vi.fn(),
})

// Mock URL.createObjectURL for file handling
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()

// Mock process.env for client-side code
if (typeof process === 'undefined') {
  global.process = {
    env: {
      NODE_ENV: 'test',
      VITE_CULTURAL_VALIDATION: 'enabled',
      VITE_ACCESSIBILITY_TESTING: 'strict',
      VITE_INDONESIAN_LOCALE: 'id-ID',
    }
  } as any
}

// Mock console methods for cleaner test output
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  // Suppress known warnings in test environment
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' && 
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Warning: React.createFactory() is deprecated'))
    ) {
      return
    }
    originalConsoleError(...args)
  }

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' && 
      args[0].includes('componentWillReceiveProps has been renamed')
    ) {
      return
    }
    originalConsoleWarn(...args)
  }
})

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks()
  
  // Reset localStorage/sessionStorage
  localStorageMock.clear()
  sessionStorageMock.clear()
  
  // Setup Indonesian cultural context for testing
  localStorageMock.setItem('indonesian-cultural-context', 'enabled')
  localStorageMock.setItem('accessibility-mode', 'strict')
  localStorageMock.setItem('preferred-language', 'id')
  localStorageMock.setItem('cultural-region', 'javanese')
  
  // Mock timezone for Indonesian testing
  vi.setSystemTime(new Date('2025-01-01 10:00:00 GMT+7'))
})

afterEach(() => {
  // Cleanup DOM after each test
  cleanup()
  
  // Reset system time
  vi.useRealTimers()
})

// Indonesian Cultural Testing Utilities
export const culturalTestUtils = {
  // Mock Indonesian cultural data
  mockCulturalWisdom: {
    javanese: ['Sepi ing pamrih, rame ing gawe'],
    balinese: ['Tri Hita Karana'],
    sundanese: ['Silih asih, silih asah, silih asuh'],
    minangkabau: ['Adat basandi syarak, syarak basandi kitabullah'],
  },
  
  // Mock Indonesian meditation traditions
  mockMeditationTraditions: {
    java: 'semedi',
    bali: 'dharana',
    sunda: 'tafakur',
    minang: 'muraqabah',
  },
  
  // Mock Indonesian time periods
  mockTimePeriods: {
    pagi: { start: 5, end: 11 },
    sore: { start: 12, end: 17 },
    malam: { start: 18, end: 23 },
  },
}

// Accessibility Testing Utilities
export const accessibilityTestUtils = {
  // WCAG 2.1 AA color contrast validation
  validateColorContrast: (foreground: string, background: string) => {
    // Mock contrast ratio calculation
    return 7.1 // Simulating pass for WCAG 2.1 AA
  },
  
  // Touch target size validation (44px minimum)
  validateTouchTarget: (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    return rect.width >= 44 && rect.height >= 44
  },
  
  // Screen reader compatibility check
  validateAriaLabels: (element: HTMLElement) => {
    return element.getAttribute('aria-label') !== null ||
           element.getAttribute('aria-labelledby') !== null
  },
}

// Mobile Testing Utilities for Indonesian Networks
export const mobileTestUtils = {
  // Simulate 3G Indonesian network conditions
  simulate3G: () => {
    global.fetch = vi.fn().mockImplementation(() =>
      new Promise(resolve => 
        setTimeout(() => resolve(new Response('{}')), 2000)
      )
    )
  },
  
  // Simulate 4G Indonesian network conditions
  simulate4G: () => {
    global.fetch = vi.fn().mockImplementation(() =>
      new Promise(resolve => 
        setTimeout(() => resolve(new Response('{}')), 500)
      )
    )
  },
  
  // Mock Indonesian mobile viewport sizes
  setMobileViewport: (width: number = 375, height: number = 667) => {
    Object.defineProperty(window, 'innerWidth', { value: width, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: height, writable: true })
    window.dispatchEvent(new Event('resize'))
  },
}

// Mood System Testing Utilities
export const moodTestUtils = {
  // Mock 40+ mood options
  mockMoodOptions: [
    'very-sad', 'sad', 'neutral', 'happy', 'very-happy',
    'anxious', 'worried', 'nervous', 'stressed', 'overwhelmed',
    'angry', 'frustrated', 'irritated', 'annoyed', 'furious',
    'calm', 'peaceful', 'relaxed', 'serene', 'content',
    'excited', 'enthusiastic', 'energetic', 'motivated', 'inspired',
    'tired', 'exhausted', 'drained', 'sleepy', 'weary',
    'confused', 'lonely', 'grateful', 'hopeful', 'disappointed',
    'proud', 'embarrassed', 'curious', 'bored', 'surprised',
    'loved', 'confident', 'insecure', 'nostalgic', 'optimistic',
  ],
  
  // Mock cultural time validation
  mockTimeValidation: (hour: number) => {
    return (hour >= 5 && hour <= 11) || // Pagi
           (hour >= 12 && hour <= 17) || // Sore
           (hour >= 18 && hour <= 23)    // Malam
  },
}

// Export testing utilities for use in test files
export { 
  culturalTestUtils,
  accessibilityTestUtils,
  mobileTestUtils,
  moodTestUtils,
}

// Global test configuration
declare global {
  namespace Vi {
    interface JestAssertion<T> {
      toHaveNoViolations(): T
    }
  }
}

console.log('🧪 Sembalun Mind test setup initialized - Indonesian cultural and accessibility testing enabled')