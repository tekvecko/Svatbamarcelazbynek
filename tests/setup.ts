import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.NODE_ENV = 'test'

// Mock fetch globally
global.fetch = vi.fn()

// Mock file API for upload tests
Object.defineProperty(window, 'File', {
  value: class File {
    constructor(public chunks: any[], public name: string, public options: any = {}) {}
    get size() { return this.chunks.reduce((acc, chunk) => acc + chunk.length, 0) }
    get type() { return this.options.type || '' }
  }
})

Object.defineProperty(window, 'FileList', {
  value: class FileList extends Array {
    constructor(files: File[]) {
      super()
      files.forEach((file, i) => this[i] = file)
      this.length = files.length
    }
  }
})