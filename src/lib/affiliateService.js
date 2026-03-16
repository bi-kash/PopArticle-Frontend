import api from "./api";

export const affiliateService = {
  /**
   * List all affiliate links for the current user
   * @param {object} params - Optional filters: status, limit, offset, include_clicks
   */
  async getLinks(params = {}) {
    const response = await api.get("/api/v1/affiliate-links/", { params });
    return response.data;
  },

  /**
   * Get a single affiliate link by ID
   * @param {number} id - Affiliate link ID
   * @param {boolean} includeClicks - Include click count
   */
  async getLink(id, includeClicks = false) {
    const response = await api.get(`/api/v1/affiliate-links/${id}`, {
      params: includeClicks ? { include_clicks: true } : {},
    });
    return response.data;
  },

  /**
   * Create a new affiliate link
   * @param {object} data - product_name, affiliate_link, affiliate_service, image_url,
   *                        notes, price, currency, product_url, tags, html_snippet
   */
  async createLink(data) {
    const response = await api.post("/api/v1/affiliate-links/", data);
    return response.data;
  },

  /**
   * Update an existing affiliate link
   * @param {number} id - Affiliate link ID
   * @param {object} data - Fields to update (all optional)
   */
  async updateLink(id, data) {
    const response = await api.put(`/api/v1/affiliate-links/${id}`, data);
    return response.data;
  },

  /**
   * Delete an affiliate link
   * @param {number} id - Affiliate link ID
   */
  async deleteLink(id) {
    const response = await api.delete(`/api/v1/affiliate-links/${id}`);
    return response.data;
  },

  /**
   * Get click analytics for an affiliate link
   * @param {number} id - Affiliate link ID
   * @param {string} tenantId - Optional: filter clicks by tenant UUID
   */
  async getClicks(id, tenantId = null) {
    const params = tenantId ? { tenant_id: tenantId } : {};
    const response = await api.get(`/api/v1/affiliate-links/${id}/clicks`, {
      params,
    });
    return response.data;
  },

  /**
   * Parse an HTML snippet to extract affiliate_link and image_url without saving
   * @param {string} htmlSnippet - HTML snippet string
   */
  async parseHtml(htmlSnippet) {
    const response = await api.post("/api/v1/affiliate-links/parse-html", {
      html_snippet: htmlSnippet,
    });
    return response.data;
  },
};
