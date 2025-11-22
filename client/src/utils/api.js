// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

// Helper function to refresh token if needed
const refreshTokenIfNeeded = async () => {
  const accessToken = getAuthToken();
  const refreshToken = localStorage.getItem('refreshToken');

  // If no tokens, return false
  if (!accessToken || !refreshToken) {
    return false;
  }

  // Check if access token is expired or about to expire (within 5 minutes)
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const exp = payload.exp * 1000;
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;

    // If token is expired or will expire soon, refresh it
    if (Date.now() >= exp || exp <= fiveMinutesFromNow) {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.accessToken) {
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          return true;
        }
      }
    }
  } catch (error) {
    console.error('Token refresh error:', error);
  }

  return false;
};

// Enhanced fetch wrapper that handles token refresh
const fetchWithAuth = async (url, options = {}) => {
  // Try to refresh token if needed before making the request
  await refreshTokenIfNeeded();

  const token = getAuthToken();
  
  // Add Authorization header if token exists
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // If we get a 401, try to refresh token and retry once
  if (response.status === 401) {
    const refreshed = await refreshTokenIfNeeded();
    
    if (refreshed) {
      const newToken = getAuthToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        // Retry the request with new token
        response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include',
        });
      }
    } else {
      // If refresh failed, clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }

  return response;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  // Check if response is ok before trying to parse JSON
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON, create a generic error
      errorData = {
        message: `HTTP ${response.status}: ${response.statusText || 'An error occurred'}`,
      };
    }
    
    const error = {
      message: errorData.message || 'An error occurred',
      status: response.status,
      data: errorData
    };
    throw error;
  }
  
  // Parse JSON for successful responses
  const data = await response.json();
  return data;
};

// API service object
const api = {
  // Auth endpoints
  auth: {
    // Login
    login: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      
      const data = await handleResponse(response);
      
      // Store tokens in localStorage
      if (data.data && data.data.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }
      
      return data;
    },

    // Register
    register: async (firstname, lastname, email, password, DOB, gender) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstname,
          lastname,
          email,
          password,
          DOB,
          gender,
        }),
      });
      
      const data = await handleResponse(response);
      
      // Store tokens in localStorage
      if (data.data && data.data.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }
      
      return data;
    },

    // Refresh token
    refreshToken: async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      });
      
      const data = await handleResponse(response);
      
      // Update tokens in localStorage
      if (data.data && data.data.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
      }
      
      return data;
    },

    // Logout
    logout: async () => {
      try {
        await fetchWithAuth(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Clear localStorage regardless of API call success
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    },

    // Get current user from localStorage
    getCurrentUser: () => {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
      return !!localStorage.getItem('accessToken');
    },
  },
};

// Export fetchWithAuth for use in other API calls
export { fetchWithAuth };

export default api;

