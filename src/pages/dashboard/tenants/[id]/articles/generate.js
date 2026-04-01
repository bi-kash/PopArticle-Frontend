import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTenantBySlug } from "@/lib/useTenantBySlug";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { articleService } from "@/lib/articleService";
import { categoryService } from "@/lib/categoryService";
import { subscriptionService } from "@/lib/subscriptionService";
import { authService } from "@/lib/authService";
import { Sparkles, ArrowLeft, AlertCircle } from "lucide-react";

// All available models – order matters for display
const ALL_MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini (faster)", group: "GPT-4o" },
  { value: "gpt-4o", label: "GPT-4o", group: "GPT-4o" },
  { value: "gpt-4.5-preview", label: "GPT-4.5 Preview", group: "GPT-4.5" },
  { value: "gpt-4.1", label: "GPT-4.1", group: "GPT-4.1" },
  { value: "gpt-4.1-mini", label: "GPT-4.1 Mini", group: "GPT-4.1" },
  { value: "gpt-4.1-nano", label: "GPT-4.1 Nano (fastest)", group: "GPT-4.1" },
  { value: "o1", label: "o1", group: "o-series (Reasoning)" },
  { value: "o3", label: "o3", group: "o-series (Reasoning)" },
  { value: "o3-mini", label: "o3 Mini", group: "o-series (Reasoning)" },
  { value: "o4-mini", label: "o4 Mini", group: "o-series (Reasoning)" },
];

export default function GenerateArticle() {
  const router = useRouter();
  const { id: tenantId } = router.query;
  const { tenantId: resolvedTenantId } = useTenantBySlug();
  const [formData, setFormData] = useState({
    topic: "",
    description: "",
    category_id: "",
    keywords: [],
    tone: "professional",
    length: "medium",
    tenant_id: "",
    ai_model: "",
    generate_image: true,
    include_content_images: false,
    additional_context: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (resolvedTenantId) {
      loadCategories();
      setFormData((prev) => ({ ...prev, tenant_id: resolvedTenantId }));
    }
  }, [resolvedTenantId]);

  useEffect(() => {
    loadSubscription();
    const user = authService.getCurrentUser();
    setIsAdmin(!!user?.is_super_admin);
  }, []);

  const loadSubscription = async () => {
    try {
      const data = await subscriptionService.getStatus();
      setSubscription(data);
    } catch (err) {
      console.error("Failed to load subscription:", err);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories({
        tenant_id: resolvedTenantId || tenantId,
      });
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.topic.trim() && !formData.description.trim()) {
      setError("Please provide at least a topic or a description.");
      return;
    }

    setLoading(true);

    try {
      const data = {
        ...formData,
        topic: formData.topic.trim() || undefined,
        description: formData.description.trim() || undefined,
        category_id: formData.category_id
          ? parseInt(formData.category_id)
          : null,
        tenant_id: resolvedTenantId || tenantId,
        ai_model: formData.ai_model || null,
      };

      const response = await articleService.generateArticle(
        data,
        resolvedTenantId || tenantId,
      );
      router.push(
        `/dashboard/tenants/${tenantId}/articles/${response.article.id}`,
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate article");
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = () => {
    if (
      keywordInput.trim() &&
      !formData.keywords.includes(keywordInput.trim())
    ) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter((k) => k !== keyword),
    });
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          <div style={{ marginBottom: "2rem" }}>
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
              Back to Dashboard
            </button>
          </div>

          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "1rem",
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                margin: "0 auto 1rem",
              }}
            >
              <Sparkles size={28} />
            </div>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
              }}
            >
              Generate Article with AI
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Let AI create a high-quality article for you based on your topic
              and preferences
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <form onSubmit={handleSubmit}>
              <div className="card" style={{ marginBottom: "2rem" }}>
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                  }}
                >
                  Article Settings
                </h2>

                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    background: "var(--surface-raised, rgba(16,185,129,0.07))",
                    border: "1px solid rgba(16,185,129,0.25)",
                    marginBottom: "1rem",
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Provide a <strong>topic</strong>, a{" "}
                  <strong>description</strong>, or both. At least one is
                  required.
                </div>

                <div className="form-group">
                  <label className="label">Topic</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    placeholder="e.g., The Future of Artificial Intelligence in Healthcare"
                  />
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                      marginTop: "0.25rem",
                    }}
                  >
                    Main subject for the article. If omitted, the AI infers it
                    from the description.
                  </p>
                </div>

                <div className="form-group">
                  <label className="label">Description</label>
                  <textarea
                    className="input"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    placeholder="e.g., A deep dive into how solar panel efficiency has doubled in the last decade"
                    style={{ resize: "vertical" }}
                  />
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                      marginTop: "0.25rem",
                    }}
                  >
                    Content outline or angle for the article. The AI uses this
                    as additional context for richer generation.
                  </p>
                </div>

                <div className="form-group">
                  <label className="label">Category</label>
                  <select
                    className="select"
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                  >
                    <option value="">Select a category (optional)</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Keywords</label>
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
                      className="btn btn-secondary"
                      onClick={handleAddKeyword}
                    >
                      Add
                    </button>
                  </div>
                  <div
                    style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                  >
                    {formData.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="badge badge-info"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleRemoveKeyword(keyword)}
                      >
                        {keyword} ×
                      </span>
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                      marginTop: "0.25rem",
                    }}
                  >
                    Add relevant keywords to focus the article content
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
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
                    <label className="label">Length</label>
                    <select
                      className="select"
                      value={formData.length}
                      onChange={(e) =>
                        setFormData({ ...formData, length: e.target.value })
                      }
                    >
                      <option value="short">Short (~500 words)</option>
                      <option value="medium">Medium (~1000 words)</option>
                      <option value="long">Long (~2000 words)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">AI Model</label>
                  {/* Subscription usage info */}
                  {subscription && !isAdmin && (
                    <div
                      style={{
                        padding: "0.5rem 0.75rem",
                        borderRadius: "0.5rem",
                        background:
                          subscription.ai_credits_remaining <= 0
                            ? "#fef2f2"
                            : "var(--surface-raised, rgba(99,102,241,0.07))",
                        border: `1px solid ${subscription.ai_credits_remaining <= 0 ? "#fecaca" : "rgba(99,102,241,0.25)"}`,
                        marginBottom: "0.5rem",
                        fontSize: "0.8125rem",
                        color: "var(--text-secondary)",
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      <span>
                        Articles:{" "}
                        <strong>{subscription.articles_used ?? 0}</strong>/
                        {subscription.article_limit ?? 0}
                      </span>
                      <span>
                        AI Credits:{" "}
                        <strong>{subscription.ai_credits_used ?? 0}</strong>/
                        {subscription.ai_credit_limit ?? 0}
                      </span>
                      <span style={{ textTransform: "capitalize" }}>
                        Plan: <strong>{subscription.plan}</strong>
                      </span>
                    </div>
                  )}
                  {subscription &&
                    !isAdmin &&
                    subscription.ai_credits_remaining <= 0 && (
                      <div
                        style={{
                          padding: "0.5rem 0.75rem",
                          borderRadius: "0.5rem",
                          background: "#fef2f2",
                          border: "1px solid #fecaca",
                          marginBottom: "0.5rem",
                          fontSize: "0.8125rem",
                          color: "#991b1b",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <AlertCircle size={14} />
                        You have reached your monthly AI credit limit.{" "}
                        <a
                          href="/dashboard/subscription"
                          style={{ color: "#2563eb", fontWeight: 600 }}
                        >
                          Upgrade your plan
                        </a>
                      </div>
                    )}
                  <select
                    className="select"
                    value={formData.ai_model}
                    onChange={(e) =>
                      setFormData({ ...formData, ai_model: e.target.value })
                    }
                  >
                    <option value="">System Default</option>
                    {(() => {
                      const allowedModels = subscription?.allowed_models;
                      const models =
                        isAdmin || !allowedModels
                          ? ALL_MODELS
                          : ALL_MODELS.filter((m) =>
                              allowedModels.includes(m.value),
                            );
                      const groups = [...new Set(models.map((m) => m.group))];
                      return groups.map((group) => (
                        <optgroup key={group} label={group}>
                          {models
                            .filter((m) => m.group === group)
                            .map((m) => (
                              <option key={m.value} value={m.value}>
                                {m.label}
                              </option>
                            ))}
                        </optgroup>
                      ));
                    })()}
                  </select>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                      marginTop: "0.25rem",
                    }}
                  >
                    {isAdmin
                      ? "Admin: all models available"
                      : subscription?.allowed_models
                        ? `Your ${subscription.plan} plan allows: ${subscription.allowed_models.join(", ")}`
                        : "Select the OpenAI model for article generation"}
                  </p>
                </div>

                <div className="form-group">
                  <label className="label">Additional Context</label>
                  <textarea
                    className="input"
                    value={formData.additional_context}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        additional_context: e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="Optional: Add specific facts, angles, news events, or any details the AI must include in the article..."
                    style={{ resize: "vertical" }}
                  />
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                      marginTop: "0.25rem",
                    }}
                  >
                    Provide extra context, facts, or requirements the AI should
                    prioritize
                  </p>
                </div>

                <div className="form-group">
                  <label className="label">Image Generation Options</label>
                  <div
                    style={{
                      marginTop: "0.5rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
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
                        style={{
                          width: "18px",
                          height: "18px",
                          cursor: "pointer",
                        }}
                      />
                      <span>Generate Featured Image with AI (DALL-E)</span>
                    </label>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-secondary)",
                        marginLeft: "1.75rem",
                      }}
                    >
                      Creates a custom featured image for your article (~$0.08
                      per image)
                    </p>

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
                        checked={formData.include_content_images}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            include_content_images: e.target.checked,
                          })
                        }
                        style={{
                          width: "18px",
                          height: "18px",
                          cursor: "pointer",
                        }}
                      />
                      <span>Include Images Within Content</span>
                    </label>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-secondary)",
                        marginLeft: "1.75rem",
                      }}
                    >
                      Adds relevant images throughout the article content
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.5rem",
                    minWidth: "200px",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "white",
                    border: "none",
                    borderRadius: "0.75rem",
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    justifyContent: "center",
                  }}
                >
                  <Sparkles size={20} />
                  {loading ? "Generating..." : "Generate Article"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/dashboard/tenants/${tenantId}/dashboard`)
                  }
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

              {loading && (
                <div style={{ textAlign: "center", marginTop: "2rem" }}>
                  <div className="spinner" style={{ margin: "0 auto" }}></div>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      marginTop: "1rem",
                    }}
                  >
                    AI is generating your article... This may take a moment.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
