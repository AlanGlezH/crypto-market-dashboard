export class RateLimitError extends Error {
  override readonly name = 'RateLimitError'
  readonly status = 429 as const

  constructor(message = 'Too many requests') {
    super(message)
  }
}

export class ApiError extends Error {
  override readonly name = 'ApiError'
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}
