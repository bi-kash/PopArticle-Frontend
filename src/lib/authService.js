import api from "./api";
import Cookies from "js-cookie";

const authService = {
  // Login user
  async login(email, password) {
    const response = await api.post("/api/v1/auth/login", { email, password });
    const { access_token, refresh_token, user } = response.data;

    authService.setTokens(access_token, refresh_token, user);
    return response.data;
  },

  // Register new user
  async register(userData) {
    const response = await api.post("/api/v1/auth/register", userData);
    const { access_token, refresh_token, user } = response.data;

    authService.setTokens(access_token, refresh_token, user);
    return response.data;
  },

  // Logout
  logout() {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user");
    window.location.href = "/login";
  },

  // Set tokens
  setTokens(accessToken, refreshToken, user) {
    if (accessToken) {
      Cookies.set("access_token", accessToken, { expires: 7 });
    }
    if (refreshToken) {
      Cookies.set("refresh_token", refreshToken, { expires: 30 });
    }
    if (user) {
      Cookies.set("user", JSON.stringify(user), { expires: 30 });
    }
  },

  // Get access token
  getAccessToken() {
    return Cookies.get("access_token");
  },

  // Get refresh token
  getRefreshToken() {
    return Cookies.get("refresh_token");
  },

  // Get current user
  getCurrentUser() {
    const userCookie = Cookies.get("user");
    return userCookie ? JSON.parse(userCookie) : null;
  },

  // Fetch current user from API
  async fetchCurrentUser() {
    try {
      const response = await api.get("/api/v1/auth/me");
      const data = response.data;
      // API returns { user: {...} } - extract the user object
      const user = data.user || data;
      // Store user in cookies
      if (user) {
        Cookies.set("user", JSON.stringify(user), { expires: 30 });
      }
      return user;
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!authService.getAccessToken();
  },

  // Refresh token
  async refreshToken() {
    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await api.post("/auth/refresh", {
      refresh_token: refreshToken,
    });
    const { access_token } = response.data;

    authService.setTokens(access_token, refreshToken);
    return access_token;
  },

  // List user API keys
  async getApiKeys() {
    const response = await api.get("/api/v1/auth/api-keys");
    return response.data;
  },

  // Create a new API key
  async createApiKey(name) {
    const response = await api.post("/api/v1/auth/api-keys", { name });
    return response.data;
  },

  // Delete an API key
  async deleteApiKey(keyId) {
    const response = await api.delete(`/api/v1/auth/api-keys/${keyId}`);
    return response.data;
  },
};

export default authService;
export { authService };
