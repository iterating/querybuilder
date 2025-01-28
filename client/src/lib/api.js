class ApiError extends Error {
  constructor(message, statusCode, data = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

class Api {
  async request(endpoint, options = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`/api${endpoint}`, config);
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        throw new ApiError(
          data.message || 'An error occurred',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || 'Network error', 500);
    }
  }

  // History endpoints
  async getQueryHistory() {
    return this.request('/history');
  }

  async saveQuery(query) {
    return this.request('/history', {
      method: 'POST',
      body: query,
    });
  }

  async toggleFavorite(id, isFavorite) {
    return this.request(`/history/${id}/favorite`, {
      method: 'PATCH',
      body: { is_favorite: isFavorite },
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

  // Template endpoints
  async getTemplates() {
    return this.request('/templates');
  }

  async createTemplate(template) {
    return this.request('/templates', {
      method: 'POST',
      body: template,
    });
  }

  async deleteTemplate(id) {
    return this.request(`/templates/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new Api();
