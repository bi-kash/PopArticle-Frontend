import api from "./api";

export const tenantService = {
  // Register tenant
  async registerTenant(data) {
    const response = await api.post("/api/v1/tenants/register", data);
    return response.data;
  },

  // Get my tenants
  async getMyTenants() {
    const response = await api.get("/api/v1/tenants/my-tenants");
    return response.data;
  },

  // Get tenant details
  async getTenant(id) {
    const response = await api.get(`/api/v1/tenants/${id}`);
    return response.data;
  },

  // Resolve a slug, name-slug, or ID (including UUID) to a tenant object
  async getTenantBySlug(slug) {
    const data = await this.getMyTenants();
    let tenants = [];
    if (Array.isArray(data)) tenants = data;
    else if (data.tenants && Array.isArray(data.tenants))
      tenants = data.tenants;
    else if (data.data && Array.isArray(data.data)) tenants = data.data;

    const tenant = tenants.find(
      (t) =>
        t.slug === slug ||
        String(t.id) === slug ||
        t.name
          ?.toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "") === slug,
    );
    if (!tenant) throw new Error("Tenant not found");
    return tenant;
  },

  // Get tenant credentials (API key, etc.)
  async getTenantCredentials(id) {
    const response = await api.get(`/api/v1/tenants/${id}/credentials`);
    return response.data;
  },

  // Regenerate tenant API key
  async regenerateTenantApiKey(id) {
    const response = await api.post(
      `/api/v1/tenants/${id}/credentials/regenerate`,
    );
    return response.data;
  },

  // Update tenant
  async updateTenant(id, data) {
    const response = await api.put(`/api/v1/tenants/${id}`, data);
    return response.data;
  },

  // Get tenant statistics
  async getTenantStats(id) {
    const response = await api.get(`/api/v1/tenants/${id}/stats`);
    return response.data;
  },

  // Get tenant members
  async getTenantMembers(id) {
    const response = await api.get(`/api/v1/tenants/${id}/members`);
    return response.data;
  },

  // Add tenant member
  async addTenantMember(id, data) {
    const response = await api.post(`/api/v1/tenants/${id}/members`, data);
    return response.data;
  },

  // Remove tenant member
  async removeTenantMember(tenantId, userId) {
    const response = await api.delete(
      `/api/v1/tenants/${tenantId}/members/${userId}`,
    );
    return response.data;
  },
};
