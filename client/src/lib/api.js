// API configuration
class APIClient {
  constructor() {
    this.baseURL = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Use environment variable or fallback to deployment URL
    let baseURL = import.meta.env.VITE_API_URL || 'https://querybuilder.vercel.app';
    
    // Ensure baseURL doesn't end with a slash
    baseURL = baseURL.replace(/\/$/, '');
    
    this.baseURL = baseURL;
    this.initialized = true;
    console.log('API Client initialized with baseURL:', this.baseURL);
  }

  async request(endpoint, options = {}) {
    await this.initialize();

    // Ensure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // Don't add /api prefix if the endpoint already has it
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${this.baseURL}${normalizedEndpoint.startsWith('/api') ? normalizedEndpoint : `/api${normalizedEndpoint}`}`;

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
          body: errorText
        });
        throw new ApiError(
          errorText || response.statusText,
          response.status
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message);
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
    return this.request('/api/history');
  }

  async saveQuery(query) {
    return this.request('/api/history', {
      method: 'POST',
      body: JSON.stringify(query)
    });
  }

  async toggleFavorite(id, isFavorite) {
    return this.request(`/api/history/${id}/favorite`, {
      method: 'PUT',
      body: JSON.stringify({ isFavorite })
    });
  }

  async deleteQuery(id) {
    return this.request(`/api/history/${id}`, {
      method: 'DELETE'
    });
  }

  async shareQuery(id) {
    return this.request(`/api/history/${id}/share`, {
      method: 'POST'
    });
  }

  // Query-related endpoints
  async executeQuery(query, dbConfig) {
    return this.request('/api/queries/execute', {
      method: 'POST',
      body: JSON.stringify({ query, dbConfig })
    });
  }

  async testConnection() {
    try {
      const result = await this.request('/api/test');
      return result;
    } catch (error) {
      console.error('Test connection failed:', error);
      throw error;
    }
  }
}

export const api = new Api();
