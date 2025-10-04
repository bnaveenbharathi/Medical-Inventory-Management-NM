import toast from 'react-hot-toast';

// Store logout callback globally
let globalLogout: ((showMessage?: boolean) => void) | null = null;

// Function to set the logout callback
export const setLogoutCallback = (logout: (showMessage?: boolean) => void) => {
  globalLogout = logout;
};

// Enhanced fetch function with automatic token handling and logout on 401/403
export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Get token from localStorage
  const token = localStorage.getItem('jwt_token');
  
  // Add authorization header if token exists
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Handle 401 (Unauthorized) or 403 (Forbidden) responses
  if ((response.status === 401 || response.status === 403) && globalLogout) {
    try {
      const errorData = await response.clone().json();
      const errorMessage = errorData?.message?.toLowerCase() || '';
      
      // Check if the error is related to token expiration
      if (errorMessage.includes('token') || errorMessage.includes('expired') || errorMessage.includes('unauthorized')) {
        globalLogout(true);
        throw new Error('Session expired');
      }
    } catch (e) {
      // If we can't parse the response, still logout on 401/403
      globalLogout(true);
      throw new Error('Session expired');
    }
  }
  
  return response;
};

// Utility function for common API patterns
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await authFetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};