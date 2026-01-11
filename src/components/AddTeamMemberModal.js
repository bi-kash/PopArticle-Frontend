import { useState, useEffect } from "react";
import { teamService } from "@/lib/teamService";
import {
  Users,
  X,
  Mail,
  Phone,
  Briefcase,
  User,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  Plus,
  Trash2,
} from "lucide-react";

export default function AddTeamMemberModal({
  tenantId,
  isOpen,
  onClose,
  onSuccess,
  editMember = null,
}) {
  const [formData, setFormData] = useState({
    full_name: "",
    role: "",
    position: "",
    email: "",
    phone: "",
    profile_photo: "",
    bio: "",
    social_links: [],
    display_order: 0,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newSocialLink, setNewSocialLink] = useState({
    platform: "",
    handle: "",
    url: "",
  });

  // Update form data when editMember changes
  useEffect(() => {
    if (editMember) {
      setFormData({
        full_name: editMember.full_name || "",
        role: editMember.role || "",
        position: editMember.position || "",
        email: editMember.email || "",
        phone: editMember.phone || "",
        profile_photo: editMember.profile_photo || "",
        bio: editMember.bio || "",
        social_links: editMember.social_links || [],
        display_order: editMember.display_order || 0,
        is_active:
          editMember.is_active !== undefined ? editMember.is_active : true,
      });
    } else {
      // Reset form for new member
      setFormData({
        full_name: "",
        role: "",
        position: "",
        email: "",
        phone: "",
        profile_photo: "",
        bio: "",
        social_links: [],
        display_order: 0,
        is_active: true,
      });
    }
    setError(null);
  }, [editMember, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSend = { ...formData };
      // Remove empty fields
      Object.keys(dataToSend).forEach((key) => {
        if (
          dataToSend[key] === "" ||
          (Array.isArray(dataToSend[key]) && dataToSend[key].length === 0)
        ) {
          delete dataToSend[key];
        }
      });

      let result;
      if (editMember) {
        result = await teamService.updateTeamMember(
          tenantId,
          editMember.id,
          dataToSend
        );
      } else {
        result = await teamService.createTeamMember(tenantId, dataToSend);
      }

      onSuccess(result);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to save team member"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addSocialLink = () => {
    if (newSocialLink.platform && newSocialLink.url) {
      setFormData((prev) => ({
        ...prev,
        social_links: [...prev.social_links, { ...newSocialLink }],
      }));
      setNewSocialLink({ platform: "", handle: "", url: "" });
    }
  };

  const removeSocialLink = (index) => {
    setFormData((prev) => ({
      ...prev,
      social_links: prev.social_links.filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) return null;

  const socialPlatforms = [
    "linkedin",
    "twitter",
    "facebook",
    "instagram",
    "github",
    "youtube",
    "other",
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{ backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 p-6 pb-4"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 text-white">
            <div
              className="p-3 rounded-xl"
              style={{ background: "rgba(255, 255, 255, 0.2)" }}
            >
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {editMember ? "Edit Team Member" : "Add Team Member"}
              </h2>
              <p className="text-white text-opacity-90 text-sm mt-1">
                {editMember
                  ? "Update team member information"
                  : "Add someone to your team (no account required)"}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div
              className="mb-4 p-4 rounded-lg"
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User size={18} />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg"
                    style={{ borderColor: "#e5e7eb" }}
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg"
                    style={{ borderColor: "#e5e7eb" }}
                    placeholder="e.g., Secretary, Social Media Manager"
                    required
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Position
                  </label>
                  <div className="relative">
                    <Briefcase
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      size={18}
                      style={{ color: "#9ca3af" }}
                    />
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg"
                      style={{ borderColor: "#e5e7eb" }}
                      placeholder="Senior Manager"
                    />
                  </div>
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    value={formData.display_order}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg"
                    style={{ borderColor: "#e5e7eb" }}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail size={18} />
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      size={18}
                      style={{ color: "#9ca3af" }}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg"
                      style={{ borderColor: "#e5e7eb" }}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      size={18}
                      style={{ color: "#9ca3af" }}
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg"
                      style={{ borderColor: "#e5e7eb" }}
                      placeholder="+1-555-0123"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText size={18} />
                Profile Details
              </h3>

              {/* Profile Photo URL */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  Profile Photo URL
                </label>
                <div className="relative">
                  <ImageIcon
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    size={18}
                    style={{ color: "#9ca3af" }}
                  />
                  <input
                    type="url"
                    name="profile_photo"
                    value={formData.profile_photo}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg"
                    style={{ borderColor: "#e5e7eb" }}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg"
                  style={{ borderColor: "#e5e7eb" }}
                  placeholder="Brief biography..."
                  rows="4"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <LinkIcon size={18} />
                Social Links
              </h3>

              {/* Existing Social Links */}
              {formData.social_links.length > 0 && (
                <div className="mb-4 space-y-2">
                  {formData.social_links.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 rounded-lg"
                      style={{
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div className="flex-1">
                        <span className="font-semibold capitalize">
                          {link.platform}:
                        </span>{" "}
                        {link.handle && `@${link.handle} - `}
                        <span className="text-sm text-gray-600">
                          {link.url}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSocialLink(index)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Social Link */}
              <div
                className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-lg"
                style={{ background: "#f9fafb" }}
              >
                <div className="md:col-span-3">
                  <select
                    value={newSocialLink.platform}
                    onChange={(e) =>
                      setNewSocialLink((prev) => ({
                        ...prev,
                        platform: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: "#e5e7eb" }}
                  >
                    <option value="">Platform</option>
                    {socialPlatforms.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <input
                    type="text"
                    value={newSocialLink.handle}
                    onChange={(e) =>
                      setNewSocialLink((prev) => ({
                        ...prev,
                        handle: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: "#e5e7eb" }}
                    placeholder="Handle (optional)"
                  />
                </div>
                <div className="md:col-span-5">
                  <input
                    type="url"
                    value={newSocialLink.url}
                    onChange={(e) =>
                      setNewSocialLink((prev) => ({
                        ...prev,
                        url: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: "#e5e7eb" }}
                    placeholder="https://..."
                  />
                </div>
                <div className="md:col-span-1">
                  <button
                    type="button"
                    onClick={addSocialLink}
                    className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    disabled={!newSocialLink.platform || !newSocialLink.url}
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Status */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Active Member</span>
              </label>
              <p className="text-sm text-gray-500 ml-8">
                Inactive members won't be displayed publicly
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                style={{ borderColor: "#e5e7eb" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all"
                style={{
                  background: loading
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading
                  ? "Saving..."
                  : editMember
                  ? "Update Member"
                  : "Add Member"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        input:focus,
        textarea:focus,
        select:focus {
          outline: none;
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
      `}</style>
    </div>
  );
}
