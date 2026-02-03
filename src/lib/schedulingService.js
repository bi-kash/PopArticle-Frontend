import api from "./api";

export const schedulingService = {
  // Get all scheduling configurations
  async getConfigs(params = {}, tenantId = null) {
    const { tenant_id, ...queryParams } = params;
    const config = { params: queryParams };

    const effectiveTenantId = tenantId || tenant_id;
    if (effectiveTenantId) {
      config.headers = { "X-Tenant-ID": effectiveTenantId };
    }

    const response = await api.get("/api/v1/scheduling/configs", config);
    return response.data;
  },

  // Get single scheduling configuration
  async getConfig(id, tenantId = null) {
    const config = {};

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.get(`/api/v1/scheduling/configs/${id}`, config);
    return response.data;
  },

  // Get scheduling configuration by category
  async getConfigByCategory(categoryId, tenantId = null) {
    const config = {};

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.get(
      `/api/v1/scheduling/configs/category/${categoryId}`,
      config,
    );
    return response.data;
  },

  // Create scheduling configuration
  async createConfig(data, tenantId = null) {
    const config = {};

    const effectiveTenantId = tenantId || data.tenant_id;
    if (effectiveTenantId) {
      config.headers = { "X-Tenant-ID": effectiveTenantId };
    }

    const response = await api.post("/api/v1/scheduling/configs", data, config);
    return response.data;
  },

  // Update scheduling configuration
  async updateConfig(id, data, tenantId = null) {
    const config = {};

    const effectiveTenantId = tenantId || data.tenant_id;
    if (effectiveTenantId) {
      config.headers = { "X-Tenant-ID": effectiveTenantId };
    }

    const response = await api.put(
      `/api/v1/scheduling/configs/${id}`,
      data,
      config,
    );
    return response.data;
  },

  // Delete scheduling configuration
  async deleteConfig(id, tenantId = null) {
    const config = {};

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.delete(
      `/api/v1/scheduling/configs/${id}`,
      config,
    );
    return response.data;
  },

  // Trigger article generation manually
  async triggerGeneration(configId, tenantId = null) {
    const config = {};

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.post(
      `/api/v1/scheduling/configs/${configId}/trigger`,
      {},
      config,
    );
    return response.data;
  },

  // Get generation logs
  async getLogs(params = {}, tenantId = null) {
    const { tenant_id, ...queryParams } = params;
    const config = { params: queryParams };

    const effectiveTenantId = tenantId || tenant_id;
    if (effectiveTenantId) {
      config.headers = { "X-Tenant-ID": effectiveTenantId };
    }

    const response = await api.get("/api/v1/scheduling/logs", config);
    return response.data;
  },

  // Get generation statistics
  async getStats(days = 7, tenantId = null) {
    const config = { params: { days } };

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.get("/api/v1/scheduling/stats", config);
    return response.data;
  },
};
