import api from "./api";

export const categoryService = {
  // Get all categories (optionally filtered by tenant)
  async getCategories(params = {}) {
    // Extract tenant_id from params to send as header
    const { tenant_id, ...queryParams } = params;
    const config = { params: queryParams };

    // If tenant_id is provided, send it as X-Tenant-ID header
    if (tenant_id) {
      config.headers = { "X-Tenant-ID": tenant_id };
    }

    const response = await api.get("/api/v1/categories", config);
    return response.data;
  },

  // Get single category
  async getCategory(id, tenantId = null) {
    const config = {};

    // If tenant_id is provided, send it as X-Tenant-ID header
    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.get(`/api/v1/categories/${id}`, config);
    return response.data;
  },

  // Create category
  async createCategory(data, tenantId = null) {
    const config = {};

    // If tenant_id is provided, send it as X-Tenant-ID header
    // Priority: explicit tenantId parameter > data.tenant_id
    const effectiveTenantId = tenantId || data.tenant_id;
    if (effectiveTenantId) {
      config.headers = { "X-Tenant-ID": effectiveTenantId };
    }

    const response = await api.post("/api/v1/categories", data, config);
    return response.data;
  },

  // Update category
  async updateCategory(id, data, tenantId = null) {
    const config = {};

    // If tenant_id is provided, send it as X-Tenant-ID header
    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.put(`/api/v1/categories/${id}`, data, config);
    return response.data;
  },

  // Delete category with options for handling articles
  async deleteCategory(id, params = {}, tenantId = null) {
    const config = {};

    // Add params if provided
    if (Object.keys(params).length > 0) {
      config.params = params;
    }

    // If tenant_id is provided, send it as X-Tenant-ID header
    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.delete(`/api/v1/categories/${id}`, config);
    return response.data;
  },
};
