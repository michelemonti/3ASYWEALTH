/**
 * 🌐 Professional API Client
 * 
 * Type-safe API client with error handling, retries, and interceptors.
 * 
 * @author Michele Miky Monti
 * @version 2.0 - Claude 4.5 Upgrade
 */

import type { ApiResponse, ApiError } from '../types'

// =============================================================================
// 🚨 CUSTOM ERROR CLASSES
// =============================================================================

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network request failed') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends Error {
  constructor(message = 'Request timeout') {
    super(message)
    this.name = 'TimeoutError'
  }
}

// =============================================================================
// 🔧 API CLIENT CONFIGURATION
// =============================================================================

interface ApiClientConfig {
  baseURL?: string
  timeout?: number
  retries?: number
  retryDelay?: number
  headers?: Record<string, string>
  onRequest?: (config: RequestInit) => RequestInit | Promise<RequestInit>
  onResponse?: (response: Response) => Response | Promise<Response>
  onError?: (error: Error) => void
}

// =============================================================================
// 🎯 API CLIENT CLASS
// =============================================================================

export class ApiClient {
  private config: Required<ApiClientConfig>

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseURL: config.baseURL || '',
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      headers: config.headers || {},
      onRequest: config.onRequest || ((c) => c),
      onResponse: config.onResponse || ((r) => r),
      onError: config.onError || console.error,
    }
  }

  /**
   * 🔧 Make HTTP Request with automatic retries
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt = 1
  ): Promise<T> {
    try {
      // Build full URL
      const url = `${this.config.baseURL}${endpoint}`

      // Prepare request config
      let config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
          ...options.headers,
        },
      }

      // Apply request interceptor
      config = await this.config.onRequest(config)

      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      try {
        // Make request
        let response = await fetch(url, {
          ...config,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Apply response interceptor
        response = await this.config.onResponse(response)

        // Handle HTTP errors
        if (!response.ok) {
          const error = await this.parseError(response)
          throw new ApiClientError(
            error.message,
            response.status,
            error.code,
            error.details
          )
        }

        // Parse JSON response
        const data = await response.json()
        return data
      } catch (error) {
        clearTimeout(timeoutId)

        // Handle timeout
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new TimeoutError()
        }

        throw error
      }
    } catch (error) {
      // Retry on network errors
      if (
        attempt < this.config.retries &&
        (error instanceof NetworkError || error instanceof TimeoutError)
      ) {
        await this.delay(this.config.retryDelay * attempt)
        return this.request<T>(endpoint, options, attempt + 1)
      }

      // Call error handler
      this.config.onError(error as Error)
      throw error
    }
  }

  /**
   * 📖 Parse error response
   */
  private async parseError(response: Response): Promise<ApiError> {
    try {
      const data = await response.json()
      return {
        code: data.code || 'UNKNOWN_ERROR',
        message: data.message || response.statusText,
        status: response.status,
        details: data.details,
      }
    } catch {
      return {
        code: 'PARSE_ERROR',
        message: response.statusText || 'Unknown error occurred',
        status: response.status,
      }
    }
  }

  /**
   * ⏱️ Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 🔄 Wrap response in ApiResponse format
   */
  private async wrapResponse<T>(
    fn: () => Promise<T>
  ): Promise<ApiResponse<T>> {
    try {
      const data = await fn()
      return { success: true, data }
    } catch (error) {
      if (error instanceof ApiClientError) {
        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            status: error.status,
            details: error.details,
          },
        }
      }

      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          status: 500,
        },
      }
    }
  }

  // =============================================================================
  // 📡 HTTP METHODS
  // =============================================================================

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.wrapResponse(() =>
      this.request<T>(endpoint, { ...options, method: 'GET' })
    )
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.wrapResponse(() =>
      this.request<T>(endpoint, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body),
      })
    )
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.wrapResponse(() =>
      this.request<T>(endpoint, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(body),
      })
    )
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.wrapResponse(() =>
      this.request<T>(endpoint, {
        ...options,
        method: 'PATCH',
        body: JSON.stringify(body),
      })
    )
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.wrapResponse(() =>
      this.request<T>(endpoint, { ...options, method: 'DELETE' })
    )
  }
}

// =============================================================================
// 🌟 DEFAULT EXPORT
// =============================================================================

export const apiClient = new ApiClient({
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  onError: (error) => {
    if (import.meta.env.DEV) {
      console.error('API Error:', error)
    }
  },
})
