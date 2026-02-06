import api from "./api";

export const socialMediaService = {
  // ========== Configuration Endpoints ==========

  // Get all social media configurations
  async getConfigs(params = {}, tenantId = null) {
    const { tenant_id, ...queryParams } = params;
    const config = { params: queryParams };

    const effectiveTenantId = tenantId || tenant_id;
    if (effectiveTenantId) {
      config.headers = { "X-Tenant-ID": effectiveTenantId };
    }

    const response = await api.get("/api/v1/social-media/configs", config);
    return response.data;
  },

  // Get single configuration
  async getConfig(id, tenantId = null) {
    const config = {};

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.get(
      `/api/v1/social-media/configs/${id}`,
      config,
    );
    return response.data;
  },

  // Create configuration
  async createConfig(data, tenantId = null) {
    const config = {};

    const effectiveTenantId = tenantId || data.tenant_id;
    if (effectiveTenantId) {
      config.headers = { "X-Tenant-ID": effectiveTenantId };
    }

    const response = await api.post(
      "/api/v1/social-media/configs",
      data,
      config,
    );
    return response.data;
  },

  // Update configuration
  async updateConfig(id, data, tenantId = null) {
    const config = {};

    const effectiveTenantId = tenantId || data.tenant_id;
    if (effectiveTenantId) {
      config.headers = { "X-Tenant-ID": effectiveTenantId };
    }

    const response = await api.put(
      `/api/v1/social-media/configs/${id}`,
      data,
      config,
    );
    return response.data;
  },

  // Delete configuration
  async deleteConfig(id, tenantId = null) {
    const config = {};

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.delete(
      `/api/v1/social-media/configs/${id}`,
      config,
    );
    return response.data;
  },

  // Verify token validity
  async verifyToken(configId, tenantId = null) {
    const config = {};

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.post(
      `/api/v1/social-media/configs/${configId}/verify`,
      {},
      config,
    );
    return response.data;
  },

  // ========== Content Generation Endpoints ==========

  // Generate AI post from article
  async generatePost(data, tenantId = null) {
    const config = {};

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.post(
      "/api/v1/social-media/generate-post",
      data,
      config,
    );
    return response.data;
  },

  // Regenerate post with feedback
  async regeneratePost(data, tenantId = null) {
    const config = {};

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.post(
      "/api/v1/social-media/regenerate-post",
      data,
      config,
    );
    return response.data;
  },

  // ========== Posting Endpoints ==========

  // Post to social media
  async postToSocialMedia(data, tenantId = null) {
    const config = {};

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.post("/api/v1/social-media/post", data, config);
    return response.data;
  },

  // ========== Log Endpoints ==========

  // Get post logs
  async getLogs(params = {}, tenantId = null) {
    const { tenant_id, ...queryParams } = params;
    const config = { params: queryParams };

    const effectiveTenantId = tenantId || tenant_id;
    if (effectiveTenantId) {
      config.headers = { "X-Tenant-ID": effectiveTenantId };
    }

    const response = await api.get("/api/v1/social-media/logs", config);
    return response.data;
  },

  // Get single log
  async getLog(id, tenantId = null) {
    const config = {};

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.get(`/api/v1/social-media/logs/${id}`, config);
    return response.data;
  },

  // Get posting statistics
  async getStats(days = 30, tenantId = null) {
    const config = { params: { days } };

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.get("/api/v1/social-media/stats", config);
    return response.data;
  },

  // ========== Meta OAuth Helper Endpoints ==========

  // Get OAuth connect URL - initiates Facebook OAuth flow
  getOAuthConnectUrl(frontendCallback, tenantId = null, accessToken = null) {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
    const params = new URLSearchParams({
      frontend_callback: frontendCallback,
    });
    if (tenantId) {
      params.append("tenant_id", tenantId);
    }
    if (accessToken) {
      params.append("access_token", accessToken);
    }
    return `${baseUrl}/api/v1/social-media/oauth/connect?${params.toString()}`;
  },

  // Get OAuth status - check connected accounts
  async getOAuthStatus(tenantId = null) {
    const config = {};

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.get("/api/v1/social-media/oauth/status", config);
    return response.data;
  },

  // Disconnect account via OAuth
  async disconnectOAuth(configId, tenantId = null) {
    const config = {};

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.post(
      `/api/v1/social-media/oauth/disconnect/${configId}`,
      {},
      config,
    );
    return response.data;
  },

  // Get Facebook pages
  async getFacebookPages(userAccessToken, tenantId = null) {
    const config = {};

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.post(
      "/api/v1/social-media/meta/pages",
      { user_access_token: userAccessToken },
      config,
    );
    return response.data;
  },

  // Get Instagram business accounts
  async getInstagramAccounts(userAccessToken, tenantId = null) {
    const config = {};

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.post(
      "/api/v1/social-media/meta/instagram-accounts",
      { user_access_token: userAccessToken },
      config,
    );
    return response.data;
  },

  // Exchange short-lived token for long-lived
  async exchangeToken(shortLivedToken, tenantId = null) {
    const config = {};

    if (tenantId) {
      config.headers = { "X-Tenant-ID": tenantId };
    }

    const response = await api.post(
      "/api/v1/social-media/meta/exchange-token",
      { short_lived_token: shortLivedToken },
      config,
    );
    return response.data;
  },
};
