import '@testing-library/jest-dom'

// Polyfill crypto.randomUUID for Jest
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
  }
})
