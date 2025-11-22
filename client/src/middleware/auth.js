/**
 * Authentication Middleware
 * Centralized authentication logic and utilities
 */

/**
 * Check if user has valid authentication tokens
 * @returns {boolean} True if user has accessToken or refreshToken
 */
export const hasAuthTokens = () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  return !!(accessToken || refreshToken);
};

/**
 * Check if access token exists
 * @returns {boolean} True if accessToken exists
 */
export const hasAccessToken = () => {
  return !!localStorage.getItem('accessToken');
};

/**
 * Check if refresh token exists
 * @returns {boolean} True if refreshToken exists
 */
export const hasRefreshToken = () => {
  return !!localStorage.getItem('refreshToken');
};

/**
 * Get access token from storage
 * @returns {string|null} Access token or null
 */
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Get refresh token from storage
 * @returns {string|null} Refresh token or null
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

/**
 * Check if token is expired (within 5 minutes)
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired or will expire soon
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    
    // Token is expired or will expire within 5 minutes
    return Date.now() >= exp || exp <= fiveMinutesFromNow;
  } catch (error) {
    return true; // If we can't parse, consider it expired
  }
};

/**
 * Validate authentication state
 * @returns {Object} Auth validation result
 */
export const validateAuth = () => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  
  return {
    isAuthenticated: !!(accessToken || refreshToken),
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    accessTokenExpired: accessToken ? isTokenExpired(accessToken) : true,
    refreshTokenExpired: refreshToken ? isTokenExpired(refreshToken) : true,
  };
};

