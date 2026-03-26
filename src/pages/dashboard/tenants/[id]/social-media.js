import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTenantBySlug } from "@/lib/useTenantBySlug";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { socialMediaService } from "@/lib/socialMediaService";
import { articleService } from "@/lib/articleService";
import { tenantService } from "@/lib/tenantService";
import { authService } from "@/lib/authService";
import {
  Share2,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  BarChart3,
  ArrowLeft,
  Facebook,
  Instagram,
  Send,
  Clock,
  Sparkles,
  ExternalLink,
  Shield,
  Hash,
  Link2,
  Unlink,
  Globe,
  User,
  Building2,
} from "lucide-react";

export default function TenantSocialMediaPage() {
  const router = useRouter();
  const { id: tenantId } = router.query;
  const { tenantId: resolvedTenantId } = useTenantBySlug();

  const [tenant, setTenant] = useState(null);
  const [tenantConfigs, setTenantConfigs] = useState([]);
  const [userConfigs, setUserConfigs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(null);
  const [attaching, setAttaching] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("configs");
  const [configView, setConfigView] = useState("tenant");
  const [hashtagInput, setHashtagInput] = useState("");

  // Post generation state
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [generatingPost, setGeneratingPost] = useState(false);
  const [generatedPost, setGeneratedPost] = useState(null);
  const [posting, setPosting] = useState(false);
  const [postStyle, setPostStyle] = useState("engaging");

  const [formData, setFormData] = useState({
    platform: "facebook_page",
    account_name: "",
    account_id: "",
    access_token: "",
    token_expires_at: "",
    refresh_token: "",
    article_base_url: "",
    default_hashtags: [],
    post_template: "",
    auto_post_enabled: false,
  });

  // Attach modal state
  const [showAttachModal, setShowAttachModal] = useState(null);
  const [attachData, setAttachData] = useState({
    article_base_url: "",
    auto_post_enabled: false,
  });

  // OAuth state
  const [oauthSuccess, setOauthSuccess] = useState(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (resolvedTenantId) {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get("success");
      const errorParam = urlParams.get("error");
      const message = urlParams.get("message");
      const pages = urlParams.get("pages");
      const instagram = urlParams.get("instagram");
      const created = urlParams.get("created");

      if (success === "true") {
        setOauthSuccess({
          type: "success",
          message:
            "Successfully connected " +
            (created || 0) +
            " account(s)! (" +
            (pages || 0) +
            " Facebook Pages, " +
            (instagram || 0) +
            " Instagram accounts)",
        });
        window.history.replaceState({}, "", window.location.pathname);
      } else if (errorParam) {
        setOauthSuccess({
          type: "error",
          message: message || "OAuth error: " + errorParam,
        });
        window.history.replaceState({}, "", window.location.pathname);
      }

      loadData();
    }
  }, [resolvedTenantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Load tenant info
      let tenantData;
      try {
        tenantData = await tenantService.getTenant(resolvedTenantId);
        setTenant(tenantData.tenant || tenantData);
      } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 404) {
          const myTenantsData = await tenantService.getMyTenants();
          const myTenants = myTenantsData.tenants || [];
          const foundTenant = myTenants.find(
            (t) => String(t.id) === resolvedTenantId,
          );
          if (foundTenant) {
            setTenant(foundTenant);
          }
        }
      }

      // Use allSettled so partial failures don't break the page
      const results = await Promise.allSettled([
        socialMediaService.getConfigs({ scope: "tenant" }, resolvedTenantId),
        socialMediaService.getConfigs({ scope: "user" }, resolvedTenantId),
        socialMediaService.getLogs({ limit: 20 }, resolvedTenantId),
        socialMediaService.getStats(30, resolvedTenantId),
        articleService.getArticles({
          tenant_id: resolvedTenantId,
          status: "published",
        }),
      ]);

      if (results[0].status === "fulfilled") {
        const configs = results[0].value.configs || [];
        setTenantConfigs(configs);
        // Auto-select first config if none selected
        if (configs.length > 0 && !selectedConfig) {
          setSelectedConfig(configs[0]);
        }
      } else {
        console.error("Failed to load tenant configs:", results[0].reason);
      }
      if (results[1].status === "fulfilled") {
        setUserConfigs(results[1].value.configs || []);
      } else {
        console.error("Failed to load user configs:", results[1].reason);
      }
      if (results[2].status === "fulfilled") {
        setLogs(results[2].value.logs || []);
      }
      if (results[3].status === "fulfilled") {
        setStats(results[3].value.statistics || results[3].value);
      }
      if (results[4].status === "fulfilled") {
        setArticles(results[4].value.articles || []);
      }

      // Only show error if ALL config calls failed
      if (
        results[0].status === "rejected" &&
        results[1].status === "rejected"
      ) {
        setError(
          "Failed to load social media configurations. Please check your backend is running.",
        );
      }
    } catch (err) {
      console.error("Failed to load social media data:", err);
      setError("Failed to load social media data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      platform: "facebook_page",
      account_name: "",
      account_id: "",
      access_token: "",
      token_expires_at: "",
      refresh_token: "",
      article_base_url: "",
      default_hashtags: [],
      post_template: "",
      auto_post_enabled: false,
    });
    setHashtagInput("");
    setEditingConfig(null);
    setShowForm(false);
  };

  const handleEdit = (config) => {
    setFormData({
      platform: config.platform,
      account_name: config.account_name,
      account_id: config.account_id,
      access_token: "",
      token_expires_at: config.token_expires_at
        ? config.token_expires_at.split("T")[0]
        : "",
      refresh_token: "",
      article_base_url: config.article_base_url || "",
      default_hashtags: config.default_hashtags || [],
      post_template: config.post_template || "",
      auto_post_enabled: config.auto_post_enabled || false,
    });
    setEditingConfig(config);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        platform: formData.platform,
        account_name: formData.account_name,
        account_id: formData.account_id,
        default_hashtags: formData.default_hashtags,
        post_template: formData.post_template || null,
        auto_post_enabled: formData.auto_post_enabled,
      };

      if (formData.article_base_url) {
        payload.article_base_url = formData.article_base_url;
      }
      if (formData.access_token) {
        payload.access_token = formData.access_token;
      }
      if (formData.token_expires_at) {
        payload.token_expires_at = formData.token_expires_at + "T00:00:00Z";
      }
      if (formData.refresh_token) {
        payload.refresh_token = formData.refresh_token;
      }

      if (editingConfig) {
        await socialMediaService.updateConfig(
          editingConfig.id,
          payload,
          resolvedTenantId,
        );
      } else {
        await socialMediaService.createConfig(payload, resolvedTenantId);
      }

      await loadData();
      resetForm();
    } catch (err) {
      console.error("Failed to save configuration:", err);
      setError(err.response?.data?.error || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (configId) => {
    if (
      !confirm(
        "Are you sure you want to delete this social media configuration? This will remove it from all tenants.",
      )
    ) {
      return;
    }

    try {
      await socialMediaService.deleteConfig(configId, resolvedTenantId);
      await loadData();
    } catch (err) {
      console.error("Failed to delete:", err);
      setError(err.response?.data?.error || "Failed to delete configuration");
    }
  };

  const handleAttachToTenant = async (configId) => {
    setAttaching(configId);
    try {
      await socialMediaService.attachToTenant(
        configId,
        resolvedTenantId,
        attachData,
      );
      setShowAttachModal(null);
      setAttachData({ article_base_url: "", auto_post_enabled: false });
      await loadData();
      setOauthSuccess({
        type: "success",
        message: "Account linked to this tenant successfully!",
      });
    } catch (err) {
      console.error("Failed to attach:", err);
      setError(err.response?.data?.error || "Failed to link account to tenant");
    } finally {
      setAttaching(null);
    }
  };

  const handleDetachFromTenant = async (configId) => {
    if (
      !confirm(
        "Remove this account from this tenant? The account will still be available in your accounts.",
      )
    ) {
      return;
    }

    try {
      await socialMediaService.detachFromTenant(configId, resolvedTenantId);
      await loadData();
      setOauthSuccess({
        type: "success",
        message: "Account unlinked from this tenant",
      });
    } catch (err) {
      console.error("Failed to detach:", err);
      setError(err.response?.data?.error || "Failed to unlink account");
    }
  };

  const handleOAuthConnect = () => {
    setConnecting(true);
    const callbackUrl = window.location.href.split("?")[0];

    const accessToken = authService.getAccessToken();
    if (!accessToken) {
      setError("Not authenticated. Please log in again.");
      setConnecting(false);
      return;
    }

    const oauthUrl = socialMediaService.getOAuthConnectUrl(
      callbackUrl,
      resolvedTenantId,
      accessToken,
    );
    window.location.href = oauthUrl;
  };

  const handleOAuthDisconnect = async (configId) => {
    if (
      !confirm(
        "Are you sure you want to disconnect this social media account? It will be removed from all tenants.",
      )
    ) {
      return;
    }

    try {
      await socialMediaService.disconnectOAuth(configId, resolvedTenantId);
      await loadData();
      setOauthSuccess({
        type: "success",
        message: "Account disconnected successfully",
      });
    } catch (err) {
      console.error("Failed to disconnect:", err);
      setError(err.response?.data?.error || "Failed to disconnect account");
    }
  };

  const handleVerifyToken = async (configId) => {
    setVerifying(configId);
    try {
      const result = await socialMediaService.verifyToken(
        configId,
        resolvedTenantId,
      );
      if (result.valid) {
        alert("Token is valid and working!");
      } else {
        alert("Token verification failed. Please reconnect your account.");
      }
      await loadData();
    } catch (err) {
      console.error("Failed to verify:", err);
      alert(err.response?.data?.error || "Failed to verify token");
    } finally {
      setVerifying(null);
    }
  };

  const handleAddHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, "");
    if (tag && !formData.default_hashtags.includes(tag)) {
      setFormData({
        ...formData,
        default_hashtags: [...formData.default_hashtags, tag],
      });
    }
    setHashtagInput("");
  };

  const handleRemoveHashtag = (tagToRemove) => {
    setFormData({
      ...formData,
      default_hashtags: formData.default_hashtags.filter(
        (tag) => tag !== tagToRemove,
      ),
    });
  };

  const handleGeneratePost = async () => {
    if (!selectedArticle) return;

    // Use selected config, or fall back to first available tenant config
    const configToUse = selectedConfig || tenantConfigs[0];

    if (!configToUse || !configToUse.id) {
      setError("Please select a social media account to generate a post");
      return;
    }

    setGeneratingPost(true);
    setGeneratedPost(null);

    try {
      const result = await socialMediaService.generatePost(
        {
          article_id: selectedArticle.id,
          config_id: configToUse.id,
          platform: configToUse.platform || "facebook",
          style: postStyle,
          include_link: true,
        },
        resolvedTenantId,
      );
      setGeneratedPost(result);
    } catch (err) {
      console.error("Failed to generate post:", err);
      setError(err.response?.data?.error || "Failed to generate post");
    } finally {
      setGeneratingPost(false);
    }
  };

  const handlePostNow = async (configId) => {
    if (!generatedPost || !selectedArticle) return;

    setPosting(true);
    try {
      await socialMediaService.postToSocialMedia(
        {
          config_id: configId,
          article_id: selectedArticle.id,
          post_content: generatedPost.formatted_content,
          image_url: selectedArticle.image,
          link_url:
            selectedArticle.url ||
            (tenant?.primary_domain
              ? "https://" +
                tenant.primary_domain +
                "/articles/" +
                selectedArticle.slug
              : ""),
          ai_generated: true,
          was_edited: false,
        },
        resolvedTenantId,
      );
      alert("Posted successfully!");
      setGeneratedPost(null);
      setSelectedArticle(null);
      await loadData();
    } catch (err) {
      console.error("Failed to post:", err);
      setError(err.response?.data?.error || "Failed to post to social media");
    } finally {
      setPosting(false);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "facebook":
      case "facebook_page":
        return <Facebook size={20} />;
      case "instagram":
        return <Instagram size={20} />;
      default:
        return <Share2 size={20} />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      success: { bg: "#dcfce7", color: "#166534" },
      failed: { bg: "#fee2e2", color: "#991b1b" },
      pending: { bg: "#fef3c7", color: "#92400e" },
      scheduled: { bg: "#dbeafe", color: "#1e40af" },
    };
    const style = styles[status] || styles.pending;

    return (
      <span
        style={{
          background: style.bg,
          color: style.color,
          padding: "0.25rem 0.75rem",
          borderRadius: "9999px",
          fontSize: "0.75rem",
          fontWeight: 500,
          textTransform: "capitalize",
        }}
      >
        {status}
      </span>
    );
  };

  const isAttachedToTenant = (configId) => {
    return tenantConfigs.some((tc) => tc.id === configId);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const displayConfigs = configView === "tenant" ? tenantConfigs : userConfigs;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <button
              onClick={() =>
                router.push("/dashboard/tenants/" + tenantId + "/dashboard")
              }
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                background: "var(--surface)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.75rem",
                fontWeight: 500,
                cursor: "pointer",
                fontSize: "0.875rem",
                marginBottom: "1rem",
              }}
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "0.75rem",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    <Share2 size={24} />
                  </div>
                  <div>
                    <h1
                      style={{
                        fontSize: "2rem",
                        fontWeight: "bold",
                      }}
                    >
                      Social Media
                    </h1>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        marginTop: "0.25rem",
                      }}
                    >
                      {tenant?.name} &mdash; Connect accounts and share across
                      tenants
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={handleOAuthConnect}
                  disabled={connecting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.25rem",
                    background: "linear-gradient(135deg, #1877F2, #0d65d9)",
                    color: "white",
                    border: "none",
                    borderRadius: "0.75rem",
                    fontWeight: 600,
                    cursor: connecting ? "not-allowed" : "pointer",
                    opacity: connecting ? 0.7 : 1,
                  }}
                >
                  {connecting ? (
                    <>
                      <RefreshCw size={20} className="spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Facebook size={20} />
                      Connect with Facebook
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.25rem",
                    background: "var(--surface)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.75rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={20} />
                  Add Manually
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <div
                className="card"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                  }}
                >
                  <div>
                    <p style={{ opacity: 0.9, marginBottom: "0.5rem" }}>
                      Total Posts
                    </p>
                    <h3 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                      {stats.total || 0}
                    </h3>
                  </div>
                  <Send size={32} style={{ opacity: 0.8 }} />
                </div>
              </div>

              <div
                className="card"
                style={{
                  background:
                    "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                  color: "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                  }}
                >
                  <div>
                    <p style={{ opacity: 0.9, marginBottom: "0.5rem" }}>
                      Successful
                    </p>
                    <h3 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                      {stats.success || 0}
                    </h3>
                  </div>
                  <CheckCircle size={32} style={{ opacity: 0.8 }} />
                </div>
              </div>

              <div
                className="card"
                style={{
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                  }}
                >
                  <div>
                    <p style={{ opacity: 0.9, marginBottom: "0.5rem" }}>
                      Failed
                    </p>
                    <h3 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                      {stats.failed || 0}
                    </h3>
                  </div>
                  <XCircle size={32} style={{ opacity: 0.8 }} />
                </div>
              </div>

              <div
                className="card"
                style={{
                  background:
                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  color: "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                  }}
                >
                  <div>
                    <p style={{ opacity: 0.9, marginBottom: "0.5rem" }}>
                      Success Rate
                    </p>
                    <h3 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                      {stats.success_rate?.toFixed(1) || 0}%
                    </h3>
                  </div>
                  <BarChart3 size={32} style={{ opacity: 0.8 }} />
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "1.5rem",
              borderBottom: "1px solid var(--border-color)",
              paddingBottom: "0.5rem",
            }}
          >
            {[
              { key: "configs", label: "Accounts", icon: Share2 },
              { key: "post", label: "Create Post", icon: Sparkles },
              { key: "logs", label: "Post History", icon: Clock },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.5rem",
                    border: "none",
                    background:
                      activeTab === item.key
                        ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                        : "transparent",
                    color:
                      activeTab === item.key
                        ? "white"
                        : "var(--text-secondary)",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontWeight: 500,
                    transition: "all 0.2s",
                  }}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Error display */}
          {error && (
            <div
              className="card"
              style={{
                background: "#fee2e2",
                borderColor: "#fecaca",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#991b1b",
              }}
            >
              <AlertCircle size={20} />
              {error}
              <button
                onClick={() => setError("")}
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#991b1b",
                  fontSize: "1.25rem",
                }}
              >
                &times;
              </button>
            </div>
          )}

          {/* OAuth Success/Error */}
          {oauthSuccess && (
            <div
              className="card"
              style={{
                background:
                  oauthSuccess.type === "success" ? "#d1fae5" : "#fee2e2",
                borderColor:
                  oauthSuccess.type === "success" ? "#a7f3d0" : "#fecaca",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: oauthSuccess.type === "success" ? "#065f46" : "#991b1b",
              }}
            >
              {oauthSuccess.type === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              {oauthSuccess.message}
              <button
                onClick={() => setOauthSuccess(null)}
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color:
                    oauthSuccess.type === "success" ? "#065f46" : "#991b1b",
                  fontSize: "1.25rem",
                }}
              >
                &times;
              </button>
            </div>
          )}

          {/* ========== Accounts Tab ========== */}
          {activeTab === "configs" && (
            <div>
              {/* Sub-tabs: This Tenant / My Accounts */}
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <button
                  onClick={() => setConfigView("tenant")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    border:
                      configView === "tenant"
                        ? "2px solid var(--primary-color)"
                        : "1px solid var(--border-color)",
                    background:
                      configView === "tenant"
                        ? "var(--primary-color)"
                        : "transparent",
                    color:
                      configView === "tenant"
                        ? "white"
                        : "var(--text-secondary)",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                  }}
                >
                  <Building2 size={16} />
                  This Tenant ({tenantConfigs.length})
                </button>
                <button
                  onClick={() => setConfigView("user")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    border:
                      configView === "user"
                        ? "2px solid var(--primary-color)"
                        : "1px solid var(--border-color)",
                    background:
                      configView === "user"
                        ? "var(--primary-color)"
                        : "transparent",
                    color:
                      configView === "user" ? "white" : "var(--text-secondary)",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                  }}
                >
                  <User size={16} />
                  My Accounts ({userConfigs.length})
                </button>
              </div>

              {/* Manual Add Form */}
              {showForm && (
                <div className="card" style={{ marginBottom: "2rem" }}>
                  <h2
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      marginBottom: "1.5rem",
                    }}
                  >
                    {editingConfig
                      ? "Edit Social Media Account"
                      : "Add Social Media Account (Manual)"}
                  </h2>

                  <form onSubmit={handleSubmit}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "1.5rem",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 500,
                          }}
                        >
                          Platform
                        </label>
                        <select
                          value={formData.platform}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              platform: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            border: "1px solid var(--border-color)",
                            fontSize: "1rem",
                          }}
                        >
                          <option value="facebook_page">Facebook Page</option>
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                        </select>
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 500,
                          }}
                        >
                          Account Name
                        </label>
                        <input
                          type="text"
                          value={formData.account_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              account_name: e.target.value,
                            })
                          }
                          placeholder="My Business Page"
                          required
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            border: "1px solid var(--border-color)",
                            fontSize: "1rem",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 500,
                          }}
                        >
                          Account ID
                        </label>
                        <input
                          type="text"
                          value={formData.account_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              account_id: e.target.value,
                            })
                          }
                          placeholder="123456789"
                          required
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            border: "1px solid var(--border-color)",
                            fontSize: "1rem",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 500,
                          }}
                        >
                          Access Token
                        </label>
                        <input
                          type="password"
                          value={formData.access_token}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              access_token: e.target.value,
                            })
                          }
                          placeholder={
                            editingConfig ? "(unchanged)" : "EAAxxxxx..."
                          }
                          required={!editingConfig}
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            border: "1px solid var(--border-color)",
                            fontSize: "1rem",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 500,
                          }}
                        >
                          Token Expires
                        </label>
                        <input
                          type="date"
                          value={formData.token_expires_at}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              token_expires_at: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            border: "1px solid var(--border-color)",
                            fontSize: "1rem",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 500,
                          }}
                        >
                          Refresh Token (optional)
                        </label>
                        <input
                          type="password"
                          value={formData.refresh_token}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              refresh_token: e.target.value,
                            })
                          }
                          placeholder="Optional"
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            border: "1px solid var(--border-color)",
                            fontSize: "1rem",
                          }}
                        />
                      </div>
                    </div>

                    {/* Article Base URL */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 500,
                        }}
                      >
                        <Globe
                          size={16}
                          style={{
                            verticalAlign: "middle",
                            marginRight: "0.5rem",
                          }}
                        />
                        Article Base URL
                      </label>
                      <input
                        type="url"
                        value={formData.article_base_url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            article_base_url: e.target.value,
                          })
                        }
                        placeholder="https://www.example.com/article/"
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "0.5rem",
                          border: "1px solid var(--border-color)",
                          fontSize: "1rem",
                        }}
                      />
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--text-secondary)",
                          marginTop: "0.25rem",
                        }}
                      >
                        Article links will use: base_url + article_slug
                      </p>
                    </div>

                    {/* Hashtags */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 500,
                        }}
                      >
                        Default Hashtags
                      </label>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                          type="text"
                          value={hashtagInput}
                          onChange={(e) => setHashtagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddHashtag();
                            }
                          }}
                          placeholder="Add hashtag..."
                          style={{
                            flex: 1,
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            border: "1px solid var(--border-color)",
                            fontSize: "1rem",
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddHashtag}
                          style={{
                            padding: "0.5rem 1rem",
                            background: "var(--surface)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "0.5rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.375rem",
                          }}
                        >
                          <Hash size={16} />
                          Add
                        </button>
                      </div>
                      {formData.default_hashtags.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                            marginTop: "0.75rem",
                          }}
                        >
                          {formData.default_hashtags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                background: "var(--primary-color)",
                                color: "white",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "9999px",
                                fontSize: "0.875rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              #{tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveHashtag(tag)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "white",
                                  cursor: "pointer",
                                  padding: 0,
                                  fontSize: "1rem",
                                }}
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Post Template */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 500,
                        }}
                      >
                        Post Template (optional)
                      </label>
                      <textarea
                        value={formData.post_template}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            post_template: e.target.value,
                          })
                        }
                        placeholder="Check out our latest article: {title}"
                        rows={3}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "0.5rem",
                          border: "1px solid var(--border-color)",
                          fontSize: "1rem",
                          resize: "vertical",
                        }}
                      />
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--text-secondary)",
                          marginTop: "0.25rem",
                        }}
                      >
                        Use {"{title}"} and {"{link}"} as placeholders
                      </p>
                    </div>

                    {/* Auto-post */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.auto_post_enabled}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              auto_post_enabled: e.target.checked,
                            })
                          }
                          style={{ width: "18px", height: "18px" }}
                        />
                        <span>Auto-post new articles when generated</span>
                      </label>
                    </div>

                    <div style={{ display: "flex", gap: "1rem" }}>
                      <button
                        type="submit"
                        disabled={saving}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.75rem 1.5rem",
                          background:
                            "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          color: "white",
                          border: "none",
                          borderRadius: "0.75rem",
                          fontWeight: 600,
                          cursor: saving ? "not-allowed" : "pointer",
                          opacity: saving ? 0.7 : 1,
                        }}
                      >
                        {saving ? (
                          <>
                            <RefreshCw size={18} className="spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            {editingConfig ? "Update Account" : "Add Account"}
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.75rem 1.5rem",
                          background: "var(--surface)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "0.75rem",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Attach Modal */}
              {showAttachModal && (
                <div
                  className="card"
                  style={{
                    marginBottom: "1.5rem",
                    border: "2px solid var(--primary-color)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "bold",
                      marginBottom: "1rem",
                    }}
                  >
                    <Link2
                      size={18}
                      style={{
                        verticalAlign: "middle",
                        marginRight: "0.5rem",
                      }}
                    />
                    Link Account to {tenant?.name}
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(250px, 1fr))",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 500,
                          fontSize: "0.875rem",
                        }}
                      >
                        Article Base URL for this tenant
                      </label>
                      <input
                        type="url"
                        value={attachData.article_base_url}
                        onChange={(e) =>
                          setAttachData({
                            ...attachData,
                            article_base_url: e.target.value,
                          })
                        }
                        placeholder={
                          "https://" +
                          (tenant?.primary_domain || "example.com") +
                          "/article/"
                        }
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "0.5rem",
                          border: "1px solid var(--border-color)",
                          fontSize: "0.875rem",
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "end" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={attachData.auto_post_enabled}
                          onChange={(e) =>
                            setAttachData({
                              ...attachData,
                              auto_post_enabled: e.target.checked,
                            })
                          }
                          style={{ width: "16px", height: "16px" }}
                        />
                        <span style={{ fontSize: "0.875rem" }}>
                          Auto-post new articles
                        </span>
                      </label>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      onClick={() => handleAttachToTenant(showAttachModal)}
                      disabled={attaching === showAttachModal}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.75rem 1.25rem",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "white",
                        border: "none",
                        borderRadius: "0.75rem",
                        fontWeight: 600,
                        cursor:
                          attaching === showAttachModal
                            ? "not-allowed"
                            : "pointer",
                        opacity: attaching === showAttachModal ? 0.7 : 1,
                        fontSize: "0.875rem",
                      }}
                    >
                      {attaching === showAttachModal ? (
                        <>
                          <RefreshCw size={16} className="spin" />
                          Linking...
                        </>
                      ) : (
                        <>
                          <Link2 size={16} />
                          Link to Tenant
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowAttachModal(null);
                        setAttachData({
                          article_base_url: "",
                          auto_post_enabled: false,
                        });
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.75rem 1.25rem",
                        background: "var(--surface)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "0.75rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        fontSize: "0.875rem",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Configs List */}
              {displayConfigs.length === 0 ? (
                <div
                  className="card"
                  style={{ textAlign: "center", padding: "3rem" }}
                >
                  {configView === "tenant" ? (
                    <>
                      <Building2
                        size={48}
                        style={{
                          color: "var(--text-secondary)",
                          margin: "0 auto 1rem",
                        }}
                      />
                      <h3
                        style={{
                          fontSize: "1.25rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        No accounts linked to this tenant
                      </h3>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          marginBottom: "1.5rem",
                          maxWidth: "450px",
                          margin: "0 auto 1.5rem",
                        }}
                      >
                        Connect a Facebook/Instagram account, then link it to
                        this tenant. Or switch to &quot;My Accounts&quot; to
                        link an existing account.
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.75rem",
                          justifyContent: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={handleOAuthConnect}
                          disabled={connecting}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.75rem 1.25rem",
                            background:
                              "linear-gradient(135deg, #1877F2, #0d65d9)",
                            color: "white",
                            border: "none",
                            borderRadius: "0.75rem",
                            fontWeight: 600,
                            cursor: connecting ? "not-allowed" : "pointer",
                            opacity: connecting ? 0.7 : 1,
                          }}
                        >
                          {connecting ? (
                            <>
                              <RefreshCw size={20} className="spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Facebook size={20} />
                              Connect with Facebook
                            </>
                          )}
                        </button>
                        {userConfigs.length > 0 && (
                          <button
                            onClick={() => setConfigView("user")}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              padding: "0.75rem 1.25rem",
                              background: "var(--surface)",
                              color: "var(--text-primary)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "0.75rem",
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            <User size={20} />
                            Link Existing Account
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <User
                        size={48}
                        style={{
                          color: "var(--text-secondary)",
                          margin: "0 auto 1rem",
                        }}
                      />
                      <h3
                        style={{
                          fontSize: "1.25rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        No social media accounts yet
                      </h3>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          marginBottom: "1.5rem",
                          maxWidth: "400px",
                          margin: "0 auto 1.5rem",
                        }}
                      >
                        Connect your Facebook Pages and Instagram accounts. They
                        can be shared across all your tenants.
                      </p>
                      <button
                        onClick={handleOAuthConnect}
                        disabled={connecting}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          margin: "0 auto",
                          padding: "0.75rem 1.25rem",
                          background:
                            "linear-gradient(135deg, #1877F2, #0d65d9)",
                          color: "white",
                          border: "none",
                          borderRadius: "0.75rem",
                          fontWeight: 600,
                          cursor: connecting ? "not-allowed" : "pointer",
                          opacity: connecting ? 0.7 : 1,
                        }}
                      >
                        <Facebook size={20} />
                        Connect with Facebook
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {displayConfigs.map((config) => (
                    <div key={config.id} className="card">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                          }}
                        >
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: "0.75rem",
                              background: config.platform.includes("facebook")
                                ? "#1877f2"
                                : "linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                            }}
                          >
                            {getPlatformIcon(config.platform)}
                          </div>
                          <div>
                            <h3
                              style={{
                                fontSize: "1.125rem",
                                fontWeight: 600,
                                marginBottom: "0.25rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                flexWrap: "wrap",
                              }}
                            >
                              {config.account_name}
                              {config.is_owner && (
                                <span
                                  style={{
                                    background: "#ede9fe",
                                    color: "#6d28d9",
                                    padding: "0.125rem 0.5rem",
                                    borderRadius: "9999px",
                                    fontSize: "0.625rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  OWNER
                                </span>
                              )}
                            </h3>
                            <p
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.875rem",
                              }}
                            >
                              {config.platform.replace("_", " ")} &bull; ID:{" "}
                              {config.account_id}
                            </p>
                            {config.article_base_url && (
                              <p
                                style={{
                                  color: "var(--text-secondary)",
                                  fontSize: "0.75rem",
                                  marginTop: "0.25rem",
                                }}
                              >
                                <Globe
                                  size={12}
                                  style={{
                                    verticalAlign: "middle",
                                    marginRight: "0.25rem",
                                  }}
                                />
                                {config.article_base_url}
                              </p>
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            flexWrap: "wrap",
                          }}
                        >
                          {config.is_active ? (
                            <span
                              style={{
                                background: "#dcfce7",
                                color: "#166534",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "9999px",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                              }}
                            >
                              Active
                            </span>
                          ) : (
                            <span
                              style={{
                                background: "#fee2e2",
                                color: "#991b1b",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "9999px",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                              }}
                            >
                              Inactive
                            </span>
                          )}

                          {config.auto_post_enabled && (
                            <span
                              style={{
                                background: "#dbeafe",
                                color: "#1e40af",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "9999px",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                              }}
                            >
                              Auto-post
                            </span>
                          )}

                          {configView === "user" &&
                            isAttachedToTenant(config.id) && (
                              <span
                                style={{
                                  background: "#fef3c7",
                                  color: "#92400e",
                                  padding: "0.25rem 0.75rem",
                                  borderRadius: "9999px",
                                  fontSize: "0.75rem",
                                  fontWeight: 500,
                                }}
                              >
                                Linked
                              </span>
                            )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "0.75rem",
                          marginTop: "1rem",
                          paddingTop: "1rem",
                          borderTop: "1px solid var(--border-color)",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={() => handleVerifyToken(config.id)}
                          disabled={verifying === config.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.375rem",
                            padding: "0.5rem 0.875rem",
                            background: "var(--surface)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "0.5rem",
                            fontWeight: 500,
                            cursor:
                              verifying === config.id
                                ? "not-allowed"
                                : "pointer",
                            opacity: verifying === config.id ? 0.7 : 1,
                            fontSize: "0.875rem",
                          }}
                        >
                          {verifying === config.id ? (
                            <RefreshCw size={16} className="spin" />
                          ) : (
                            <Shield size={16} />
                          )}
                          Verify
                        </button>

                        {config.is_owner && (
                          <button
                            onClick={() => handleEdit(config)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.375rem",
                              padding: "0.5rem 0.875rem",
                              background:
                                "linear-gradient(135deg, #6366f1, #8b5cf6)",
                              color: "white",
                              border: "none",
                              borderRadius: "0.5rem",
                              fontWeight: 500,
                              cursor: "pointer",
                              fontSize: "0.875rem",
                            }}
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                        )}

                        {/* Tenant view: unlink from tenant */}
                        {configView === "tenant" && (
                          <button
                            onClick={() => handleDetachFromTenant(config.id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.375rem",
                              padding: "0.5rem 0.875rem",
                              background: "#fffbeb",
                              color: "#b45309",
                              border: "1px solid #fde68a",
                              borderRadius: "0.5rem",
                              fontWeight: 500,
                              cursor: "pointer",
                              fontSize: "0.875rem",
                            }}
                          >
                            <Unlink size={16} />
                            Unlink
                          </button>
                        )}

                        {/* User view: link or unlink */}
                        {configView === "user" &&
                          !isAttachedToTenant(config.id) && (
                            <button
                              onClick={() => setShowAttachModal(config.id)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.375rem",
                                padding: "0.5rem 0.875rem",
                                background: "#ecfdf5",
                                color: "#059669",
                                border: "1px solid #a7f3d0",
                                borderRadius: "0.5rem",
                                fontWeight: 500,
                                cursor: "pointer",
                                fontSize: "0.875rem",
                              }}
                            >
                              <Link2 size={16} />
                              Link to Tenant
                            </button>
                          )}

                        {configView === "user" &&
                          isAttachedToTenant(config.id) && (
                            <button
                              onClick={() => handleDetachFromTenant(config.id)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.375rem",
                                padding: "0.5rem 0.875rem",
                                background: "#fffbeb",
                                color: "#b45309",
                                border: "1px solid #fde68a",
                                borderRadius: "0.5rem",
                                fontWeight: 500,
                                cursor: "pointer",
                                fontSize: "0.875rem",
                              }}
                            >
                              <Unlink size={16} />
                              Unlink from Tenant
                            </button>
                          )}

                        {config.is_owner && (
                          <button
                            onClick={() => handleOAuthDisconnect(config.id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.375rem",
                              padding: "0.5rem 0.875rem",
                              background: "#fee2e2",
                              color: "#991b1b",
                              border: "1px solid #fecaca",
                              borderRadius: "0.5rem",
                              fontWeight: 500,
                              cursor: "pointer",
                              fontSize: "0.875rem",
                            }}
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        )}
                      </div>

                      {config.token_expires_at && (
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                            marginTop: "0.75rem",
                          }}
                        >
                          Token expires:{" "}
                          {new Date(
                            config.token_expires_at,
                          ).toLocaleDateString()}
                          {new Date(config.token_expires_at) <
                            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                            <span
                              style={{
                                color: "#f59e0b",
                                marginLeft: "0.5rem",
                              }}
                            >
                              (expires soon!)
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========== Create Post Tab ========== */}
          {activeTab === "post" && (
            <div className="card">
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  marginBottom: "1.5rem",
                }}
              >
                <Sparkles
                  size={24}
                  style={{
                    marginRight: "0.5rem",
                    verticalAlign: "middle",
                  }}
                />
                Generate AI Social Media Post
              </h2>

              {tenantConfigs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <AlertCircle
                    size={48}
                    style={{
                      color: "var(--text-secondary)",
                      margin: "0 auto 1rem",
                    }}
                  />
                  <p style={{ marginBottom: "1rem" }}>
                    No social media accounts linked to this tenant.
                  </p>
                  <button
                    onClick={() => setActiveTab("configs")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.25rem",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "white",
                      border: "none",
                      borderRadius: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Link Account First
                  </button>
                </div>
              ) : articles.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <AlertCircle
                    size={48}
                    style={{
                      color: "var(--text-secondary)",
                      margin: "0 auto 1rem",
                    }}
                  />
                  <p style={{ marginBottom: "1rem" }}>
                    No published articles to share.
                  </p>
                  <Link href={"/dashboard/tenants/" + tenantId + "/articles"}>
                    <button
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.75rem 1.25rem",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "white",
                        border: "none",
                        borderRadius: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      View Articles
                    </button>
                  </Link>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                      }}
                    >
                      Select Article to Share
                    </label>
                    <select
                      value={selectedArticle?.id || ""}
                      onChange={(e) => {
                        const article = articles.find(
                          (a) => a.id == e.target.value,
                        );
                        setSelectedArticle(article || null);
                        setGeneratedPost(null);
                      }}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                        border: "1px solid var(--border-color)",
                        fontSize: "1rem",
                      }}
                    >
                      <option value="">Choose an article...</option>
                      {articles.map((article) => (
                        <option key={article.id} value={article.id}>
                          {article.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "1rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 500,
                        }}
                      >
                        Post Style
                      </label>
                      <select
                        value={postStyle}
                        onChange={(e) => setPostStyle(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "0.5rem",
                          border: "1px solid var(--border-color)",
                          fontSize: "1rem",
                        }}
                      >
                        <option value="engaging">Engaging</option>
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="clickbait">Clickbait</option>
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 500,
                        }}
                      >
                        Account (for URL)
                      </label>
                      <select
                        value={selectedConfig?.id || tenantConfigs[0]?.id || ""}
                        onChange={(e) => {
                          const cfg = tenantConfigs.find(
                            (c) => c.id == e.target.value,
                          );
                          setSelectedConfig(cfg || tenantConfigs[0] || null);
                        }}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "0.5rem",
                          border: "1px solid var(--border-color)",
                          fontSize: "1rem",
                        }}
                      >
                        {tenantConfigs.map((cfg) => (
                          <option key={cfg.id} value={cfg.id}>
                            {cfg.account_name} ({cfg.platform.replace("_", " ")}
                            )
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleGeneratePost}
                    disabled={!selectedArticle || generatingPost}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.5rem",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "white",
                      border: "none",
                      borderRadius: "0.75rem",
                      fontWeight: 600,
                      cursor:
                        !selectedArticle || generatingPost
                          ? "not-allowed"
                          : "pointer",
                      opacity: !selectedArticle || generatingPost ? 0.7 : 1,
                      marginBottom: "1.5rem",
                    }}
                  >
                    {generatingPost ? (
                      <>
                        <RefreshCw size={18} className="spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Generate Post
                      </>
                    )}
                  </button>

                  {generatedPost && (
                    <div
                      style={{
                        background: "var(--bg-secondary)",
                        padding: "1.5rem",
                        borderRadius: "0.75rem",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <h4 style={{ marginBottom: "1rem", fontWeight: 600 }}>
                        Generated Post Preview
                      </h4>
                      <div
                        style={{
                          background: "white",
                          padding: "1rem",
                          borderRadius: "0.5rem",
                          border: "1px solid var(--border-color)",
                          whiteSpace: "pre-wrap",
                          marginBottom: "1rem",
                        }}
                      >
                        {generatedPost.formatted_content}
                      </div>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Character count: {generatedPost.character_count}
                      </p>

                      <div style={{ marginTop: "1.5rem" }}>
                        <h5
                          style={{
                            marginBottom: "0.75rem",
                            fontWeight: 500,
                          }}
                        >
                          Post to:
                        </h5>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.75rem",
                          }}
                        >
                          {tenantConfigs.map((cfg) => (
                            <button
                              key={cfg.id}
                              onClick={() => handlePostNow(cfg.id)}
                              disabled={posting}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.75rem 1.25rem",
                                background:
                                  "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                color: "white",
                                border: "none",
                                borderRadius: "0.75rem",
                                fontWeight: 600,
                                cursor: posting ? "not-allowed" : "pointer",
                                opacity: posting ? 0.7 : 1,
                              }}
                            >
                              {posting ? (
                                <RefreshCw size={16} className="spin" />
                              ) : (
                                getPlatformIcon(cfg.platform)
                              )}
                              {cfg.account_name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ========== Logs Tab ========== */}
          {activeTab === "logs" && (
            <div className="card">
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  marginBottom: "1.5rem",
                }}
              >
                Post History
              </h2>

              {logs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <Clock
                    size={48}
                    style={{
                      color: "var(--text-secondary)",
                      margin: "0 auto 1rem",
                    }}
                  />
                  <p>No posts yet. Start sharing your articles!</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {[
                          "Platform",
                          "Article",
                          "Status",
                          "Date",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: "left",
                              padding: "0.75rem",
                              borderBottom: "1px solid var(--border-color)",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id}>
                          <td
                            style={{
                              padding: "0.75rem",
                              borderBottom: "1px solid var(--border-color)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              {getPlatformIcon(log.platform)}
                              <span>{log.account_name}</span>
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "0.75rem",
                              borderBottom: "1px solid var(--border-color)",
                            }}
                          >
                            {log.article_title}
                          </td>
                          <td
                            style={{
                              padding: "0.75rem",
                              borderBottom: "1px solid var(--border-color)",
                            }}
                          >
                            {getStatusBadge(log.status)}
                          </td>
                          <td
                            style={{
                              padding: "0.75rem",
                              borderBottom: "1px solid var(--border-color)",
                            }}
                          >
                            {log.posted_at
                              ? new Date(log.posted_at).toLocaleString()
                              : new Date(log.created_at).toLocaleString()}
                          </td>
                          <td
                            style={{
                              padding: "0.75rem",
                              borderBottom: "1px solid var(--border-color)",
                            }}
                          >
                            {log.platform_post_url && (
                              <a
                                href={log.platform_post_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  fontSize: "0.75rem",
                                  padding: "0.25rem 0.5rem",
                                  background: "var(--surface)",
                                  color: "var(--text-secondary)",
                                  border: "1px solid var(--border-color)",
                                  borderRadius: "0.375rem",
                                  textDecoration: "none",
                                  fontWeight: 500,
                                }}
                              >
                                <ExternalLink size={14} />
                                View
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <style jsx>{`
          .spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
