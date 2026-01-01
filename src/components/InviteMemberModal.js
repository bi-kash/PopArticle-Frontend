import { useState } from "react";
import { inviteMember } from "@/lib/invitationService";
import { Mail, Users, Shield, Crown, Send, X, CheckCircle } from "lucide-react";

export default function InviteMemberModal({
  tenantId,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await inviteMember(tenantId, { email, role });
      setEmail("");
      setRole("editor");
      onSuccess(result);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const roles = [
    {
      value: "editor",
      label: "Editor",
      icon: <Users size={20} />,
      description: "Can create and edit content",
      color: "#3b82f6",
    },
    {
      value: "admin",
      label: "Admin",
      icon: <Shield size={20} />,
      description: "Can manage content and settings",
      color: "#8b5cf6",
    },
    {
      value: "owner",
      label: "Owner",
      icon: <Crown size={20} />,
      description: "Full access to all features",
      color: "#f59e0b",
    },
  ];

  const selectedRole = roles.find((r) => r.value === role);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{ backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          animation: "slideIn 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div
          className="relative p-6 pb-4"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            style={{ cursor: "pointer" }}
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 text-white">
            <div
              className="p-3 rounded-xl"
              style={{ background: "rgba(255, 255, 255, 0.2)" }}
            >
              <Mail size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Invite Team Member</h2>
              <p className="text-white text-opacity-90 text-sm mt-1">
                Add someone to collaborate on your workspace
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div
              className="mb-4 p-4 rounded-lg flex items-start gap-3"
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
              }}
            >
              <div className="flex-1">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-semibold mb-2"
                style={{ color: "#1f2937" }}
              >
                Email Address
              </label>
              <div className="relative">
                <div
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: "#9ca3af" }}
                >
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg transition-all"
                  style={{
                    borderColor: "#e5e7eb",
                    fontSize: "15px",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  placeholder="member@example.com"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <label
                htmlFor="role"
                className="block text-sm font-semibold mb-3"
                style={{ color: "#1f2937" }}
              >
                Select Role
              </label>
              <div className="space-y-2">
                {roles.map((roleOption) => (
                  <div
                    key={roleOption.value}
                    onClick={() => setRole(roleOption.value)}
                    className="relative p-4 rounded-lg cursor-pointer transition-all"
                    style={{
                      border: `2px solid ${
                        role === roleOption.value ? roleOption.color : "#e5e7eb"
                      }`,
                      background:
                        role === roleOption.value
                          ? `${roleOption.color}10`
                          : "white",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{
                          background:
                            role === roleOption.value
                              ? roleOption.color
                              : "#f3f4f6",
                          color:
                            role === roleOption.value ? "white" : "#6b7280",
                        }}
                      >
                        {roleOption.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4
                            className="font-semibold"
                            style={{
                              color:
                                role === roleOption.value
                                  ? roleOption.color
                                  : "#1f2937",
                            }}
                          >
                            {roleOption.label}
                          </h4>
                          {role === roleOption.value && (
                            <CheckCircle
                              size={20}
                              style={{ color: roleOption.color }}
                            />
                          )}
                        </div>
                        <p
                          className="text-sm mt-1"
                          style={{ color: "#6b7280" }}
                        >
                          {roleOption.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-all"
                style={{
                  background: "#f3f4f6",
                  color: "#374151",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#e5e7eb")}
                onMouseLeave={(e) => (e.target.style.background = "#f3f4f6")}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  opacity: loading ? 0.7 : 1,
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div
                      className="animate-spin"
                      style={{
                        width: "18px",
                        height: "18px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "white",
                        borderRadius: "50%",
                      }}
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
