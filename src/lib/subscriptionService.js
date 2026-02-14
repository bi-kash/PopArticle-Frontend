import api from "./api";

export const subscriptionService = {
  /**
   * Get subscription status for a tenant
   * @param {string} tenantId - The tenant ID
   * @returns {Promise} Subscription status data
   */
  async getStatus(tenantId) {
    const response = await api.get("/api/v1/subscriptions/status", {
      headers: { "X-Tenant-ID": tenantId },
    });
    return response.data;
  },

  /**
   * Get all available subscription plans
   * @returns {Promise} List of available plans
   */
  async getPlans() {
    const response = await api.get("/api/v1/subscriptions/plans");
    return response.data;
  },

  /**
   * Create a checkout session for subscription
   * @param {string} tenantId - The tenant ID
   * @param {object} data - Checkout data { plan, success_url, cancel_url }
   * @returns {Promise} Checkout session with checkout_url
   */
  async createCheckout(tenantId, data) {
    const payload = {
      ...data,
      plan: data.plan?.toLowerCase().trim(),
    };
    const response = await api.post("/api/v1/subscriptions/checkout", payload, {
      headers: { "X-Tenant-ID": tenantId },
    });
    return response.data;
  },

  /**
   * Cancel subscription
   * @param {string} tenantId - The tenant ID
   * @param {object} data - Cancel data { effective_from: "next_billing_period" | "immediately" }
   * @returns {Promise} Cancellation result
   */
  async cancelSubscription(
    tenantId,
    data = { effective_from: "next_billing_period" },
  ) {
    const response = await api.post("/api/v1/subscriptions/cancel", data, {
      headers: { "X-Tenant-ID": tenantId },
    });
    return response.data;
  },

  /**
   * Upgrade or downgrade subscription
   * @param {string} tenantId - The tenant ID
   * @param {object} data - Upgrade data { plan, proration }
   * @returns {Promise} Upgrade result
   */
  async upgradeSubscription(tenantId, data) {
    const payload = {
      ...data,
      plan: data.plan?.toLowerCase().trim(),
    };
    const response = await api.post("/api/v1/subscriptions/upgrade", payload, {
      headers: { "X-Tenant-ID": tenantId },
    });
    return response.data;
  },

  /**
   * Pause subscription
   * @param {string} tenantId - The tenant ID
   * @returns {Promise} Pause result
   */
  async pauseSubscription(tenantId) {
    const response = await api.post(
      "/api/v1/subscriptions/pause",
      {},
      { headers: { "X-Tenant-ID": tenantId } },
    );
    return response.data;
  },

  /**
   * Resume subscription
   * @param {string} tenantId - The tenant ID
   * @returns {Promise} Resume result
   */
  async resumeSubscription(tenantId) {
    const response = await api.post(
      "/api/v1/subscriptions/resume",
      {},
      { headers: { "X-Tenant-ID": tenantId } },
    );
    return response.data;
  },

  /**
   * Get subscription history
   * @param {string} tenantId - The tenant ID
   * @returns {Promise} Subscription history
   */
  async getHistory(tenantId) {
    const response = await api.get("/api/v1/subscriptions/history", {
      headers: { "X-Tenant-ID": tenantId },
    });
    return response.data;
  },
};
