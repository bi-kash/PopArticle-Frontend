import api from "./api";

export const vercelService = {
  // ═══════════════════════════════════════════════════════════════════════════
  //  Admin — Vercel Config
  // ═══════════════════════════════════════════════════════════════════════════

  async getVercelConfig() {
    const response = await api.get("/api/v1/admin/vercel/config");
    return response.data;
  },

  async createVercelConfig(data) {
    const response = await api.post("/api/v1/admin/vercel/config", data);
    return response.data;
  },

  async updateVercelConfig(configId, data) {
    const response = await api.put(
      `/api/v1/admin/vercel/config/${configId}`,
      data,
    );
    return response.data;
  },

  async deleteVercelConfig(configId) {
    const response = await api.delete(
      `/api/v1/admin/vercel/config/${configId}`,
    );
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  Admin — Frontend Templates
  // ═══════════════════════════════════════════════════════════════════════════

  async listAllTemplates({ page = 1, per_page = 20 } = {}) {
    const response = await api.get("/api/v1/admin/vercel/templates", {
      params: { page, per_page },
    });
    return response.data;
  },

  async createTemplate(data) {
    const response = await api.post("/api/v1/admin/vercel/templates", data);
    return response.data;
  },

  async updateTemplate(templateId, data) {
    const response = await api.put(
      `/api/v1/admin/vercel/templates/${templateId}`,
      data,
    );
    return response.data;
  },

  async deleteTemplate(templateId) {
    const response = await api.delete(
      `/api/v1/admin/vercel/templates/${templateId}`,
    );
    return response.data;
  },

  async publishTemplate(templateId) {
    const response = await api.post(
      `/api/v1/admin/vercel/templates/${templateId}/publish`,
    );
    return response.data;
  },

  async unpublishTemplate(templateId) {
    const response = await api.post(
      `/api/v1/admin/vercel/templates/${templateId}/unpublish`,
    );
    return response.data;
  },

  async syncTemplates() {
    const response = await api.post("/api/v1/admin/vercel/templates/sync");
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  User — Public Templates
  // ═══════════════════════════════════════════════════════════════════════════

  async listPublicTemplates({ page = 1, per_page = 20 } = {}) {
    const response = await api.get("/api/v1/vercel/templates", {
      params: { page, per_page },
    });
    return response.data;
  },

  async getPublicTemplate(templateId) {
    const response = await api.get(`/api/v1/vercel/templates/${templateId}`);
    return response.data;
  },
};
