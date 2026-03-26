import React, { useState, useEffect } from "react";
import { profileService } from "../lib/profileService";
import Cookies from "js-cookie";
import {
  Camera,
  Trash2,
  User,
  Mail,
  AtSign,
  Shield,
  Save,
  CheckCircle2,
} from "lucide-react";

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
      if (
        formData.profile_image !== user.profile_image &&
        formData.profile_image.startsWith("http")
      ) {
        updateData.profile_image = formData.profile_image;
      }

      if (Object.keys(updateData).length === 0) {
        setMessage({ type: "info", text: "No changes to save" });
        setSaving(false);
        return;
      }

      const response = await profileService.updateProfile(updateData);
      setUser(response.user);
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
      await fetchUserProfile();
      setMessage({ type: "success", text: "Profile image uploaded!" });
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
      setMessage({ type: "success", text: "Profile image removed." });
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
        }}
      >
        <div className="spinner" />
      </div>
    );
  }

  const labelStyle = {
    display: "block",
    fontSize: "0.8375rem",
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: "0.375rem",
  };

  const statusColors = {
    success: { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
    error: { bg: "#fef2f2", border: "#fecaca", text: "#dc2626" },
    info: { bg: "#eff6ff", border: "#bfdbfe", text: "#2563eb" },
  };

  const INFO_ITEMS = [
    { label: "Role", value: user?.role || "N/A" },
    { label: "OAuth provider", value: user?.oauth_provider || "None" },
    {
      label: "Verified",
      value: user?.is_verified ? "Yes" : "No",
      color: user?.is_verified ? "#22c55e" : "#ef4444",
    },
    {
      label: "Platform admin",
      value: user?.is_platform_admin ? "Yes" : "No",
      color: user?.is_platform_admin ? "#22c55e" : undefined,
    },
  ];

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: "0.25rem",
          }}
        >
          Profile
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Manage your personal information and account settings.
        </p>
      </div>

      {/* Status message */}
      {message.text && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            padding: "0.75rem 1rem",
            borderRadius: "0.625rem",
            marginBottom: "1.5rem",
            background: statusColors[message.type]?.bg,
            border: `1px solid ${statusColors[message.type]?.border}`,
            color: statusColors[message.type]?.text,
            fontSize: "0.875rem",
          }}
        >
          {message.type === "success" && <CheckCircle2 size={15} />}
          {message.text}
        </div>
      )}

      {/* Avatar card */}
      <div
        style={{
          background: "white",
          borderRadius: "1rem",
          border: "1px solid var(--border-color)",
          padding: "1.75rem",
          marginBottom: "1.25rem",
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            marginBottom: "1.25rem",
            color: "var(--text-primary)",
          }}
        >
          Profile photo
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              overflow: "hidden",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: "3px solid white",
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            }}
          >
            {formData.profile_image ? (
              <img
                src={formData.profile_image}
                alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <User size={36} color="white" />
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
            }}
          >
            <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
              <label
                htmlFor="profileImage"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.5rem 1rem",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white",
                  borderRadius: "0.5rem",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: uploading ? "not-allowed" : "pointer",
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                <Camera size={14} />
                {uploading ? "Uploading…" : "Upload photo"}
              </label>
              <input
                type="file"
                id="profileImage"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                disabled={uploading}
              />
              {formData.profile_image && (
                <button
                  onClick={handleRemoveImage}
                  disabled={uploading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.5rem 1rem",
                    background: "white",
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                    borderRadius: "0.5rem",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: uploading ? 0.5 : 1,
                  }}
                >
                  <Trash2 size={13} /> Remove
                </button>
              )}
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              Max 5 MB · JPG, PNG, GIF, or WebP
            </p>
          </div>
        </div>
      </div>

      {/* Details card */}
      <div
        style={{
          background: "white",
          borderRadius: "1rem",
          border: "1px solid var(--border-color)",
          padding: "1.75rem",
          marginBottom: "1.25rem",
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            marginBottom: "1.25rem",
            color: "var(--text-primary)",
          }}
        >
          Personal information
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Email (read-only) */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Email address</label>
            <div style={{ position: "relative" }}>
              <Mail
                size={14}
                style={{
                  position: "absolute",
                  left: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-secondary)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="input"
                style={{
                  paddingLeft: "2.5rem",
                  background: "var(--surface)",
                  cursor: "not-allowed",
                  opacity: 0.7,
                }}
              />
            </div>
            <p
              style={{
                fontSize: "0.7rem",
                color: "var(--text-secondary)",
                marginTop: "0.25rem",
              }}
            >
              Email cannot be changed
            </p>
          </div>

          {/* Full name */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="full_name" style={labelStyle}>
              Full name
            </label>
            <div style={{ position: "relative" }}>
              <User
                size={14}
                style={{
                  position: "absolute",
                  left: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-secondary)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                id="full_name"
                name="full_name"
                className="input"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Your full name"
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>
          </div>

          {/* Username */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="username" style={labelStyle}>
              Username
            </label>
            <div style={{ position: "relative" }}>
              <AtSign
                size={14}
                style={{
                  position: "absolute",
                  left: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-secondary)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                id="username"
                name="username"
                className="input"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="username"
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>
          </div>

          {/* Image URL */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="profile_image" style={labelStyle}>
              Profile image URL{" "}
              <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}>
                (optional)
              </span>
            </label>
            <input
              type="url"
              id="profile_image"
              name="profile_image"
              className="input"
              value={formData.profile_image}
              onChange={handleInputChange}
              placeholder="https://example.com/photo.jpg"
            />
            <p
              style={{
                fontSize: "0.7rem",
                color: "var(--text-secondary)",
                marginTop: "0.25rem",
              }}
            >
              Or use the upload button above
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: saving
                ? "#a5b4fc"
                : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              border: "none",
              borderRadius: "0.5625rem",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow: saving ? "none" : "0 4px 14px rgba(99,102,241,0.3)",
              transition: "all 0.2s",
            }}
          >
            <Save size={15} />
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>

      {/* Account info card */}
      <div
        style={{
          background: "white",
          borderRadius: "1rem",
          border: "1px solid var(--border-color)",
          padding: "1.75rem",
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            marginBottom: "1rem",
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Shield size={16} /> Account details
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          {INFO_ITEMS.map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                padding: "0.875rem 1rem",
                background: "var(--surface)",
                borderRadius: "0.625rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  marginBottom: "0.25rem",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: color || "var(--text-primary)",
                  textTransform: "capitalize",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
