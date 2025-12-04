import api from "./api";

export const categoryService = {
  // Get all categories
  async getCategories() {
    const response = await api.get("/api/v1/categories");
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

  // Delete category
  async deleteCategory(id) {
    const response = await api.delete(`/api/v1/categories/${id}`);
    return response.data;
  },
};
