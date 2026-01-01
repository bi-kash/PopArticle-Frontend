import api from "./api";

export const commentService = {
  // Get all comments for an article
  async getArticleComments(articleId, params = {}) {
    const config = { params };
    const response = await api.get(
      `/api/v1/comments/article/${articleId}`,
      config
    );
    return response.data;
  },

  // Create a new comment
  async createComment(data) {
    const response = await api.post("/api/v1/comments/", data);
    return response.data;
  },

  // Get a single comment
  async getComment(commentId) {
    const response = await api.get(`/api/v1/comments/${commentId}`);
    return response.data;
  },

  // Update a comment
  async updateComment(commentId, data) {
    const response = await api.put(`/api/v1/comments/${commentId}`, data);
    return response.data;
  },

  // Delete a comment
  async deleteComment(commentId) {
    const response = await api.delete(`/api/v1/comments/${commentId}`);
    return response.data;
  },

  // Get user's comments
  async getUserComments(userId, params = {}) {
    const config = { params };
    const response = await api.get(`/api/v1/comments/user/${userId}`, config);
    return response.data;
  },

  // Moderate a comment (admin only)
  async moderateComment(commentId, isApproved) {
    const response = await api.put(`/api/v1/comments/${commentId}/moderate`, {
      is_approved: isApproved,
    });
    return response.data;
  },
};
