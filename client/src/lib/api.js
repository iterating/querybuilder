// API configuration
class APIClient {
  constructor() {
    this.baseURL = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Use environment variable or fallback to default
    let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    // Ensure baseURL doesn't end with a slash
    baseURL = baseURL.replace(/\/$/, '');
    
    this.baseURL = baseURL;
    this.initialized = true;
  }

  async request(endpoint, options = {}) {
    await this.initialize();

    // Ensure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${this.baseURL}${normalizedEndpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    try {
      console.log('Making API request to:', url);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new ApiError(`API error (${response.status}): ${errorText}`, response.status, errorText);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid content type:', contentType);
        throw new ApiError('Invalid response: Expected JSON but got ' + contentType);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}

class ApiError extends Error {
  constructor(message, statusCode, data = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

class Api extends APIClient {
  // History endpoints
  async getQueryHistory() {
    return this.request('/history');
  }

  async saveQuery(query) {
    return this.request('/history', {
      method: 'POST',
      body: JSON.stringify(query),
    });
  }

  async toggleFavorite(id, isFavorite) {
    return this.request(`/history/${id}/favorite`, {
      method: 'PATCH',
      body: JSON.stringify({ is_favorite: isFavorite }),
    });
  }

  async deleteQuery(id) {
    return this.request(`/history/${id}`, {
      method: 'DELETE',
    });
  }

  async shareQuery(id) {
    return this.request(`/history/${id}/share`);
  }

  // Query-related endpoints
  async executeQuery(query, dbConfig) {
    return this.request('/queries/execute', {
      method: 'POST',
      body: JSON.stringify({ query, dbConfig })
    });
  }

  async testConnection() {
    return this.request('/test');
  }
}

export const api = new Api();
