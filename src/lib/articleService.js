import api from "./api";

export const articleService = {
  // Generate article with AI
  async generateArticle(data) {
    const response = await api.post("/api/v1/articles/generate", data);
    return response.data;
  },

  // Get all articles
  async getArticles(params = {}) {
    const response = await api.get("/api/v1/articles", { params });
    return response.data;
  },

  // Get single article
  async getArticle(id) {
    const response = await api.get(`/api/v1/articles/${id}`);
    return response.data;
  },

  // Create article
  async createArticle(data) {
    const response = await api.post("/api/v1/articles", data);
    return response.data;
  },

  // Update article
  async updateArticle(id, data) {
    const response = await api.put(`/api/v1/articles/${id}`, data);
    return response.data;
  },

  // Delete article
  async deleteArticle(id) {
    const response = await api.delete(`/api/v1/articles/${id}`);
    return response.data;
  },

  // Search articles
  async searchArticles(query, limit = 10) {
    const response = await api.get("/api/v1/articles/search", {
      params: { q: query, limit },
    });
    return response.data;
  },

  // Publish article
  async publishArticle(id) {
    const response = await api.post(`/api/v1/articles/${id}/publish`);
    return response.data;
  },
};
