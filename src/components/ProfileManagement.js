import React, { useState, useEffect } from "react";
import { profileService } from "../lib/profileService";
import Cookies from "js-cookie";

export default function ProfileManagement() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    profile_image: "",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await profileService.getCurrentUser();
      setUser(response.user);
      setFormData({
        username: response.user.username || "",
        full_name: response.user.full_name || "",
        profile_image: response.user.profile_image || "",
      });
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      setMessage({ type: "error", text: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const updateData = {};
      if (formData.username !== user.username)
        updateData.username = formData.username;
      if (formData.full_name !== user.full_name)
        updateData.full_name = formData.full_name;

      // Only update profile_image URL if it's changed and is a valid URL
      if (
        formData.profile_image !== user.profile_image &&
        formData.profile_image.startsWith("http")
      ) {
        updateData.profile_image = formData.profile_image;
      }

      if (Object.keys(updateData).length === 0) {
        setMessage({ type: "info", text: "No changes to save" });
        return;
      }

      const response = await profileService.updateProfile(updateData);
      setUser(response.user);

      // Update cookie
      Cookies.set("user", JSON.stringify(response.user), { expires: 30 });

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Invalid file type. Allowed: jpg, jpeg, png, gif, webp",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image too large. Maximum size: 5MB" });
      return;
    }

    setUploading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await profileService.uploadProfileImage(file);
      setFormData((prev) => ({
        ...prev,
        profile_image: response.profile_image,
      }));

      // Refresh user data
      await fetchUserProfile();

      setMessage({
        type: "success",
        text: "Profile image uploaded successfully!",
      });
    } catch (error) {
      console.error("Failed to upload image:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to upload image",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!confirm("Are you sure you want to remove your profile image?")) return;

    setUploading(true);
    setMessage({ type: "", text: "" });

    try {
      await profileService.removeProfileImage();
      setFormData((prev) => ({ ...prev, profile_image: "" }));
      await fetchUserProfile();
      setMessage({
        type: "success",
        text: "Profile image removed successfully!",
      });
    } catch (error) {
      console.error("Failed to remove image:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to remove image",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Profile Management</h1>

      {message.text && (
        <div
          className={`mb-4 p-4 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : message.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Profile Image Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Profile Image</h2>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {formData.profile_image ? (
                <img
                  src={formData.profile_image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div>
              <input
                type="file"
                id="profileImage"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="profileImage"
                className={`inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {uploading ? "Uploading..." : "Upload Image"}
              </label>
              {formData.profile_image && (
                <button
                  onClick={handleRemoveImage}
                  disabled={uploading}
                  className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Remove
                </button>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Max size: 5MB. Formats: JPG, PNG, GIF, WebP
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image URL (Optional)
              </label>
              <input
                type="url"
                name="profile_image"
                value={formData.profile_image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Or upload an image using the button above
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>

        {/* Account Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-3">Account Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Role:</span>
              <span className="ml-2 font-medium">{user?.role || "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-600">OAuth Provider:</span>
              <span className="ml-2 font-medium">
                {user?.oauth_provider || "None"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Verified:</span>
              <span className="ml-2 font-medium">
                {user?.is_verified ? "Yes" : "No"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Platform Admin:</span>
              <span className="ml-2 font-medium">
                {user?.is_platform_admin ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
