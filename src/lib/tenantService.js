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
      `/api/v1/tenants/${tenantId}/members/${userId}`
    );
    return response.data;
  },
};
