/**
 * Handles token refresh response headers and updates the local session
 * @param {Response} response - The response from the server
 * @returns {boolean} - True if tokens were refreshed
 */
export const handleTokenRefresh = (response) => {
  const newToken = response.headers.get('X-New-Token');
  const newRefreshToken = response.headers.get('X-New-Refresh-Token');

  if (newToken && newRefreshToken) {
    // Update the tokens in local storage or your auth state management
    localStorage.setItem('access_token', newToken);
    localStorage.setItem('refresh_token', newRefreshToken);
    return true;
  }

  return false;
};

/**
 * Creates an axios interceptor to handle token refresh
 * @param {AxiosInstance} axiosInstance - The axios instance to add the interceptor to
 */
export const setupTokenRefreshInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => {
      handleTokenRefresh(response);
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // If the error is not 401 or we already tried to refresh, reject
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Check for new tokens in the error response
        if (handleTokenRefresh(error.response)) {
          // Retry the original request with the new token
          const token = localStorage.getItem('access_token');
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }

        // If no new tokens were provided, clear the session
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        
        return Promise.reject(error);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
  );
};
