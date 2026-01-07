import api from "./api";

export const articleService = {
  // Generate article with AI
  async generateArticle(data, tenantId = null) {
    const config = {};

    // If tenant_id is provided, send it as X-Tenant-ID header
    // Priority: explicit tenantId parameter > data.tenant_id
    const effectiveTenantId = tenantId || data.tenant_id;
    if (effectiveTenantId) {
      config.headers = { "X-Tenant-ID": effectiveTenantId };
    }

    const response = await api.post("/api/v1/articles/generate", data, config);
    return response.data;
  },

  // Get all articles
  async getArticles(params = {}) {
    // Extract tenant_id from params to send as header
    const { tenant_id, ...queryParams } = params;
    const config = { params: queryParams };

    // If tenant_id is provided, send it as X-Tenant-ID header
    if (tenant_id) {
      config.headers = { "X-Tenant-ID": tenant_id };
    }

    const response = await api.get("/api/v1/articles", config);
    return response.data;
  },

  // Get single article
  async getArticle(id, tenantId = null) {
    const config = {};

    // If tenant_id is provided, send it as X-Tenant-ID header
    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.get(`/api/v1/articles/${id}`, config);
    return response.data;
  },

  // Create article
  async createArticle(data, tenantId = null, isFormData = false) {
    const config = {};

    // If tenant_id is provided, send it as X-Tenant-ID header
    // Priority: explicit tenantId parameter > data.tenant_id
    const effectiveTenantId =
      tenantId || data.tenant_id || data.get?.("tenant_id");
    if (effectiveTenantId) {
      config.headers = { "X-Tenant-ID": effectiveTenantId };
    }

    // Set Content-Type for FormData
    if (isFormData) {
      config.headers = {
        ...config.headers,
        "Content-Type": "multipart/form-data",
      };
    }

    const response = await api.post("/api/v1/articles", data, config);
    return response.data;
  },

  // Update article
  async updateArticle(id, data, tenantId = null, isFormData = false) {
    const config = {};

    // If tenant_id is provided, send it as X-Tenant-ID header
    const effectiveTenantId =
      tenantId || data.tenant_id || data.get?.("tenant_id");
    if (effectiveTenantId) {
      config.headers = { "X-Tenant-ID": effectiveTenantId };
    }

    // Set Content-Type for FormData
    if (isFormData) {
      config.headers = {
        ...config.headers,
        "Content-Type": "multipart/form-data",
      };
    }

    const response = await api.put(`/api/v1/articles/${id}`, data, config);
    return response.data;
  },

  // Delete article
  async deleteArticle(id, tenantId = null) {
    const config = {};

    // If tenant_id is provided, send it as X-Tenant-ID header
    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.delete(`/api/v1/articles/${id}`, config);
    return response.data;
  },

  // Search articles
  async searchArticles(query, limit = 10, tenantId = null) {
    const config = {
      params: { q: query, limit },
    };

    // If tenant_id is provided, send it as X-Tenant-ID header
    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.get("/api/v1/articles/search", config);
    return response.data;
  },

  // Publish article
  async publishArticle(id, tenantId = null) {
    const config = {};

    // If tenant_id is provided, send it as X-Tenant-ID header
    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.post(
      `/api/v1/articles/${id}/publish`,
      {},
      config
    );
    return response.data;
  },
};
