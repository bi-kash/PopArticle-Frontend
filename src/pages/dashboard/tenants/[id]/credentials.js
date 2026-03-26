import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTenantBySlug } from "@/lib/useTenantBySlug";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { tenantService } from "@/lib/tenantService";
import { getTenantSlug } from "@/lib/tenantUtils";
import {
  Key,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
  AlertTriangle,
} from "lucide-react";

export default function TenantCredentialsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { tenantId: resolvedId, tenant: resolvedTenant } = useTenantBySlug();
  const effectiveId = resolvedId || id;

  const [tenant, setTenant] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [visibleFields, setVisibleFields] = useState({});

  useEffect(() => {
    if (effectiveId) {
      loadData();
    }
  }, [effectiveId]);

  useEffect(() => {
    if (resolvedTenant) setTenant(resolvedTenant);
  }, [resolvedTenant]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantData, credData] = await Promise.all([
        tenant ? Promise.resolve(null) : tenantService.getTenant(effectiveId),
        tenantService.getTenantCredentials(effectiveId),
      ]);
      if (tenantData) setTenant(tenantData.tenant || tenantData);
      setCredentials(credData.credentials || credData);
    } catch (error) {
      console.error("Failed to load credentials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (value, field) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleRegenerate = async () => {
    if (
      !confirm(
        "Are you sure you want to regenerate the API key? The old key will stop working immediately.",
      )
    )
      return;
    setRegenerating(true);
    try {
      const data = await tenantService.regenerateTenantApiKey(effectiveId);
      setCredentials(data.credentials || data);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to regenerate API key");
    } finally {
      setRegenerating(false);
    }
  };

  const toggleVisibility = (field) => {
    setVisibleFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const maskValue = (value) => {
    if (!value) return "••••••••••••••••";
    return (
      value.slice(0, 6) +
      "•".repeat(Math.max(value.length - 10, 8)) +
      value.slice(-4)
    );
  };

  const slug = tenant ? getTenantSlug(tenant) : id;

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div className="spinner" style={{ margin: "0 auto" }}></div>
            <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>
              Loading credentials...
            </p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const credentialItems = credentials
    ? [
        {
          key: "tenant_id",
          label: "Tenant ID",
          value: String(effectiveId),
          sensitive: false,
        },
        {
          key: "api_key",
          label: "API Key",
          value: credentials.api_key,
          sensitive: true,
        },
        ...(credentials.secret_key
          ? [
              {
                key: "secret_key",
                label: "Secret Key",
                value: credentials.secret_key,
                sensitive: true,
              },
            ]
          : []),
        ...(credentials.webhook_secret
          ? [
              {
                key: "webhook_secret",
                label: "Webhook Secret",
                value: credentials.webhook_secret,
                sensitive: true,
              },
            ]
          : []),
      ]
    : [];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div style={{ maxWidth: "800px" }}>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <Link href={`/dashboard/tenants/${slug}`}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  color: "var(--text-secondary)",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  marginBottom: "0.75rem",
                }}
              >
                <ArrowLeft size={16} />
                Back to {tenant?.name || "Tenant"}
              </span>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "0.875rem",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Key size={26} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>
                  API Credentials
                </h1>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                  }}
                >
                  Manage API keys for {tenant?.name || "this tenant"}
                </p>
              </div>
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
                Never share your API keys publicly or commit them to source
                control. Use environment variables in production.
              </p>
            </div>
          </div>

          {/* Credentials */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-color)",
              borderRadius: "1rem",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "1rem 1.5rem",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Shield size={18} style={{ color: "#6366f1" }} />
                <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>
                  Credentials
                </h2>
              </div>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.4rem 0.875rem",
                  background: regenerating ? "#fca5a5" : "#fee2e2",
                  color: "#991b1b",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: regenerating ? "not-allowed" : "pointer",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                }}
              >
                <RefreshCw size={14} className={regenerating ? "spin" : ""} />
                {regenerating ? "Regenerating..." : "Regenerate API Key"}
              </button>
            </div>

            <div style={{ padding: "0.5rem 0" }}>
              {credentialItems.map((item) => (
                <div
                  key={item.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem 1.5rem",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {item.label}
                    </label>
                    <div
                      style={{
                        marginTop: "0.35rem",
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                        color: "var(--text-primary)",
                        wordBreak: "break-all",
                      }}
                    >
                      {item.sensitive && !visibleFields[item.key]
                        ? maskValue(item.value)
                        : item.value || "Not available"}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.375rem",
                      flexShrink: 0,
                      marginLeft: "1rem",
                    }}
                  >
                    {item.sensitive && (
                      <button
                        onClick={() => toggleVisibility(item.key)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "0.4rem",
                          background: "var(--background, #f3f4f6)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "0.375rem",
                          cursor: "pointer",
                          color: "var(--text-secondary)",
                        }}
                        title={visibleFields[item.key] ? "Hide" : "Show"}
                      >
                        {visibleFields[item.key] ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(item.value, item.key)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        padding: "0.4rem 0.65rem",
                        background:
                          copiedField === item.key
                            ? "#d1fae5"
                            : "var(--background, #f3f4f6)",
                        color:
                          copiedField === item.key
                            ? "#065f46"
                            : "var(--text-secondary)",
                        border: `1px solid ${copiedField === item.key ? "#6ee7b7" : "var(--border-color)"}`,
                        borderRadius: "0.375rem",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        transition: "all 0.15s",
                      }}
                    >
                      {copiedField === item.key ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                      {copiedField === item.key ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              ))}

              {credentialItems.length === 0 && (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Key
                    size={32}
                    style={{ margin: "0 auto 0.75rem", opacity: 0.4 }}
                  />
                  <p>
                    No credentials available. Contact support if you need API
                    access.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
