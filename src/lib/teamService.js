import api from "./api";

export const teamService = {
  // Create team member
  async createTeamMember(tenantId, data) {
    const response = await api.post("/api/v1/team", data, {
      headers: {
        "X-Tenant-ID": tenantId,
      },
    });
    return response.data;
  },

  // Get all team members
  async getTeamMembers(tenantId, includeInactive = false) {
    const params = includeInactive ? { include_inactive: true } : {};
    const response = await api.get("/api/v1/team", {
      headers: {
        "X-Tenant-ID": tenantId,
      },
      params,
    });
    return response.data;
  },

  // Get single team member
  async getTeamMember(tenantId, teamMemberId) {
    const response = await api.get(`/api/v1/team/${teamMemberId}`, {
      headers: {
        "X-Tenant-ID": tenantId,
      },
    });
    return response.data;
  },

  // Update team member
  async updateTeamMember(tenantId, teamMemberId, data) {
    const response = await api.put(`/api/v1/team/${teamMemberId}`, data, {
      headers: {
        "X-Tenant-ID": tenantId,
      },
    });
    return response.data;
  },

  // Delete team member
  async deleteTeamMember(tenantId, teamMemberId) {
    const response = await api.delete(`/api/v1/team/${teamMemberId}`, {
      headers: {
        "X-Tenant-ID": tenantId,
      },
    });
    return response.data;
  },

  // Sync tenant users
  async syncTenantUsers(tenantId) {
    const response = await api.post("/api/v1/team/sync-users", null, {
      headers: {
        "X-Tenant-ID": tenantId,
      },
    });
    return response.data;
  },
};
