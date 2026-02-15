import api from "./api";

export const subscriptionService = {
  /**
   * Get subscription status for the current user
   * @returns {Promise} Subscription status data
   */
  async getStatus() {
    const response = await api.get("/api/v1/subscriptions/status");
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
   * @param {object} data - Checkout data { plan, success_url, cancel_url }
   * @returns {Promise} Checkout session with checkout_url
   */
  async createCheckout(data) {
    const payload = {
      ...data,
      plan: data.plan?.toLowerCase().trim(),
    };
    const response = await api.post("/api/v1/subscriptions/checkout", payload);
    return response.data;
  },

  /**
   * Cancel subscription
   * @param {object} data - Cancel data { effective_from: "next_billing_period" | "immediately" }
   * @returns {Promise} Cancellation result
   */
  async cancelSubscription(data = { effective_from: "next_billing_period" }) {
    const response = await api.post("/api/v1/subscriptions/cancel", data);
    return response.data;
  },

  /**
   * Upgrade or downgrade subscription
   * @param {object} data - Upgrade data { plan, proration }
   * @returns {Promise} Upgrade result
   */
  async upgradeSubscription(data) {
    const payload = {
      ...data,
      plan: data.plan?.toLowerCase().trim(),
    };
    const response = await api.post("/api/v1/subscriptions/upgrade", payload);
    return response.data;
  },

  /**
   * Pause subscription
   * @returns {Promise} Pause result
   */
  async pauseSubscription() {
    const response = await api.post("/api/v1/subscriptions/pause", {});
    return response.data;
  },

  /**
   * Resume subscription
   * @returns {Promise} Resume result
   */
  async resumeSubscription() {
    const response = await api.post("/api/v1/subscriptions/resume", {});
    return response.data;
  },

  /**
   * Get subscription history
   * @returns {Promise} Subscription history
   */
  async getHistory() {
    const response = await api.get("/api/v1/subscriptions/history");
    return response.data;
  },
};
