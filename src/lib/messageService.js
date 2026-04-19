import api from "./api";

export const messageService = {
  // Send a message/contact form
  async sendMessage(data, tenantId = null) {
    const config = {};

    // If tenant_id is provided, send it as X-Tenant-ID header
    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.post("/api/v1/messages", data, config);
    return response.data;
  },

  // List all messages (Admin/Owner only)
  async getMessages(params = {}, tenantId = null) {
    const config = { params };

    // If tenant_id is provided, send it as X-Tenant-ID header
    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
      console.log("📋 Message Service - Setting X-Tenant-ID header:", tenantId);
    }

    console.log("📋 Message Service - Request config:", {
      url: "/api/v1/messages",
      params,
      headers: config.headers,
    });

    const response = await api.get("/api/v1/messages", config);
    console.log("📋 Message Service - Raw API response:", response);

    // Attach sent/received metadata to result for debugging in UI
    const result = response.data || {};
    result._meta = {
      // full axios request/response config sent back by axios
      sent_config: response.config || config,
      sent_headers: response.config?.headers || config.headers || {},
      params: config.params || response.config?.params || null,
      method: response.config?.method || "get",
      status: response.status,
      url: response.config?.url,
    };

    return result;
  },

  // Get single message details
  async getMessage(id, tenantId = null) {
    const config = {};

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.get(`/api/v1/messages/${id}`, config);
    return response.data;
  },

  // Update message status/reply
  async updateMessage(id, data, tenantId = null) {
    const config = {};

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    // Try with tenant header first, if it fails with 404/403 and we had a
    // tenantId, retry without it (backend may resolve by message ID alone)
    try {
      const response = await api.patch(`/api/v1/messages/${id}`, data, config);
      return response.data;
    } catch (err) {
      const status = err.response?.status;
      if (tenantId && (status === 404 || status === 403)) {
        const retryResponse = await api.patch(
          `/api/v1/messages/${id}`,
          data,
          {},
        );
        return retryResponse.data;
      }
      throw err;
    }
  },

  // Delete a message
  async deleteMessage(id, tenantId = null) {
    const config = {};

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.delete(`/api/v1/messages/${id}`, config);
    return response.data;
  },
};

export default messageService;
