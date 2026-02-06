import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
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
  Eye,
  Sparkles,
  ExternalLink,
  Shield,
  Hash,
  Link2,
  Unlink,
} from "lucide-react";

export default function TenantSocialMediaPage() {
  const router = useRouter();
  const { id: tenantId } = router.query;

  const [tenant, setTenant] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("configs");
  const [hashtagInput, setHashtagInput] = useState("");

  // Post generation state
  const [showPostGenerator, setShowPostGenerator] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
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
    default_hashtags: [],
    post_template: "",
    auto_post_enabled: false,
  });

  // OAuth state
  const [oauthSuccess, setOauthSuccess] = useState(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (tenantId) {
      // Check for OAuth callback parameters
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
          message: `Successfully connected ${created || 0} account(s)! (${pages || 0} Facebook Pages, ${instagram || 0} Instagram accounts)`,
        });
        // Clear URL params
        window.history.replaceState({}, "", window.location.pathname);
      } else if (errorParam) {
        setOauthSuccess({
          type: "error",
          message: message || `OAuth error: ${errorParam}`,
        });
        // Clear URL params
        window.history.replaceState({}, "", window.location.pathname);
      }

      loadData();
    }
  }, [tenantId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load tenant info first
      let tenantData;
      try {
        tenantData = await tenantService.getTenant(tenantId);
        setTenant(tenantData.tenant || tenantData);
      } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 404) {
          const myTenantsData = await tenantService.getMyTenants();
          const myTenants = myTenantsData.tenants || [];
          const foundTenant = myTenants.find(
            (t) => t.id == tenantId || t.id === tenantId,
          );
          if (foundTenant) {
            setTenant(foundTenant);
          }
        }
      }

      const [configsData, logsData, statsData, articlesData] =
        await Promise.all([
          socialMediaService.getConfigs({}, tenantId),
          socialMediaService.getLogs({ limit: 20 }, tenantId),
          socialMediaService.getStats(30, tenantId),
          articleService.getArticles({
            tenant_id: tenantId,
            status: "published",
          }),
        ]);

      setConfigs(configsData.configs || []);
      setLogs(logsData.logs || []);
      setStats(statsData.statistics || statsData);
      setArticles(articlesData.articles || []);
    } catch (error) {
      console.error("Failed to load social media data:", error);
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
      access_token: "", // Don't show existing token
      token_expires_at: config.token_expires_at
        ? config.token_expires_at.split("T")[0]
        : "",
      refresh_token: "",
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

      // Only include token fields if provided
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
          tenantId,
        );
      } else {
        await socialMediaService.createConfig(payload, tenantId);
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
        "Are you sure you want to delete this social media configuration?",
      )
    ) {
      return;
    }

    try {
      await socialMediaService.deleteConfig(configId, tenantId);
      await loadData();
    } catch (err) {
      console.error("Failed to delete configuration:", err);
      setError(err.response?.data?.error || "Failed to delete configuration");
    }
  };

  const handleOAuthConnect = () => {
    setConnecting(true);
    const callbackUrl = window.location.href.split("?")[0];

    // Get access token from cookies
    const accessToken = authService.getAccessToken();
    if (!accessToken) {
      setError("Not authenticated. Please log in again.");
      setConnecting(false);
      return;
    }

    // Backend now accepts access_token via query parameter
    const oauthUrl = socialMediaService.getOAuthConnectUrl(
      callbackUrl,
      tenantId,
      accessToken,
    );
    window.location.href = oauthUrl;
  };

  const handleOAuthDisconnect = async (configId) => {
    if (
      !confirm("Are you sure you want to disconnect this social media account?")
    ) {
      return;
    }

    try {
      await socialMediaService.disconnectOAuth(configId, tenantId);
      await loadData();
      setOauthSuccess({
        type: "success",
        message: "Account disconnected successfully",
      });
    } catch (err) {
      console.error("Failed to disconnect account:", err);
      setError(err.response?.data?.error || "Failed to disconnect account");
    }
  };

  const handleVerifyToken = async (configId) => {
    setVerifying(configId);
    try {
      const result = await socialMediaService.verifyToken(configId, tenantId);
      if (result.valid) {
        alert("Token is valid and working!");
      } else {
        alert("Token verification failed. Please update your access token.");
      }
      await loadData();
    } catch (err) {
      console.error("Failed to verify token:", err);
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

    setGeneratingPost(true);
    setGeneratedPost(null);

    try {
      const result = await socialMediaService.generatePost(
        {
          article_id: selectedArticle.id,
          platform: "facebook",
          style: postStyle,
          include_link: true,
        },
        tenantId,
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
            `${tenant?.primary_domain}/articles/${selectedArticle.slug}`,
          ai_generated: true,
          was_edited: false,
        },
        tenantId,
      );
      alert("Posted successfully!");
      setShowPostGenerator(false);
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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <button
              className="btn btn-secondary"
              onClick={() =>
                router.push(`/dashboard/tenants/${tenantId}/dashboard`)
              }
              style={{ marginBottom: "1rem" }}
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <Share2 size={32} />
                  Social Media
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>
                  {tenant?.name} • Automated social media posting
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  className="btn btn-primary"
                  onClick={handleOAuthConnect}
                  disabled={connecting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
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
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowManualForm(true);
                    setShowForm(true);
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
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  background:
                    activeTab === key ? "var(--primary-color)" : "transparent",
                  color: activeTab === key ? "white" : "var(--text-secondary)",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

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
                }}
              >
                ×
              </button>
            </div>
          )}

          {/* OAuth Success/Error Message */}
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
                }}
              >
                ×
              </button>
            </div>
          )}

          {/* Configurations Tab */}
          {activeTab === "configs" && (
            <>
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
                          <option value="facebook">Facebook Profile</option>
                          <option value="instagram">Instagram Business</option>
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
                          Account/Page ID
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
                          Access Token{" "}
                          {editingConfig && "(leave blank to keep existing)"}
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
                          placeholder="EAAxxxxxx..."
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
                          Token Expiration Date
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
                          placeholder="Optional refresh token"
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
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <input
                          type="text"
                          value={hashtagInput}
                          onChange={(e) => setHashtagInput(e.target.value)}
                          placeholder="Add hashtag..."
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), handleAddHashtag())
                          }
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
                          className="btn btn-secondary"
                        >
                          <Hash size={18} />
                          Add
                        </button>
                      </div>
                      {formData.default_hashtags.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.5rem",
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
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

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
                        <span>Auto-post new articles</span>
                      </label>
                    </div>

                    <div style={{ display: "flex", gap: "1rem" }}>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
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
                        className="btn btn-secondary"
                        onClick={resetForm}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Configurations List */}
              {configs.length === 0 ? (
                <div
                  className="card"
                  style={{ textAlign: "center", padding: "3rem" }}
                >
                  <Facebook
                    size={48}
                    style={{
                      color: "#1877f2",
                      margin: "0 auto 1rem",
                    }}
                  />
                  <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                    No social media accounts connected
                  </h3>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      marginBottom: "1.5rem",
                      maxWidth: "400px",
                      margin: "0 auto 1.5rem",
                    }}
                  >
                    Connect your Facebook Pages and Instagram accounts with one
                    click using Meta OAuth
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      className="btn btn-primary"
                      onClick={handleOAuthConnect}
                      disabled={connecting}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {connecting ? (
                        <>
                          <RefreshCw size={20} className="spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Link2 size={20} />
                          Connect with Facebook
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowForm(true)}
                    >
                      <Plus size={20} />
                      Add Manually
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {configs.map((config) => (
                    <div key={config.id} className="card">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
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
                              }}
                            >
                              {config.account_name}
                            </h3>
                            <p
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.875rem",
                              }}
                            >
                              {config.platform.replace("_", " ")} • ID:{" "}
                              {config.account_id}
                            </p>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
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
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          marginTop: "1rem",
                          paddingTop: "1rem",
                          borderTop: "1px solid var(--border-color)",
                        }}
                      >
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleVerifyToken(config.id)}
                          disabled={verifying === config.id}
                          style={{ fontSize: "0.875rem" }}
                        >
                          {verifying === config.id ? (
                            <RefreshCw size={16} className="spin" />
                          ) : (
                            <Shield size={16} />
                          )}
                          Verify Token
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleEdit(config)}
                          style={{ fontSize: "0.875rem" }}
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleOAuthDisconnect(config.id)}
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--danger-color)",
                          }}
                        >
                          <Unlink size={16} />
                          Disconnect
                        </button>
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
                              style={{ color: "#f59e0b", marginLeft: "0.5rem" }}
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
            </>
          )}

          {/* Create Post Tab */}
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
                  style={{ marginRight: "0.5rem", verticalAlign: "middle" }}
                />
                Generate AI Social Media Post
              </h2>

              {configs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <AlertCircle
                    size={48}
                    style={{
                      color: "var(--text-secondary)",
                      margin: "0 auto 1rem",
                    }}
                  />
                  <p style={{ marginBottom: "1rem" }}>
                    No social media accounts configured.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab("configs")}
                  >
                    Add Account First
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
                  <Link href={`/dashboard/tenants/${tenantId}/articles`}>
                    <button className="btn btn-primary">View Articles</button>
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
                        setSelectedArticle(article);
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

                  <div style={{ marginBottom: "1.5rem" }}>
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

                  <button
                    className="btn btn-primary"
                    onClick={handleGeneratePost}
                    disabled={!selectedArticle || generatingPost}
                    style={{ marginBottom: "1.5rem" }}
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
                          style={{ marginBottom: "0.75rem", fontWeight: 500 }}
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
                          {configs.map((config) => (
                            <button
                              key={config.id}
                              className="btn btn-primary"
                              onClick={() => handlePostNow(config.id)}
                              disabled={posting}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              {posting ? (
                                <RefreshCw size={16} className="spin" />
                              ) : (
                                getPlatformIcon(config.platform)
                              )}
                              {config.account_name}
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

          {/* Logs Tab */}
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
                        <th
                          style={{
                            textAlign: "left",
                            padding: "0.75rem",
                            borderBottom: "1px solid var(--border-color)",
                          }}
                        >
                          Platform
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "0.75rem",
                            borderBottom: "1px solid var(--border-color)",
                          }}
                        >
                          Article
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "0.75rem",
                            borderBottom: "1px solid var(--border-color)",
                          }}
                        >
                          Status
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "0.75rem",
                            borderBottom: "1px solid var(--border-color)",
                          }}
                        >
                          Date
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "0.75rem",
                            borderBottom: "1px solid var(--border-color)",
                          }}
                        >
                          Actions
                        </th>
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
                                className="btn btn-secondary"
                                style={{
                                  fontSize: "0.75rem",
                                  padding: "0.25rem 0.5rem",
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
