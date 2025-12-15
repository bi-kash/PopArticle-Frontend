import api from "./api";

export const categoryService = {
  // Get all categories (optionally filtered by tenant)
  async getCategories(params = {}) {
    const response = await api.get("/api/v1/categories", { params });
    return response.data;
  },

  // Get single category
  async getCategory(id) {
    const response = await api.get(`/api/v1/categories/${id}`);
    return response.data;
  },

  // Create category
  async createCategory(data) {
    const response = await api.post("/api/v1/categories", data);
    return response.data;
  },

  // Update category
  async updateCategory(id, data) {
    const response = await api.put(`/api/v1/categories/${id}`, data);
    return response.data;
  },

  // Delete category with options for handling articles
  async deleteCategory(id, params = {}) {
    const response = await api.delete(`/api/v1/categories/${id}`, { params });
    return response.data;
  },
};
