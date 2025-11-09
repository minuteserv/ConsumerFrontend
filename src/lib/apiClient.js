/**
 * Centralized API Client
 * Professional API client with request/response interceptors, error handling, and token management
 * Following Google Engineering Standards
 */

import { API_ENDPOINTS } from './constants';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Tokens are now stored in HttpOnly cookies by the backend
 * These functions are kept for backward compatibility but are no-ops
 */
function getAccessToken() {
  // Tokens are in HttpOnly cookies, not accessible via JavaScript
  return null;
}

function getRefreshToken() {
  // Tokens are in HttpOnly cookies, not accessible via JavaScript
  return null;
}

function storeTokens(accessToken, refreshToken) {
  // Tokens are set by backend via HttpOnly cookies
  // No client-side storage needed
  console.log('Tokens are managed by backend via HttpOnly cookies');
}

function clearTokens() {
  // Tokens are cleared by backend on logout
  // No client-side cleanup needed
  console.log('Tokens are managed by backend via HttpOnly cookies');
}

/**
 * Refresh access token
 * Refresh token is stored in HttpOnly cookie, automatically sent by browser
 */
async function refreshAccessToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies (refresh token)
      // Body can be empty or include refresh_token for backward compatibility
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      // Check if refresh token is actually expired (401 = expired, 400 = missing/invalid)
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // Failed to parse error response as JSON
      }
      const errorMessage = errorData.message || errorData.error || 'Token refresh failed';
      
      // 400 = Bad Request (missing/invalid refresh token cookie)
      // 401 = Unauthorized (refresh token expired)
      // Both indicate authentication failure
      const error = new Error(errorMessage);
      error.status = response.status;
      error.isRefreshTokenExpired = response.status === 401 || response.status === 400;
      throw error;
    }

    const data = await response.json();
    // New access token is set in HttpOnly cookie by backend
    // No need to store it client-side
    return data;
  } catch (error) {
    // Preserve status and expiration flag if already set
    if (error.status) {
      const newError = new Error(error.message || 'Token refresh failed');
      newError.status = error.status;
      newError.isRefreshTokenExpired = error.isRefreshTokenExpired || error.status === 401;
      throw newError;
    }
    // Network errors - don't mark as expired
    throw error;
  }
}

/**
 * Create request with timeout
 */
function createRequestWithTimeout(url, options, timeout = REQUEST_TIMEOUT) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ]);
}

/**
 * API Client Class
 */
class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Build request headers
   */
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    // Tokens are now in HttpOnly cookies, automatically sent by browser
    // No need to manually add Authorization header

    return headers;
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (response.ok) {
        return { success: true };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Check for error response
    if (!response.ok) {
      const error = new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  /**
   * Make API request with retry logic
   */
  async request(endpoint, options = {}, retryCount = 0) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const maxRetries = 2;

    const requestOptions = {
      ...options,
      headers: this.getHeaders(options.headers),
      credentials: 'include', // Include cookies (HttpOnly tokens) in all requests
    };

    try {
      const response = await createRequestWithTimeout(url, requestOptions);

      // Handle 401 Unauthorized - try token refresh
      // CRITICAL: Skip token refresh for logout endpoint to prevent infinite loops
      if (response.status === 401 && retryCount < maxRetries && !endpoint.includes('/logout')) {
        try {
          // Refresh token is in HttpOnly cookie, automatically sent
          await refreshAccessToken();
          // Retry request (cookies will be automatically included)
          return this.request(endpoint, options, retryCount + 1);
        } catch (refreshError) {
          console.error('🌐 [apiClient] Token refresh failed:', refreshError.message);
          
          // Check if refresh token is actually expired (401 = expired, 400 = missing/invalid)
          const isRefreshTokenExpired = refreshError.status === 401 || 
                                        refreshError.status === 400 ||
                                        refreshError.isRefreshTokenExpired ||
                                        refreshError.message?.includes('expired') ||
                                        refreshError.message?.includes('Invalid token') ||
                                        refreshError.message?.includes('Refresh token is required');
          
          // CRITICAL: Only logout if refresh token is ACTUALLY expired (401 or 400)
          // But be defensive - if we have cached user, keep them logged in
          // Don't logout on network errors or other transient failures
          // CRITICAL FIX: Only dispatch logout event once, and only if we're not already logging out
          if (isRefreshTokenExpired && (refreshError.status === 401 || refreshError.status === 400)) {
            // Check if logout is already in progress to prevent infinite loops
            const isLoggingOut = window.__isLoggingOut || false;
            if (!isLoggingOut) {
              window.__isLoggingOut = true;
              // Use setTimeout to prevent immediate re-trigger
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('auth:logout'));
                // Reset flag after a delay
                setTimeout(() => {
                  window.__isLoggingOut = false;
                }, 2000);
              }, 100);
            }
            const error = new Error('Session expired. Please login again.');
            error.status = 401;
            error.isRefreshTokenExpired = true;
            throw error;
          }
          
          // If refresh failed for other reasons (network, etc.), don't logout
          // Just throw the error so the calling code can handle it gracefully
          const error = new Error(refreshError.message || 'Token refresh failed');
          error.status = refreshError.status;
          throw error;
        }
      }

      // Handle other error statuses before checking response
      if (!response.ok && response.status !== 401) {
        return await this.handleResponse(response);
      }

      return await this.handleResponse(response);
    } catch (error) {
      // Handle network errors
      if (error.message === 'Request timeout') {
        throw new Error('Request timeout. Please try again.');
      }

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }

      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export utility functions
export { getAccessToken, getRefreshToken, storeTokens, clearTokens, refreshAccessToken };

