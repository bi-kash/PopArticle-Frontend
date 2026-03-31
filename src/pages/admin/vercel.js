import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminRoute from "@/components/AdminRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { vercelService } from "@/lib/vercelService";
import {
  Settings,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Edit3,
  ExternalLink,
  Github,
  Globe,
  AlertCircle,
  CheckCircle,
  X,
  Tag,
  Save,
  Server,
  RefreshCw,
} from "lucide-react";

/* ─── tiny toast ──────────────────────────────────────────── */
function Toast({ message, type, onClose }) {
  if (!message) return null;
  const bg = type === "error" ? "#fef2f2" : "#f0fdf4";
  const border = type === "error" ? "#fca5a5" : "#86efac";
  const color = type === "error" ? "#dc2626" : "#16a34a";
  const Icon = type === "error" ? AlertCircle : CheckCircle;
  return (
    <div
      style={{
        position: "fixed",
        top: 80,
        right: 24,
        zIndex: 9999,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "0.75rem",
        padding: "0.875rem 1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        animation: "dl-dd-in 0.2s ease",
        maxWidth: 420,
      }}
    >
      <Icon size={18} color={color} />
      <span style={{ fontSize: "0.85rem", color, flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 2,
        }}
      >
        <X size={14} color={color} />
      </button>
    </div>
  );
}

/* ─── section wrapper ─────────────────────────────────────── */
function Section({ title, icon: Icon, color, children }) {
  return (
    <div
      className="card"
      style={{ padding: "1.75rem", marginBottom: "1.5rem" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "0.625rem",
            background: color + "20",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} color={color} />
        </div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════════════════ */
export default function AdminVercelPage() {
  const router = useRouter();

  /* ─ toast ─ */
  const [toast, setToast] = useState({ message: "", type: "" });
  const flash = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  /* ─ config state ─ */
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configForm, setConfigForm] = useState({
    vercel_access_token: "",
    vercel_team_id: "",
    github_token: "",
    github_org: "",
  });
  const [configEditing, setConfigEditing] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);

  /* ─ templates state ─ */
  const [templates, setTemplates] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templateModal, setTemplateModal] = useState(null); // null | "create" | template obj
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    github_repo_url: "",
    vercel_deploy_url: "",
    preview_url: "",
    custom_domain: "",
    tags: "",
    is_public: false,
  });
  const [templateSaving, setTemplateSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  /* ─ load ─ */
  useEffect(() => {
    loadConfig();
    loadTemplates();
  }, []);

  const loadConfig = async () => {
    try {
      setConfigLoading(true);
      const data = await vercelService.getVercelConfig();
      setConfig(data.config);
    } catch (err) {
      if (err.response?.status === 403) {
        router.replace("/dashboard");
        return;
      }
      flash(
        err.response?.data?.error || "Failed to load Vercel config",
        "error",
      );
    } finally {
      setConfigLoading(false);
    }
  };

  const loadTemplates = async (page = 1) => {
    try {
      setTemplatesLoading(true);
      const data = await vercelService.listAllTemplates({ page, per_page: 20 });
      setTemplates(data.templates || []);
      setPagination(data.pagination || null);
    } catch (err) {
      if (err.response?.status === 403) {
        router.replace("/dashboard");
        return;
      }
      flash(err.response?.data?.error || "Failed to load templates", "error");
    } finally {
      setTemplatesLoading(false);
    }
  };

  /* ─ config handlers ─ */
  const handleConfigSave = async () => {
    if (!configForm.vercel_access_token.trim()) {
      flash("Vercel access token is required", "error");
      return;
    }
    try {
      setConfigSaving(true);
      if (config && configEditing) {
        const updates = {};
        if (configForm.vercel_access_token)
          updates.vercel_access_token = configForm.vercel_access_token;
        if (configForm.vercel_team_id)
          updates.vercel_team_id = configForm.vercel_team_id;
        if (configForm.github_token)
          updates.github_token = configForm.github_token;
        if (configForm.github_org) updates.github_org = configForm.github_org;
        await vercelService.updateVercelConfig(config.id, updates);
        flash("Vercel config updated");
      } else {
        await vercelService.createVercelConfig(configForm);
        flash("Vercel config created");
      }
      setConfigEditing(false);
      setConfigForm({
        vercel_access_token: "",
        vercel_team_id: "",
        github_token: "",
        github_org: "",
      });
      await loadConfig();
    } catch (err) {
      flash(err.response?.data?.error || "Failed to save config", "error");
    } finally {
      setConfigSaving(false);
    }
  };

  const handleConfigDelete = async () => {
    if (!config) return;
    if (!window.confirm("Delete the Vercel config? This cannot be undone."))
      return;
    try {
      await vercelService.deleteVercelConfig(config.id);
      flash("Vercel config deleted");
      setConfig(null);
    } catch (err) {
      flash(err.response?.data?.error || "Failed to delete config", "error");
    }
  };

  /* ─ template handlers ─ */
  const openTemplateModal = (mode) => {
    if (mode === "create") {
      setTemplateForm({
        name: "",
        description: "",
        github_repo_url: "",
        vercel_deploy_url: "",
        preview_url: "",
        custom_domain: "",
        tags: "",
        is_public: false,
      });
      setTemplateModal("create");
    } else {
      // edit existing
      setTemplateForm({
        name: mode.name || "",
        description: mode.description || "",
        github_repo_url: mode.github_repo_url || "",
        vercel_deploy_url: mode.vercel_deploy_url || "",
        preview_url: mode.preview_url || "",
        custom_domain: mode.custom_domain || "",
        tags: (mode.tags || []).join(", "),
        is_public: mode.is_public || false,
      });
      setTemplateModal(mode);
    }
  };

  const handleTemplateSave = async () => {
    if (!templateForm.name.trim() || !templateForm.github_repo_url.trim()) {
      flash("Name and GitHub repo URL are required", "error");
      return;
    }
    const payload = {
      name: templateForm.name.trim(),
      github_repo_url: templateForm.github_repo_url.trim(),
      description: templateForm.description.trim() || undefined,
      vercel_deploy_url: templateForm.vercel_deploy_url.trim() || undefined,
      preview_url: templateForm.preview_url.trim() || undefined,
      custom_domain: templateForm.custom_domain.trim() || undefined,
      tags: templateForm.tags
        ? templateForm.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
      is_public: templateForm.is_public,
    };

    try {
      setTemplateSaving(true);
      if (templateModal === "create") {
        await vercelService.createTemplate(payload);
        flash("Template created");
      } else {
        await vercelService.updateTemplate(templateModal.id, payload);
        flash("Template updated");
      }
      setTemplateModal(null);
      await loadTemplates(pagination?.page || 1);
    } catch (err) {
      flash(err.response?.data?.error || "Failed to save template", "error");
    } finally {
      setTemplateSaving(false);
    }
  };

  const handleTogglePublish = async (tpl) => {
    try {
      if (tpl.is_public) {
        await vercelService.unpublishTemplate(tpl.id);
        flash(`"${tpl.name}" unpublished`);
      } else {
        await vercelService.publishTemplate(tpl.id);
        flash(`"${tpl.name}" published`);
      }
      await loadTemplates(pagination?.page || 1);
    } catch (err) {
      flash(err.response?.data?.error || "Failed to update template", "error");
    }
  };

  const handleDeleteTemplate = async (tpl) => {
    if (!window.confirm(`Delete template "${tpl.name}"?`)) return;
    try {
      await vercelService.deleteTemplate(tpl.id);
      flash("Template deleted");
      await loadTemplates(pagination?.page || 1);
    } catch (err) {
      flash(err.response?.data?.error || "Failed to delete template", "error");
    }
  };

  /* ─ input helper ─ */
  const inputStyle = {
    width: "100%",
    padding: "0.625rem 0.875rem",
    borderRadius: "0.5rem",
    border: "1px solid var(--border-color)",
    fontSize: "0.875rem",
    background: "var(--background)",
    color: "var(--text-primary)",
  };
  const labelStyle = {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 600,
    marginBottom: "0.3rem",
    color: "var(--text-secondary)",
  };

  return (
    <AdminRoute>
      <DashboardLayout>
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "" })}
        />

        {/* ── Header ──────────────────────────── */}
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.4rem",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "0.75rem",
                background: "linear-gradient(135deg, #000, #333)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Server size={24} color="white" />
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
              Vercel &amp; Templates
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage your Vercel integration and curate frontend templates for
            users to deploy
          </p>
        </div>

        {/* ═══ Vercel Config ═══════════════════════════════════════════════ */}
        <Section title="Vercel Configuration" icon={Settings} color="#000">
          {configLoading ? (
            <div className="loading">
              <div className="spinner" />
            </div>
          ) : config && !configEditing ? (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div>
                  <div style={labelStyle}>Team ID</div>
                  <div style={{ fontSize: "0.9rem" }}>
                    {config.vercel_team_id || "—"}
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>GitHub Org</div>
                  <div style={{ fontSize: "0.9rem" }}>
                    {config.github_org || "—"}
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>Status</div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      padding: "0.2rem 0.6rem",
                      borderRadius: 9999,
                      background: config.is_active ? "#dcfce7" : "#fee2e2",
                      color: config.is_active ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {config.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.625rem" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setConfigEditing(true);
                    setConfigForm({
                      vercel_access_token: "",
                      vercel_team_id: config.vercel_team_id || "",
                      github_token: "",
                      github_org: config.github_org || "",
                    });
                  }}
                >
                  <Edit3 size={14} style={{ marginRight: 6 }} />
                  Edit Config
                </button>
                <button
                  className="btn"
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    border: "1px solid #fca5a5",
                  }}
                  onClick={handleConfigDelete}
                >
                  <Trash2 size={14} style={{ marginRight: 6 }} />
                  Delete
                </button>
              </div>
            </div>
          ) : (
            /* create / edit form */
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Vercel Access Token{" "}
                    <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    style={inputStyle}
                    type="password"
                    placeholder="tok_vercel_…"
                    value={configForm.vercel_access_token}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        vercel_access_token: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Vercel Team ID</label>
                  <input
                    style={inputStyle}
                    placeholder="team_abc123"
                    value={configForm.vercel_team_id}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        vercel_team_id: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>GitHub Token</label>
                  <input
                    style={inputStyle}
                    type="password"
                    placeholder="ghp_…"
                    value={configForm.github_token}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        github_token: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>GitHub Org / User</label>
                  <input
                    style={inputStyle}
                    placeholder="my-org"
                    value={configForm.github_org}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        github_org: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.625rem" }}>
                <button
                  className="btn btn-primary"
                  disabled={configSaving}
                  onClick={handleConfigSave}
                >
                  <Save size={14} style={{ marginRight: 6 }} />
                  {configSaving
                    ? "Saving…"
                    : configEditing
                      ? "Update Config"
                      : "Create Config"}
                </button>
                {configEditing && (
                  <button
                    className="btn"
                    onClick={() => setConfigEditing(false)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </Section>

        {/* ═══ Templates ══════════════════════════════════════════════════ */}
        <Section title="Frontend Templates" icon={Globe} color="#3b82f6">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                margin: 0,
              }}
            >
              {templates.length} template{templates.length !== 1 ? "s" : ""}
              {pagination
                ? ` (page ${pagination.page} of ${pagination.pages})`
                : ""}
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="btn"
                disabled={syncing}
                onClick={async () => {
                  try {
                    setSyncing(true);
                    const data = await vercelService.syncTemplates();
                    flash(
                      data.message ||
                        `Synced ${data.total} template(s) (${data.created} created, ${data.updated} updated)`,
                    );
                    await loadTemplates(pagination?.page || 1);
                  } catch (err) {
                    flash(
                      err.response?.data?.error ||
                        "Failed to sync templates from Vercel",
                      "error",
                    );
                  } finally {
                    setSyncing(false);
                  }
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <RefreshCw
                  size={14}
                  style={
                    syncing ? { animation: "spin 1s linear infinite" } : {}
                  }
                />
                {syncing ? "Syncing…" : "Sync from Vercel"}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => openTemplateModal("create")}
              >
                <Plus size={14} style={{ marginRight: 6 }} />
                New Template
              </button>
            </div>
          </div>

          {templatesLoading ? (
            <div className="loading">
              <div className="spinner" />
            </div>
          ) : templates.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 1rem",
                color: "var(--text-secondary)",
              }}
            >
              <Globe
                size={40}
                style={{ marginBottom: "0.75rem", opacity: 0.4 }}
              />
              <div style={{ fontWeight: 600, marginBottom: "0.3rem" }}>
                No templates yet
              </div>
              <div style={{ fontSize: "0.85rem" }}>
                Create your first frontend template for users to deploy.
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    style={{
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.75rem",
                      padding: "1.25rem",
                      background: "var(--background)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "1rem",
                    }}
                  >
                    {/* info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.35rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: "1rem" }}>
                          {tpl.name}
                        </span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            padding: "0.1rem 0.5rem",
                            borderRadius: 9999,
                            background: tpl.is_public ? "#dcfce7" : "#f3f4f6",
                            color: tpl.is_public ? "#16a34a" : "#6b7280",
                          }}
                        >
                          {tpl.is_public ? "Public" : "Private"}
                        </span>
                      </div>
                      {tpl.description && (
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {tpl.description}
                        </div>
                      )}
                      {/* tags */}
                      {tpl.tags?.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            gap: "0.35rem",
                            flexWrap: "wrap",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {tpl.tags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 3,
                                fontSize: "0.7rem",
                                fontWeight: 500,
                                padding: "0.15rem 0.5rem",
                                borderRadius: 9999,
                                background: "#ede9fe",
                                color: "#7c3aed",
                              }}
                            >
                              <Tag size={10} /> {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* links */}
                      <div
                        style={{
                          display: "flex",
                          gap: "0.75rem",
                          fontSize: "0.78rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {tpl.github_repo_url && (
                          <a
                            href={tpl.github_repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              color: "var(--primary-color)",
                            }}
                          >
                            <Github size={13} /> Repo
                          </a>
                        )}
                        {(tpl.custom_domain || tpl.preview_url) && (
                          <a
                            href={tpl.custom_domain || tpl.preview_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              color: "var(--primary-color)",
                            }}
                          >
                            <ExternalLink size={13} />{" "}
                            {tpl.custom_domain ? "Domain" : "Preview"}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* actions */}
                    <div
                      style={{
                        display: "flex",
                        gap: "0.4rem",
                        flexShrink: 0,
                      }}
                    >
                      <button
                        title={tpl.is_public ? "Unpublish" : "Publish"}
                        onClick={() => handleTogglePublish(tpl)}
                        style={{
                          background: "none",
                          border: "1px solid var(--border-color)",
                          borderRadius: "0.5rem",
                          padding: "0.45rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {tpl.is_public ? (
                          <EyeOff size={15} color="#f59e0b" />
                        ) : (
                          <Eye size={15} color="#16a34a" />
                        )}
                      </button>
                      <button
                        title="Edit"
                        onClick={() => openTemplateModal(tpl)}
                        style={{
                          background: "none",
                          border: "1px solid var(--border-color)",
                          borderRadius: "0.5rem",
                          padding: "0.45rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Edit3 size={15} color="#3b82f6" />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => handleDeleteTemplate(tpl)}
                        style={{
                          background: "none",
                          border: "1px solid var(--border-color)",
                          borderRadius: "0.5rem",
                          padding: "0.45rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Trash2 size={15} color="#dc2626" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* pagination */}
              {pagination && pagination.pages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "0.5rem",
                    marginTop: "1.25rem",
                  }}
                >
                  {Array.from(
                    { length: pagination.pages },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => loadTemplates(p)}
                      className="btn"
                      style={{
                        minWidth: 36,
                        fontWeight: p === pagination.page ? 700 : 400,
                        background:
                          p === pagination.page
                            ? "var(--primary-color)"
                            : "var(--background)",
                        color:
                          p === pagination.page
                            ? "white"
                            : "var(--text-primary)",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </Section>

        {/* ═══ Template Modal ═════════════════════════════════════════════ */}
        {templateModal !== null && (
          <>
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9998,
                background: "rgba(15,23,42,0.45)",
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setTemplateModal(null)}
            />
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                zIndex: 9999,
                width: "100%",
                maxWidth: 560,
                maxHeight: "90vh",
                overflow: "auto",
                background: "var(--background)",
                borderRadius: "1rem",
                boxShadow: "0 24px 64px -12px rgba(15,23,42,0.25)",
                padding: "2rem",
                animation: "dl-dd-in 0.2s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                  {templateModal === "create"
                    ? "Create Template"
                    : "Edit Template"}
                </h3>
                <button
                  onClick={() => setTemplateModal(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem",
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Name <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    style={inputStyle}
                    placeholder="Blog Starter"
                    value={templateForm.name}
                    onChange={(e) =>
                      setTemplateForm({ ...templateForm, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    GitHub Repo URL <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    style={inputStyle}
                    placeholder="https://github.com/org/repo"
                    value={templateForm.github_repo_url}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        github_repo_url: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
                    placeholder="A short description for users…"
                    value={templateForm.description}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Vercel Deploy URL</label>
                  <input
                    style={inputStyle}
                    placeholder="https://vercel.com/new/clone?repository-url=…"
                    value={templateForm.vercel_deploy_url}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        vercel_deploy_url: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Preview URL</label>
                  <input
                    style={inputStyle}
                    placeholder="https://my-template.vercel.app"
                    value={templateForm.preview_url}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        preview_url: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Custom Domain</label>
                  <input
                    style={inputStyle}
                    placeholder="https://myblog.com"
                    value={templateForm.custom_domain}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        custom_domain: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Tags (comma-separated)</label>
                  <input
                    style={inputStyle}
                    placeholder="blog, nextjs, tailwind"
                    value={templateForm.tags}
                    onChange={(e) =>
                      setTemplateForm({ ...templateForm, tags: e.target.value })
                    }
                  />
                </div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={templateForm.is_public}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        is_public: e.target.checked,
                      })
                    }
                  />
                  Make publicly visible to users
                </label>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.625rem",
                  marginTop: "1.5rem",
                }}
              >
                <button className="btn" onClick={() => setTemplateModal(null)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  disabled={templateSaving}
                  onClick={handleTemplateSave}
                >
                  <Save size={14} style={{ marginRight: 6 }} />
                  {templateSaving
                    ? "Saving…"
                    : templateModal === "create"
                      ? "Create"
                      : "Save Changes"}
                </button>
              </div>
            </div>
          </>
        )}
      </DashboardLayout>
    </AdminRoute>
  );
}
