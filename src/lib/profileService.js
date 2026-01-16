import api from "./api";

export const profileService = {
  // Update user profile (username, full_name, profile_image URL)
  async updateProfile(data) {
    const response = await api.patch("/api/v1/auth/profile", data);
    return response.data;
  },

  // Upload profile image file
  async uploadProfileImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/api/v1/auth/profile/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Update profile image from URL
  async updateProfileImageFromUrl(imageUrl) {
    const response = await api.post("/api/v1/auth/profile/image", {
      image_url: imageUrl,
    });
    return response.data;
  },

  // Remove profile image
  async removeProfileImage() {
    const response = await api.delete("/api/v1/auth/profile/image");
    return response.data;
  },

  // Get current user profile
  async getCurrentUser() {
    const response = await api.get("/api/v1/auth/me");
    return response.data;
  },
};

export default profileService;
