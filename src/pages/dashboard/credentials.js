import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { authService } from "@/lib/authService";
import {
  Key,
  Copy,
  Check,
  Plus,
  Trash2,
  Shield,
  AlertTriangle,
  User,
} from "lucide-react";

export default function UserCredentialsPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyFull, setNewKeyFull] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(authService.getCurrentUser());
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const data = await authService.getApiKeys();
      setApiKeys(data.api_keys || []);
    } catch (error) {
      console.error("Failed to load API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (value, field) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const data = await authService.createApiKey(newKeyName.trim());
      setNewKeyFull({
        key: data.api_key,
        name: data.name || newKeyName.trim(),
        prefix: data.prefix,
      });
      setNewKeyName("");
      setShowCreateForm(false);
      await loadApiKeys();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (keyId) => {
    if (!confirm("Delete this API key? It will stop working immediately."))
      return;
    try {
      await authService.deleteApiKey(keyId);
      setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete API key");
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "0.875rem",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Key size={26} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>
                API Credentials
              </h1>
              <p
                style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
              >
                Manage API keys for programmatic access to{" "}
                {process.env.NEXT_PUBLIC_APP_NAME}.
              </p>
            </div>
          </div>

          {/* Security Warning */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              padding: "1rem 1.25rem",
              marginBottom: "1.5rem",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "0.75rem",
            }}
          >
            <AlertTriangle
              size={20}
              style={{ color: "#d97706", flexShrink: 0, marginTop: "0.1rem" }}
            />
            <div>
              <p
                style={{
                  fontWeight: 600,
                  color: "#92400e",
                  fontSize: "0.875rem",
                  marginBottom: "0.25rem",
                }}
              >
                Keep your credentials safe
              </p>
              <p
                style={{
                  color: "#a16207",
                  fontSize: "0.8125rem",
                  lineHeight: 1.5,
                }}
              >
                Never share API keys publicly or commit them to source control.
                Each full key is only shown once at creation — save it
                immediately.
              </p>
            </div>
          </div>

          {/* One-time new key reveal */}
          {newKeyFull && (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "0.75rem",
                padding: "1.25rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <Check size={18} style={{ color: "#16a34a" }} />
                <p
                  style={{
                    fontWeight: 700,
                    color: "#15803d",
                    fontSize: "0.9375rem",
                  }}
                >
                  Key &quot;{newKeyFull.name}&quot; created — save it now!
                </p>
              </div>
              <p
                style={{
                  color: "#166534",
                  fontSize: "0.8125rem",
                  marginBottom: "0.75rem",
                }}
              >
                This is the only time the full key will be shown. Copy it and
                store it securely.
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  background: "white",
                  border: "1px solid #bbf7d0",
                  borderRadius: "0.5rem",
                  padding: "0.75rem 1rem",
                }}
              >
                <code
                  style={{
                    flex: 1,
                    fontFamily: "monospace",
                    fontSize: "0.8125rem",
                    wordBreak: "break-all",
                    color: "#15803d",
                  }}
                >
                  {newKeyFull.key}
                </code>
                <button
                  onClick={() => handleCopy(newKeyFull.key, "new_key")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.45rem 0.875rem",
                    flexShrink: 0,
                    background:
                      copiedField === "new_key" ? "#dcfce7" : "#16a34a",
                    color: copiedField === "new_key" ? "#166534" : "white",
                    border: "none",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    transition: "all 0.15s",
                  }}
                >
                  {copiedField === "new_key" ? (
                    <>
                      <Check size={14} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy
                    </>
                  )}
                </button>
              </div>
              <button
                onClick={() => setNewKeyFull(null)}
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.8125rem",
                  color: "#16a34a",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                I&apos;ve saved it, dismiss
              </button>
            </div>
          )}

          {/* User Account Info */}
          {user?.id && (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-color)",
                borderRadius: "1rem",
                overflow: "hidden",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  padding: "0.875rem 1.25rem",
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <User size={16} style={{ color: "#6366f1" }} />
                <h2 style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                  Account Info
                </h2>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.875rem 1.25rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    User ID
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.875rem",
                      marginTop: "0.25rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    {user.id}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(String(user.id), "user_id")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.4rem 0.75rem",
                    background:
                      copiedField === "user_id"
                        ? "#d1fae5"
                        : "var(--background, #f3f4f6)",
                    color:
                      copiedField === "user_id"
                        ? "#065f46"
                        : "var(--text-secondary)",
                    border: `1px solid ${copiedField === "user_id" ? "#6ee7b7" : "var(--border-color)"}`,
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    transition: "all 0.15s",
                  }}
                >
                  {copiedField === "user_id" ? (
                    <>
                      <Check size={14} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* API Keys Card */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-color)",
              borderRadius: "1rem",
              overflow: "hidden",
            }}
          >
            {/* Card header */}
            <div
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Shield size={16} style={{ color: "#6366f1" }} />
                <h2 style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                  API Keys
                </h2>
                {!loading && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      padding: "0.1rem 0.5rem",
                      background: "#ede9fe",
                      color: "#7c3aed",
                      borderRadius: "9999px",
                    }}
                  >
                    {apiKeys.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowCreateForm((v) => !v)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.45rem 0.875rem",
                  background: showCreateForm
                    ? "var(--surface)"
                    : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: showCreateForm ? "var(--text-secondary)" : "white",
                  border: showCreateForm
                    ? "1px solid var(--border-color)"
                    : "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                }}
              >
                <Plus size={14} />
                {showCreateForm ? "Cancel" : "Add Key"}
              </button>
            </div>

            {/* Create form */}
            {showCreateForm && (
              <div
                style={{
                  padding: "1rem 1.25rem",
                  background: "#faf5ff",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <form
                  onSubmit={handleCreate}
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Key name (e.g. Production, Development)"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    required
                    maxLength={80}
                    style={{
                      flex: 1,
                      minWidth: "200px",
                      padding: "0.5rem 0.875rem",
                      border: "1px solid #d8b4fe",
                      borderRadius: "0.5rem",
                      outline: "none",
                      fontSize: "0.875rem",
                      background: "white",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={creating || !newKeyName.trim()}
                    style={{
                      padding: "0.5rem 1rem",
                      background:
                        creating || !newKeyName.trim() ? "#a5b4fc" : "#6366f1",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      cursor:
                        creating || !newKeyName.trim()
                          ? "not-allowed"
                          : "pointer",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    {creating ? "Creating…" : "Create Key"}
                  </button>
                </form>
              </div>
            )}

            {/* Keys list */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <div className="spinner" style={{ margin: "0 auto" }} />
                <p
                  style={{ marginTop: "1rem", color: "var(--text-secondary)" }}
                >
                  Loading keys…
                </p>
              </div>
            ) : apiKeys.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "var(--text-secondary)",
                }}
              >
                <Key
                  size={36}
                  style={{
                    margin: "0 auto 0.75rem",
                    opacity: 0.4,
                    display: "block",
                  }}
                />
                <p
                  style={{
                    marginBottom: "0.5rem",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                  }}
                >
                  No API keys yet
                </p>
                <p style={{ fontSize: "0.8125rem" }}>
                  Click &quot;Add Key&quot; above to create your first API key.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--border-color)",
                        background: "#fafafa",
                      }}
                    >
                      {[
                        "Name",
                        "Prefix",
                        "Status",
                        "Created",
                        "Last Used",
                        "Requests",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "0.75rem 1rem",
                            textAlign: h === "" ? "right" : "left",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "var(--text-secondary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((key) => (
                      <tr
                        key={key.id}
                        style={{
                          borderBottom: "1px solid var(--border-color)",
                        }}
                      >
                        <td
                          style={{
                            padding: "0.875rem 1rem",
                            fontWeight: 600,
                            fontSize: "0.9375rem",
                          }}
                        >
                          {key.name}
                        </td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <code
                            style={{
                              fontFamily: "monospace",
                              fontSize: "0.8125rem",
                              background: "#f3f4f6",
                              padding: "0.15rem 0.5rem",
                              borderRadius: "0.25rem",
                              color: "#374151",
                            }}
                          >
                            {key.prefix}
                          </code>
                        </td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "0.2rem 0.6rem",
                              borderRadius: "9999px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              background: key.is_active ? "#d1fae5" : "#fee2e2",
                              color: key.is_active ? "#065f46" : "#991b1b",
                            }}
                          >
                            {key.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "0.875rem 1rem",
                            color: "var(--text-secondary)",
                            fontSize: "0.875rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {key.created_at
                            ? new Date(key.created_at).toLocaleDateString()
                            : "—"}
                        </td>
                        <td
                          style={{
                            padding: "0.875rem 1rem",
                            color: "var(--text-secondary)",
                            fontSize: "0.875rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {key.last_used_at
                            ? new Date(key.last_used_at).toLocaleDateString()
                            : "Never"}
                        </td>
                        <td
                          style={{
                            padding: "0.875rem 1rem",
                            color: "var(--text-secondary)",
                            fontSize: "0.875rem",
                          }}
                        >
                          {key.request_count ?? 0}
                        </td>
                        <td
                          style={{
                            padding: "0.875rem 1rem",
                            textAlign: "right",
                          }}
                        >
                          <button
                            onClick={() => handleDelete(key.id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              padding: "0.4rem 0.75rem",
                              background: "#fee2e2",
                              color: "#991b1b",
                              border: "1px solid #fecaca",
                              borderRadius: "0.375rem",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#fecaca")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "#fee2e2")
                            }
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
