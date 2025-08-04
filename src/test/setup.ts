import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Firebase
vi.mock('../config/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    signOut: vi.fn(),
  },
  db: {},
  storage: {},
  googleProvider: {},
  appleProvider: {},
}))

// Mock environment variables
vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key')
vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com')
vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project')
vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'test.appspot.com')
vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789')
vi.stubEnv('VITE_FIREBASE_APP_ID', 'test-app-id')

// Mock navigator.onLine for offline tests
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
global.sessionStorage = sessionStorageMock

// Mock performance API
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

// Mock window.matchMedia
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

// Mock process.env for client-side code
if (typeof process === 'undefined') {
  global.process = {
    env: {
      NODE_ENV: 'test'
    }
  } as any
}