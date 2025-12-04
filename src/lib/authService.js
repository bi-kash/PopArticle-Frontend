import api from "./api";
import Cookies from "js-cookie";

export const authService = {
  // Register new user
  async register(data) {
    const response = await api.post("/api/v1/auth/register", data);
    if (response.data.access_token) {
      this.setTokens(response.data);
    }
    return response.data;
  },

  // Login user
  async login(email, password) {
    const response = await api.post("/api/v1/auth/login", { email, password });
    if (response.data.access_token) {
      this.setTokens(response.data);
    }
    return response.data;
  },

  // Get current user
  async getCurrentUser() {
    const response = await api.get("/api/v1/auth/me");
    return response.data;
  },

  // Refresh token
  async refreshToken() {
    const refreshToken = Cookies.get("refresh_token");
    const response = await api.post("/api/v1/auth/refresh", {
      refresh_token: refreshToken,
    });
    Cookies.set("access_token", response.data.access_token, { expires: 1 });
    return response.data;
  },

  // Logout
  logout() {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user");
  },

  // Set tokens
  setTokens(data) {
    Cookies.set("access_token", data.access_token, { expires: 1 });
    Cookies.set("refresh_token", data.refresh_token, { expires: 7 });
    if (data.user) {
      Cookies.set("user", JSON.stringify(data.user), { expires: 7 });
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!Cookies.get("access_token");
  },

  // Get stored user
  getUser() {
    const user = Cookies.get("user");
    return user ? JSON.parse(user) : null;
  },
};
