/**
 * @jest-environment jsdom
 */

describe('Example Test', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    const str = 'Hello World'
    expect(str.toLowerCase()).toBe('hello world')
  })

  it('should handle array operations', () => {
    const arr = [1, 2, 3]
    expect(arr.length).toBe(3)
    expect(arr.includes(2)).toBe(true)
  })
})

describe('Environment Test', () => {
  it('should have required environment variables', () => {
    expect(process.env.NEXT_PUBLIC_FIREBASE_API_KEY).toBeDefined()
    expect(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID).toBeDefined()
  })
})
