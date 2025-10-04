import { useAuth } from '@/components/auth/auth-context';
import { authFetch, apiRequest } from '@/lib/auth-fetch';

// Custom hook that provides auth-enabled fetch functions
export const useAuthFetch = () => {
  const { token } = useAuth();

  return {
    authFetch,
    apiRequest,
    // Helper for common GET requests
    get: (url: string) => apiRequest(url),
    // Helper for POST requests
    post: (url: string, data?: any) => apiRequest(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
    // Helper for PUT requests
    put: (url: string, data?: any) => apiRequest(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
    // Helper for DELETE requests
    delete: (url: string) => apiRequest(url, {
      method: 'DELETE',
    }),
  };
};