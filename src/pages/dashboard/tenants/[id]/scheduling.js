import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTenantBySlug } from "@/lib/useTenantBySlug";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { schedulingService } from "@/lib/schedulingService";
import { categoryService } from "@/lib/categoryService";
import { tenantService } from "@/lib/tenantService";
import { socialMediaService } from "@/lib/socialMediaService";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  BarChart3,
  ArrowLeft,
  Share2,
  Facebook,
  Instagram,
} from "lucide-react";

export default function TenantSchedulingPage() {
  const router = useRouter();
  const { id: tenantId } = router.query;
  const { tenantId: resolvedTenantId } = useTenantBySlug();

  const [tenant, setTenant] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [socialMediaConfigs, setSocialMediaConfigs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("configs");
  const [keywordInput, setKeywordInput] = useState("");

  const [formData, setFormData] = useState({
    category_id: "",
    articles_per_day: 1,
    scheduled_hour: 6,
    scheduled_minute: 0,
    default_topic: "",
    target_keywords: [],
    word_count: 1000,
    tone: "professional",
    ai_model: "",
    generate_image: true,
    auto_publish: false,
    auto_post_social: false,
    social_media_config_id: "",
    is_enabled: true,
    priority: 0,
  });

  useEffect(() => {
    if (resolvedTenantId) {
      loadData();
    }
  }, [resolvedTenantId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load tenant info first
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

      const [
        configsData,
        categoriesData,
        logsData,
        statsData,
        socialMediaData,
      ] = await Promise.all([
        schedulingService.getConfigs({}, resolvedTenantId),
        categoryService.getCategories({ tenant_id: resolvedTenantId }),
        schedulingService.getLogs({ limit: 20 }, resolvedTenantId),
        schedulingService.getStats(7, resolvedTenantId),
        socialMediaService.getConfigs({ scope: "tenant" }, resolvedTenantId),
      ]);
      setConfigs(configsData.configs || []);
      setCategories(categoriesData.categories || []);
      setLogs(logsData.logs || []);
      setStats(statsData);
      setSocialMediaConfigs(socialMediaData.configs || []);
    } catch (error) {
      console.error("Failed to load scheduling data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const data = {
        ...formData,
        category_id: parseInt(formData.category_id),
        articles_per_day: parseInt(formData.articles_per_day),
        scheduled_hour: parseInt(formData.scheduled_hour),
        scheduled_minute: parseInt(formData.scheduled_minute),
        word_count: parseInt(formData.word_count),
        priority: parseInt(formData.priority),
        ai_model: formData.ai_model || null,
        social_media_config_id: formData.social_media_config_id
          ? parseInt(formData.social_media_config_id)
          : null,
      };

      if (editingConfig) {
        await schedulingService.updateConfig(
          editingConfig.id,
          data,
          resolvedTenantId,
        );
      } else {
        await schedulingService.createConfig(data, resolvedTenantId);
      }

      resetForm();
      loadData();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to save scheduling configuration",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      category_id: config.category_id?.toString() || "",
      articles_per_day: config.articles_per_day || 1,
      scheduled_hour: config.scheduled_hour || 6,
      scheduled_minute: config.scheduled_minute || 0,
      default_topic: config.default_topic || "",
      target_keywords: Array.isArray(config.target_keywords)
        ? config.target_keywords
        : [],
      word_count: config.word_count || 1000,
      tone: config.tone || "professional",
      ai_model: config.ai_model || "",
      generate_image: config.generate_image ?? true,
      auto_publish: config.auto_publish ?? false,
      auto_post_social: config.auto_post_social ?? false,
      social_media_config_id: config.social_media_config_id?.toString() || "",
      is_enabled: config.is_enabled ?? true,
      priority: config.priority || 0,
    });
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (
      !confirm("Are you sure you want to delete this scheduling configuration?")
    )
      return;

    try {
      await schedulingService.deleteConfig(id, resolvedTenantId);
      setConfigs(configs.filter((c) => c.id !== id));
    } catch (error) {
      alert("Failed to delete scheduling configuration");
    }
  };

  const handleToggleEnabled = async (config) => {
    try {
      await schedulingService.updateConfig(
        config.id,
        { is_enabled: !config.is_enabled },
        resolvedTenantId,
      );
      loadData();
    } catch (error) {
      alert("Failed to update scheduling configuration");
    }
  };

  const handleTrigger = async (configId) => {
    setTriggering(configId);
    try {
      await schedulingService.triggerGeneration(configId, resolvedTenantId);
      alert("Article generation triggered successfully!");
      loadData();
    } catch (error) {
      alert(
        error.response?.data?.error || "Failed to trigger article generation",
      );
    } finally {
      setTriggering(null);
    }
  };

  const handleAddKeyword = () => {
    if (
      keywordInput.trim() &&
      !formData.target_keywords.includes(keywordInput.trim())
    ) {
      setFormData({
        ...formData,
        target_keywords: [...formData.target_keywords, keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setFormData({
      ...formData,
      target_keywords: formData.target_keywords.filter((k) => k !== keyword),
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingConfig(null);
    setFormData({
      category_id: "",
      articles_per_day: 1,
      scheduled_hour: 6,
      scheduled_minute: 0,
      default_topic: "",
      target_keywords: [],
      word_count: 1000,
      tone: "professional",
      ai_model: "",
      generate_image: true,
      auto_publish: false,
      auto_post_social: false,
      social_media_config_id: "",
      is_enabled: true,
      priority: 0,
    });
    setKeywordInput("");
    setError("");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return (
          <CheckCircle size={16} style={{ color: "var(--success-color)" }} />
        );
      case "failed":
        return <XCircle size={16} style={{ color: "var(--danger-color)" }} />;
      case "skipped":
        return (
          <AlertCircle size={16} style={{ color: "var(--warning-color)" }} />
        );
      default:
        return <Clock size={16} style={{ color: "var(--text-secondary)" }} />;
    }
  };

  const formatTime = (hour, minute) => {
    const h = hour.toString().padStart(2, "0");
    const m = minute.toString().padStart(2, "0");
    return `${h}:${m} UTC`;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div className="spinner" style={{ margin: "0 auto" }}></div>
            <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>
              Loading scheduling data...
            </p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          {/* Back Button */}
          <button
            onClick={() =>
              router.push(`/dashboard/tenants/${tenantId}/dashboard`)
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
            Back to {tenant?.name || "Tenant"} Dashboard
          </button>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
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
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <Calendar size={24} />
                </div>
                <div>
                  <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                    Article Scheduling
                  </h1>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      marginTop: "0.25rem",
                    }}
                  >
                    Automate article generation for{" "}
                    {tenant?.name || "this tenant"}
                  </p>
                </div>
              </div>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.25rem",
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Plus size={18} />
                New Schedule
              </button>
            )}
          </div>

          {/* Stats Cards */}
          {stats && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <div className="card" style={{ textAlign: "center" }}>
                <BarChart3
                  size={24}
                  style={{
                    color: "var(--primary-color)",
                    marginBottom: "0.5rem",
                  }}
                />
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {stats.statistics?.total || 0}
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Total (7 days)
                </div>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <CheckCircle
                  size={24}
                  style={{
                    color: "var(--success-color)",
                    marginBottom: "0.5rem",
                  }}
                />
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {stats.statistics?.success || 0}
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Successful
                </div>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <XCircle
                  size={24}
                  style={{
                    color: "var(--danger-color)",
                    marginBottom: "0.5rem",
                  }}
                />
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {stats.statistics?.failed || 0}
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Failed
                </div>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <AlertCircle
                  size={24}
                  style={{
                    color: "var(--warning-color)",
                    marginBottom: "0.5rem",
                  }}
                />
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {stats.statistics?.skipped || 0}
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Skipped
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="card" style={{ marginBottom: "2rem" }}>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}
              >
                {editingConfig ? "Edit Schedule" : "New Schedule"}
              </h2>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <div className="form-group">
                    <label className="label">Category *</label>
                    <select
                      className="select"
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category_id: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="label">Articles per Day</label>
                    <input
                      type="number"
                      className="input"
                      min="1"
                      max="10"
                      value={formData.articles_per_day}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          articles_per_day: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="label">Scheduled Time (UTC)</label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <select
                        className="select"
                        value={formData.scheduled_hour}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            scheduled_hour: e.target.value,
                          })
                        }
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>
                            {i.toString().padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                      <span style={{ alignSelf: "center" }}>:</span>
                      <select
                        className="select"
                        value={formData.scheduled_minute}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            scheduled_minute: e.target.value,
                          })
                        }
                      >
                        {Array.from({ length: 60 }, (_, i) => (
                          <option key={i} value={i}>
                            {i.toString().padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Word Count</label>
                    <select
                      className="select"
                      value={formData.word_count}
                      onChange={(e) =>
                        setFormData({ ...formData, word_count: e.target.value })
                      }
                    >
                      <option value="500">Short (~500 words)</option>
                      <option value="1000">Medium (~1000 words)</option>
                      <option value="1500">Long (~1500 words)</option>
                      <option value="2000">Extra Long (~2000 words)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="label">Tone</label>
                    <select
                      className="select"
                      value={formData.tone}
                      onChange={(e) =>
                        setFormData({ ...formData, tone: e.target.value })
                      }
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                      <option value="friendly">Friendly</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="label">AI Model</label>
                    <select
                      className="select"
                      value={formData.ai_model}
                      onChange={(e) =>
                        setFormData({ ...formData, ai_model: e.target.value })
                      }
                    >
                      <option value="">System Default</option>
                      <optgroup label="GPT-4o">
                        <option value="gpt-4o">GPT-4o</option>
                        <option value="gpt-4o-mini">
                          GPT-4o Mini (faster)
                        </option>
                      </optgroup>
                      <optgroup label="GPT-4.1">
                        <option value="gpt-4.1">GPT-4.1</option>
                        <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
                        <option value="gpt-4.1-nano">
                          GPT-4.1 Nano (fastest)
                        </option>
                      </optgroup>
                      <optgroup label="o-series (Reasoning)">
                        <option value="o3">o3</option>
                        <option value="o3-mini">o3 Mini</option>
                        <option value="o4-mini">o4 Mini</option>
                      </optgroup>
                    </select>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                        marginTop: "0.25rem",
                      }}
                    >
                      Select the OpenAI model for article generation
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="label">Priority</label>
                    <input
                      type="number"
                      className="input"
                      min="0"
                      max="10"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                    />
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                        marginTop: "0.25rem",
                      }}
                    >
                      Higher priority schedules run first
                    </p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Default Topic/Theme</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.default_topic}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        default_topic: e.target.value,
                      })
                    }
                    placeholder="e.g., Latest Technology Trends"
                  />
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      marginTop: "0.25rem",
                    }}
                  >
                    AI will generate article topics based on this theme
                  </p>
                </div>

                <div className="form-group">
                  <label className="label">Target Keywords</label>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <input
                      type="text"
                      className="input"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddKeyword())
                      }
                      placeholder="Add keyword and press Enter"
                    />
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "var(--surface)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "0.5rem",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <div
                    style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                  >
                    {formData.target_keywords.map((keyword) => (
                      <span
                        key={keyword}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "1rem",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          background: "#dbeafe",
                          color: "#1e40af",
                          cursor: "pointer",
                        }}
                        onClick={() => handleRemoveKeyword(keyword)}
                      >
                        {keyword} ×
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "2rem",
                    flexWrap: "wrap",
                    marginTop: "1rem",
                  }}
                >
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
                      checked={formData.generate_image}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          generate_image: e.target.checked,
                        })
                      }
                      style={{ width: "18px", height: "18px" }}
                    />
                    <span>Generate Featured Image</span>
                  </label>

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
                      checked={formData.auto_publish}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          auto_publish: e.target.checked,
                        })
                      }
                      style={{ width: "18px", height: "18px" }}
                    />
                    <span>Auto-publish Articles</span>
                  </label>

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
                      checked={formData.is_enabled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_enabled: e.target.checked,
                        })
                      }
                      style={{ width: "18px", height: "18px" }}
                    />
                    <span>Enable Schedule</span>
                  </label>
                </div>

                {/* Social Media Auto-Post Section */}
                <div
                  style={{
                    marginTop: "1.5rem",
                    padding: "1rem",
                    background: "var(--bg-secondary)",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <Share2 size={20} />
                    <h4 style={{ margin: 0, fontWeight: 600 }}>
                      Social Media Auto-Post
                    </h4>
                  </div>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      marginBottom: "1rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.auto_post_social}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          auto_post_social: e.target.checked,
                        })
                      }
                      style={{ width: "18px", height: "18px" }}
                    />
                    <span>
                      Auto-post to social media when article is published
                    </span>
                  </label>

                  {formData.auto_post_social && (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="label">
                        Select Social Media Account
                      </label>
                      {socialMediaConfigs.length === 0 ? (
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.875rem",
                          }}
                        >
                          No social media accounts linked to this tenant.{" "}
                          <Link
                            href={`/dashboard/tenants/${tenantId}/social-media`}
                            style={{ color: "var(--primary-color)" }}
                          >
                            Configure social media
                          </Link>
                        </p>
                      ) : (
                        <select
                          className="select"
                          value={formData.social_media_config_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              social_media_config_id: e.target.value,
                            })
                          }
                          required={formData.auto_post_social}
                        >
                          <option value="">Select account...</option>
                          {socialMediaConfigs.map((config) => (
                            <option key={config.id} value={config.id}>
                              {config.platform === "facebook_page" && (
                                <span>📘 </span>
                              )}
                              {config.platform === "instagram" && (
                                <span>📷 </span>
                              )}
                              {config.account_name} (
                              {config.platform.replace("_", " ")})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>

                <div
                  style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}
                >
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.5rem",
                      background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                      color: "white",
                      border: "none",
                      borderRadius: "0.75rem",
                      fontWeight: 600,
                      cursor: saving ? "not-allowed" : "pointer",
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving
                      ? "Saving..."
                      : editingConfig
                        ? "Update Schedule"
                        : "Create Schedule"}
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

          {/* Tabs */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setActiveTab("configs")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.25rem",
                  background:
                    activeTab === "configs"
                      ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                      : "var(--surface)",
                  color:
                    activeTab === "configs" ? "white" : "var(--text-primary)",
                  border:
                    activeTab === "configs"
                      ? "none"
                      : "1px solid var(--border-color)",
                  borderRadius: "0.75rem",
                  fontWeight: activeTab === "configs" ? 600 : 500,
                  cursor: "pointer",
                }}
              >
                Schedules ({configs.length})
              </button>
              <button
                onClick={() => setActiveTab("logs")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.25rem",
                  background:
                    activeTab === "logs"
                      ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                      : "var(--surface)",
                  color: activeTab === "logs" ? "white" : "var(--text-primary)",
                  border:
                    activeTab === "logs"
                      ? "none"
                      : "1px solid var(--border-color)",
                  borderRadius: "0.75rem",
                  fontWeight: activeTab === "logs" ? 600 : 500,
                  cursor: "pointer",
                }}
              >
                Recent Logs ({logs.length})
              </button>
            </div>
          </div>

          {/* Configs Table */}
          {activeTab === "configs" && (
            <div className="card">
              {configs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <Calendar
                    size={48}
                    style={{
                      color: "var(--text-secondary)",
                      marginBottom: "1rem",
                    }}
                  />
                  <p style={{ color: "var(--text-secondary)" }}>
                    No scheduling configurations yet.
                  </p>
                  <button
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.5rem",
                      background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                      color: "white",
                      border: "none",
                      borderRadius: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      marginTop: "1rem",
                    }}
                    onClick={() => setShowForm(true)}
                  >
                    <Plus size={20} />
                    Create Your First Schedule
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px solid var(--border-color)",
                        }}
                      >
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>
                          Category
                        </th>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>
                          Schedule
                        </th>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>
                          Articles/Day
                        </th>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>
                          Total Generated
                        </th>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>
                          Status
                        </th>
                        <th style={{ padding: "0.75rem", textAlign: "right" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {configs.map((config) => (
                        <tr
                          key={config.id}
                          style={{
                            borderBottom: "1px solid var(--border-color)",
                          }}
                        >
                          <td style={{ padding: "0.75rem" }}>
                            <strong>{config.category_name || "Unknown"}</strong>
                            {config.default_topic && (
                              <div
                                style={{
                                  fontSize: "0.875rem",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {config.default_topic}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "0.75rem" }}>
                            <Clock
                              size={14}
                              style={{
                                display: "inline",
                                marginRight: "0.25rem",
                                verticalAlign: "middle",
                              }}
                            />
                            {formatTime(
                              config.scheduled_hour,
                              config.scheduled_minute,
                            )}
                          </td>
                          <td style={{ padding: "0.75rem" }}>
                            {config.articles_per_day}
                          </td>
                          <td style={{ padding: "0.75rem" }}>
                            {config.total_articles_generated || 0}
                          </td>
                          <td style={{ padding: "0.75rem" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.375rem",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "1rem",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                background: config.is_enabled
                                  ? "#d1fae5"
                                  : "#f3f4f6",
                                color: config.is_enabled
                                  ? "#065f46"
                                  : "#6b7280",
                              }}
                            >
                              {config.is_enabled ? "Active" : "Paused"}
                            </span>
                          </td>
                          <td
                            style={{ padding: "0.75rem", textAlign: "right" }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: "0.5rem",
                                justifyContent: "flex-end",
                              }}
                            >
                              <button
                                style={{
                                  padding: "0.5rem",
                                  background: "var(--surface)",
                                  color: "var(--text-secondary)",
                                  border: "1px solid var(--border-color)",
                                  borderRadius: "0.5rem",
                                  cursor:
                                    triggering === config.id
                                      ? "not-allowed"
                                      : "pointer",
                                  opacity: triggering === config.id ? 0.7 : 1,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                onClick={() => handleTrigger(config.id)}
                                disabled={triggering === config.id}
                                title="Trigger generation now"
                              >
                                {triggering === config.id ? (
                                  <RefreshCw size={16} className="spin" />
                                ) : (
                                  <Play size={16} />
                                )}
                              </button>
                              <button
                                style={{
                                  padding: "0.5rem",
                                  background: "var(--surface)",
                                  color: "var(--text-secondary)",
                                  border: "1px solid var(--border-color)",
                                  borderRadius: "0.5rem",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                onClick={() => handleToggleEnabled(config)}
                                title={config.is_enabled ? "Pause" : "Enable"}
                              >
                                {config.is_enabled ? (
                                  <Pause size={16} />
                                ) : (
                                  <Play size={16} />
                                )}
                              </button>
                              <button
                                style={{
                                  padding: "0.5rem",
                                  background:
                                    "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "0.5rem",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                onClick={() => handleEdit(config)}
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                style={{
                                  padding: "0.5rem",
                                  background: "#fee2e2",
                                  color: "#991b1b",
                                  border: "1px solid #fecaca",
                                  borderRadius: "0.5rem",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                onClick={() => handleDelete(config.id)}
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Logs Table */}
          {activeTab === "logs" && (
            <div className="card">
              {logs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <Clock
                    size={48}
                    style={{
                      color: "var(--text-secondary)",
                      marginBottom: "1rem",
                    }}
                  />
                  <p style={{ color: "var(--text-secondary)" }}>
                    No generation logs yet.
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px solid var(--border-color)",
                        }}
                      >
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>
                          Status
                        </th>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>
                          Category
                        </th>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>
                          Topic
                        </th>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>
                          Article
                        </th>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>
                          Time
                        </th>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>
                          Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr
                          key={log.id}
                          style={{
                            borderBottom: "1px solid var(--border-color)",
                          }}
                        >
                          <td style={{ padding: "0.75rem" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              {getStatusIcon(log.status)}
                              <span style={{ textTransform: "capitalize" }}>
                                {log.status}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "0.75rem" }}>
                            {log.category_name || "Unknown"}
                          </td>
                          <td style={{ padding: "0.75rem" }}>
                            <div
                              style={{
                                maxWidth: "200px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={log.topic_used}
                            >
                              {log.topic_used || "-"}
                            </div>
                            {log.error_message && (
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--danger-color)",
                                  marginTop: "0.25rem",
                                }}
                              >
                                {log.error_message}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "0.75rem" }}>
                            {log.article_id ? (
                              <Link
                                href={`/dashboard/tenants/${tenantId}/articles/${log.article_id}`}
                              >
                                <span
                                  style={{
                                    color: "var(--primary-color)",
                                    cursor: "pointer",
                                  }}
                                >
                                  #{log.article_id}
                                </span>
                              </Link>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td style={{ padding: "0.75rem" }}>
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td style={{ padding: "0.75rem" }}>
                            {log.generation_time_ms
                              ? `${(log.generation_time_ms / 1000).toFixed(1)}s`
                              : "-"}
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
      </DashboardLayout>
    </ProtectedRoute>
  );
}
