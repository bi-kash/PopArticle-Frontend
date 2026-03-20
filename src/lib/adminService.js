import api from "./api";

export const adminService = {
  // ─── Dashboard ───────────────────────────────────────────────────────────────

  async getDashboardStats() {
    const response = await api.get("/api/v1/admin/dashboard");
    return response.data;
  },

  // ─── Tenant Management ────────────────────────────────────────────────────────

  async listTenants({ page = 1, per_page = 20, search = "", is_active } = {}) {
    const params = { page, per_page };
    if (search) params.search = search;
    if (is_active !== undefined && is_active !== "")
      params.is_active = is_active;
    const response = await api.get("/api/v1/admin/tenants", { params });
    return response.data;
  },

  async suspendTenant(tenantId) {
    const response = await api.post(
      `/api/v1/admin/tenants/${tenantId}/suspend`,
    );
    return response.data;
  },

  async activateTenant(tenantId) {
    const response = await api.post(
      `/api/v1/admin/tenants/${tenantId}/activate`,
    );
    return response.data;
  },

  async deleteTenant(tenantId) {
    const response = await api.delete(`/api/v1/admin/tenants/${tenantId}`);
    return response.data;
  },

  // ─── User Management ──────────────────────────────────────────────────────────

  async listUsers({
    page = 1,
    per_page = 20,
    search = "",
    is_active,
    tenant_id,
  } = {}) {
    const params = { page, per_page };
    if (search) params.search = search;
    if (is_active !== undefined && is_active !== "")
      params.is_active = is_active;
    if (tenant_id) params.tenant_id = tenant_id;
    const response = await api.get("/api/v1/admin/users", { params });
    return response.data;
  },

  async deactivateUser(userId) {
    const response = await api.post(`/api/v1/admin/users/${userId}/deactivate`);
    return response.data;
  },

  async activateUser(userId) {
    const response = await api.post(`/api/v1/admin/users/${userId}/activate`);
    return response.data;
  },

  // ─── Global Admin Role Management ─────────────────────────────────────────────

  async grantAdmin(userId) {
    const response = await api.post(
      `/api/v1/admin/users/${userId}/grant-admin`,
    );
    return response.data;
  },

  async revokeAdmin(userId) {
    const response = await api.post(
      `/api/v1/admin/users/${userId}/revoke-admin`,
    );
    return response.data;
  },

  // ─── Platform Insights ────────────────────────────────────────────────────────

  async getPlatformInsights(days = 30) {
    const response = await api.get("/api/v1/admin/dashboard/insights", {
      params: { days },
    });
    return response.data;
  },

  // ─── Content Analytics ────────────────────────────────────────────────────────

  async getContentAnalytics(days = 30) {
    const response = await api.get("/api/v1/admin/dashboard/content", {
      params: { days },
    });
    return response.data;
  },

  // ─── Revenue Analytics ────────────────────────────────────────────────────────

  async getRevenueAnalytics(days = 30) {
    const response = await api.get("/api/v1/admin/dashboard/revenue", {
      params: { days },
    });
    return response.data;
  },

  // ─── Audit Logs ───────────────────────────────────────────────────────────────

  async getAuditLogs({
    page = 1,
    per_page = 50,
    admin_user_id,
    action,
    resource_type,
  } = {}) {
    const params = { page, per_page };
    if (admin_user_id) params.admin_user_id = admin_user_id;
    if (action) params.action = action;
    if (resource_type) params.resource_type = resource_type;
    const response = await api.get("/api/v1/admin/audit-logs", { params });
    return response.data;
  },
};
