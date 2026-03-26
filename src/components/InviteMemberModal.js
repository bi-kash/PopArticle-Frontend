import { useState } from "react";
import { inviteMember } from "@/lib/invitationService";
import { Mail, Users, Shield, Crown, Send, X, AlertCircle } from "lucide-react";

const ROLES = [
  {
    value: "editor",
    label: "Editor",
    icon: Users,
    description: "Can create and edit content",
    accent: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  {
    value: "admin",
    label: "Admin",
    icon: Shield,
    description: "Can manage content and settings",
    accent: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  {
    value: "owner",
    label: "Owner",
    icon: Crown,
    description: "Full access to all features",
    accent: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
  },
];

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
  const [emailFocused, setEmailFocused] = useState(false);

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

  const selectedRole = ROLES.find((r) => r.value === role);

  return (
    <>
      <style>{`
        @keyframes inv-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes inv-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        .inv-overlay {
          position: fixed; inset: 0; z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(6px);
          animation: inv-fade-in 0.18s ease;
        }
        .inv-modal {
          background: var(--background);
          border: 1px solid var(--border-color);
          border-radius: 1.25rem;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 24px 48px -8px rgba(15, 23, 42, 0.18), 0 8px 16px -4px rgba(15, 23, 42, 0.08);
          animation: inv-slide-up 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .inv-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1.5rem 1.5rem 0;
        }
        .inv-icon-wrap {
          width: 44px; height: 44px; border-radius: 0.75rem;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .inv-close {
          width: 32px; height: 32px; border-radius: 0.5rem;
          display: flex; align-items: center; justify-content: center;
          background: none; border: 1px solid var(--border-color);
          color: var(--text-secondary); cursor: pointer;
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .inv-close:hover { background: var(--surface); color: var(--text-primary); }
        .inv-body { padding: 1.25rem 1.5rem 1.5rem; }
        .inv-title { font-size: 1.125rem; font-weight: 700; color: var(--text-primary); margin: 0.75rem 0 0.25rem; }
        .inv-subtitle { font-size: 0.8125rem; color: var(--text-secondary); margin: 0; }
        .inv-divider { height: 1px; background: var(--border-color); margin: 1.25rem 0; }
        .inv-label {
          display: block; font-size: 0.8125rem; font-weight: 600;
          color: var(--text-primary); margin-bottom: 0.5rem;
        }
        .inv-input-wrap { position: relative; }
        .inv-input-icon {
          position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%);
          color: var(--text-secondary); pointer-events: none;
          display: flex; align-items: center;
        }
        .inv-input {
          width: 100%; padding: 0.75rem 0.875rem 0.75rem 2.5rem;
          border: 1.5px solid var(--border-color);
          border-radius: 0.625rem;
          background: var(--background);
          color: var(--text-primary);
          font-size: 0.9375rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .inv-input::placeholder { color: var(--text-secondary); opacity: 0.7; }
        .inv-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }
        .inv-roles { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem; }
        .inv-role {
          display: flex; align-items: center; gap: 0.875rem;
          padding: 0.875rem 1rem;
          border-radius: 0.75rem;
          border: 1.5px solid var(--border-color);
          background: var(--background);
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          text-align: left;
          width: 100%;
        }
        .inv-role:hover { border-color: #93c5fd; background: #f8faff; }
        .inv-role-icon {
          width: 36px; height: 36px; border-radius: 0.5rem; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: var(--surface);
          color: var(--text-secondary);
          transition: background 0.15s, color 0.15s;
        }
        .inv-role-name { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
        .inv-role-desc { font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.1rem; }
        .inv-radio {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid var(--border-color);
          margin-left: auto; flex-shrink: 0;
          transition: border-color 0.15s, background 0.15s;
          display: flex; align-items: center; justify-content: center;
        }
        .inv-radio-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: white;
        }
        .inv-error {
          display: flex; align-items: flex-start; gap: 0.625rem;
          padding: 0.75rem 1rem;
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 0.625rem; color: #991b1b;
          font-size: 0.8125rem;
          margin-bottom: 1rem;
        }
        .inv-actions { display: flex; gap: 0.75rem; margin-top: 1.25rem; }
        .inv-btn-cancel {
          flex: 1; padding: 0.75rem 1rem;
          border: 1.5px solid var(--border-color);
          background: var(--background);
          color: var(--text-primary);
          border-radius: 0.75rem; font-size: 0.875rem; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
        }
        .inv-btn-cancel:hover { background: var(--surface); }
        .inv-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
        .inv-btn-send {
          flex: 1.6; padding: 0.75rem 1rem;
          background: #2563eb; color: white;
          border: none; border-radius: 0.75rem;
          font-size: 0.875rem; font-weight: 600;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: background 0.15s, opacity 0.15s;
        }
        .inv-btn-send:hover:not(:disabled) { background: #1d4ed8; }
        .inv-btn-send:disabled { opacity: 0.6; cursor: not-allowed; }
        .inv-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: white;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        className="inv-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="inv-modal">
          {/* Header */}
          <div className="inv-header">
            <div className="inv-icon-wrap">
              <Mail size={20} color="#2563eb" />
            </div>
            <button className="inv-close" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          <div className="inv-body">
            <h2 className="inv-title">Invite a team member</h2>
            <p className="inv-subtitle">
              They&apos;ll receive an email with a link to join your workspace.
            </p>

            <div className="inv-divider" />

            {error && (
              <div className="inv-error">
                <AlertCircle
                  size={15}
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label htmlFor="inv-email" className="inv-label">
                  Email address
                </label>
                <div className="inv-input-wrap">
                  <span className="inv-input-icon">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    id="inv-email"
                    className="inv-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teammate@example.com"
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Role */}
              <div style={{ marginTop: "1.25rem" }}>
                <label className="inv-label">Role</label>
                <div className="inv-roles">
                  {ROLES.map((r) => {
                    const active = role === r.value;
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        className="inv-role"
                        onClick={() => setRole(r.value)}
                        style={
                          active
                            ? {
                                borderColor: r.accent,
                                background: r.bg,
                              }
                            : {}
                        }
                      >
                        <div
                          className="inv-role-icon"
                          style={
                            active
                              ? { background: r.accent, color: "#fff" }
                              : {}
                          }
                        >
                          <Icon size={16} />
                        </div>
                        <div>
                          <div
                            className="inv-role-name"
                            style={active ? { color: r.accent } : {}}
                          >
                            {r.label}
                          </div>
                          <div className="inv-role-desc">{r.description}</div>
                        </div>
                        <div
                          className="inv-radio"
                          style={
                            active
                              ? { borderColor: r.accent, background: r.accent }
                              : {}
                          }
                        >
                          {active && <div className="inv-radio-dot" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="inv-actions">
                <button
                  type="button"
                  className="inv-btn-cancel"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inv-btn-send"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="inv-spinner" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
