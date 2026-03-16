import { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { affiliateService } from "@/lib/affiliateService";
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  X,
  Link2,
  Tag,
  MousePointerClick,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Code,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  product_name: "",
  affiliate_link: "",
  affiliate_service: "",
  image_url: "",
  notes: "",
  price: "",
  currency: "USD",
  product_url: "",
  tags: "",
  html_snippet: "",
  status: "active",
};

function buildPayload(form) {
  const payload = {
    product_name: form.product_name.trim(),
    affiliate_service: form.affiliate_service.trim() || undefined,
    image_url: form.image_url.trim() || undefined,
    notes: form.notes.trim() || undefined,
    price: form.price.trim() || undefined,
    currency: form.currency.trim() || undefined,
    product_url: form.product_url.trim() || undefined,
    status: form.status,
    tags: form.tags
      ? form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined,
  };

  if (form.html_snippet.trim()) {
    payload.html_snippet = form.html_snippet.trim();
  }
  if (form.affiliate_link.trim()) {
    payload.affiliate_link = form.affiliate_link.trim();
  }

  return payload;
}

// ─── Copy-to-clipboard button ─────────────────────────────────────────────────

function CopyButton({ text, title = "Copy" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for insecure contexts
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={title}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0.25rem",
        color: copied ? "var(--success, #22c55e)" : "var(--text-secondary)",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function LinkModal({ link, onClose, onSaved }) {
  const isEdit = Boolean(link);
  const [form, setForm] = useState(
    isEdit
      ? {
          product_name: link.product_name || "",
          affiliate_link: link.affiliate_link || "",
          affiliate_service: link.affiliate_service || "",
          image_url: link.image_url || "",
          notes: link.notes || "",
          price: link.price || "",
          currency: link.currency || "USD",
          product_url: link.product_url || "",
          tags: (link.tags || []).join(", "),
          html_snippet: "",
          status: link.status || "active",
        }
      : { ...EMPTY_FORM },
  );
  const [useSnippet, setUseSnippet] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleParseSnippet = async () => {
    if (!form.html_snippet.trim()) return;
    setParsing(true);
    setError("");
    try {
      const result = await affiliateService.parseHtml(form.html_snippet);
      const parsed = result.parsed || {};
      setForm((f) => ({
        ...f,
        affiliate_link: parsed.affiliate_link || f.affiliate_link,
        image_url: parsed.image_url || f.image_url,
      }));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to parse snippet.");
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.product_name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!form.affiliate_link.trim() && !form.html_snippet.trim()) {
      setError("Either an affiliate link URL or an HTML snippet is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload(form);
      if (isEdit) {
        await affiliateService.updateLink(link.id, payload);
      } else {
        await affiliateService.createLink(payload);
      }
      onSaved();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          `Failed to ${isEdit ? "update" : "create"} affiliate link.`,
      );
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    border: "1px solid var(--border)",
    borderRadius: "0.375rem",
    background: "var(--surface)",
    color: "var(--text-primary)",
    fontSize: "0.875rem",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 600,
    marginBottom: "0.3rem",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--background, #fff)",
          borderRadius: "0.75rem",
          padding: "1.5rem",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
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
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
            {isEdit ? "Edit Affiliate Link" : "New Affiliate Link"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "flex-start",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "0.375rem",
              padding: "0.75rem",
              marginBottom: "1rem",
              color: "#dc2626",
              fontSize: "0.875rem",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Product name */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>
              Product Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              style={inputStyle}
              value={form.product_name}
              onChange={set("product_name")}
              placeholder="e.g. Wireless Headphones"
              required
            />
          </div>

          {/* Affiliate service */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Affiliate Service</label>
            <input
              style={inputStyle}
              value={form.affiliate_service}
              onChange={set("affiliate_service")}
              placeholder="e.g. Amazon, AliExpress, ShareASale"
            />
          </div>

          {/* Toggle between URL and HTML snippet */}
          <div style={{ marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <button
                type="button"
                onClick={() => setUseSnippet(false)}
                style={{
                  padding: "0.35rem 0.75rem",
                  borderRadius: "0.25rem",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  background: !useSnippet
                    ? "var(--primary, #6366f1)"
                    : "transparent",
                  color: !useSnippet ? "#fff" : "var(--text-secondary)",
                  fontWeight: !useSnippet ? 600 : 400,
                }}
              >
                <Link2
                  size={13}
                  style={{ marginRight: 4, verticalAlign: "middle" }}
                />
                Direct URL
              </button>
              <button
                type="button"
                onClick={() => setUseSnippet(true)}
                style={{
                  padding: "0.35rem 0.75rem",
                  borderRadius: "0.25rem",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  background: useSnippet
                    ? "var(--primary, #6366f1)"
                    : "transparent",
                  color: useSnippet ? "#fff" : "var(--text-secondary)",
                  fontWeight: useSnippet ? 600 : 400,
                }}
              >
                <Code
                  size={13}
                  style={{ marginRight: 4, verticalAlign: "middle" }}
                />
                HTML Snippet
              </button>
            </div>

            {useSnippet ? (
              <div>
                <label style={labelStyle}>HTML Snippet</label>
                <textarea
                  style={{
                    ...inputStyle,
                    minHeight: "80px",
                    resize: "vertical",
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                  }}
                  value={form.html_snippet}
                  onChange={set("html_snippet")}
                  placeholder={'<a href="https://..."><img src="..." /></a>'}
                />
                <button
                  type="button"
                  onClick={handleParseSnippet}
                  disabled={parsing || !form.html_snippet.trim()}
                  style={{
                    marginTop: "0.4rem",
                    padding: "0.35rem 0.75rem",
                    background: "var(--primary, #6366f1)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    opacity: parsing || !form.html_snippet.trim() ? 0.6 : 1,
                  }}
                >
                  {parsing ? (
                    <Loader2
                      size={13}
                      style={{
                        animation: "spin 1s linear infinite",
                        marginRight: 4,
                        verticalAlign: "middle",
                      }}
                    />
                  ) : null}
                  Parse & Fill Fields
                </button>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                    marginTop: "0.25rem",
                  }}
                >
                  Parses the snippet and fills the URL and image fields below.
                </p>
              </div>
            ) : (
              <div>
                <label style={labelStyle}>
                  Affiliate URL <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  style={inputStyle}
                  value={form.affiliate_link}
                  onChange={set("affiliate_link")}
                  placeholder="https://www.amazon.com/dp/...?tag=myref-20"
                  type="url"
                />
              </div>
            )}
          </div>

          {/* After snippet parsed, still allow editing the extracted URL */}
          {useSnippet && form.affiliate_link && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>
                Extracted / Override Affiliate URL
              </label>
              <input
                style={inputStyle}
                value={form.affiliate_link}
                onChange={set("affiliate_link")}
                type="url"
              />
            </div>
          )}

          {/* Image URL */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Image URL</label>
            <input
              style={inputStyle}
              value={form.image_url}
              onChange={set("image_url")}
              placeholder="https://images.example.com/product.jpg"
              type="url"
            />
          </div>

          {/* Price & Currency in a row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <label style={labelStyle}>Price</label>
              <input
                style={inputStyle}
                value={form.price}
                onChange={set("price")}
                placeholder="79.99"
              />
            </div>
            <div>
              <label style={labelStyle}>Currency</label>
              <input
                style={inputStyle}
                value={form.currency}
                onChange={set("currency")}
                placeholder="USD"
                maxLength={6}
              />
            </div>
          </div>

          {/* Product URL (non-affiliate) */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Non-Affiliate Product URL</label>
            <input
              style={inputStyle}
              value={form.product_url}
              onChange={set("product_url")}
              placeholder="https://www.amazon.com/dp/..."
              type="url"
            />
          </div>

          {/* Tags */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input
              style={inputStyle}
              value={form.tags}
              onChange={set("tags")}
              placeholder="electronics, audio, headphones"
            />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }}
              value={form.notes}
              onChange={set("notes")}
              placeholder="Any internal notes about this link..."
            />
          </div>

          {/* Status (edit only) */}
          {isEdit && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Status</label>
              <select
                style={inputStyle}
                value={form.status}
                onChange={set("status")}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.5rem 1.25rem",
                border: "1px solid var(--border)",
                borderRadius: "0.375rem",
                background: "transparent",
                cursor: "pointer",
                fontSize: "0.875rem",
                color: "var(--text-primary)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "0.5rem 1.25rem",
                background: "var(--primary, #6366f1)",
                color: "#fff",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
                opacity: saving ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              {saving && (
                <Loader2
                  size={15}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              )}
              {isEdit ? "Save Changes" : "Create Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({ link, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await affiliateService.deleteLink(link.id);
      onDeleted();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete link.");
      setDeleting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--background, #fff)",
          borderRadius: "0.75rem",
          padding: "1.5rem",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
          }}
        >
          Delete Affiliate Link
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.875rem",
            marginBottom: "0.5rem",
          }}
        >
          Are you sure you want to delete <strong>{link.product_name}</strong>?
          This will also remove all associated click tracking data and cannot be
          undone.
        </p>
        {error && (
          <p
            style={{
              color: "#dc2626",
              fontSize: "0.875rem",
              marginBottom: "0.75rem",
            }}
          >
            {error}
          </p>
        )}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem 1.25rem",
              border: "1px solid var(--border)",
              borderRadius: "0.375rem",
              background: "transparent",
              cursor: "pointer",
              fontSize: "0.875rem",
              color: "var(--text-primary)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: "0.5rem 1.25rem",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              opacity: deleting ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            {deleting && (
              <Loader2
                size={15}
                style={{ animation: "spin 1s linear infinite" }}
              />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Link Card ────────────────────────────────────────────────────────────────

function LinkCard({ link, baseUrl, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const callbackUrl = `${baseUrl}/go/${link.slug}`;

  const statusColor =
    link.status === "active"
      ? { bg: "rgba(34,197,94,0.12)", text: "#16a34a" }
      : { bg: "rgba(239,68,68,0.12)", text: "#dc2626" };

  return (
    <div
      style={{
        background: "var(--background, #fff)",
        border: "1px solid var(--border)",
        borderRadius: "0.625rem",
        overflow: "hidden",
      }}
    >
      {/* Main row */}
      <div style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
        {/* Image / Placeholder */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "0.375rem",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            flexShrink: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {link.image_url ? (
            <img
              src={link.image_url}
              alt={link.product_name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <Link2
              size={22}
              style={{ color: "var(--text-secondary)", opacity: 0.4 }}
            />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flexWrap: "wrap",
              marginBottom: "0.25rem",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "1rem" }}>
              {link.product_name}
            </span>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                padding: "0.15rem 0.5rem",
                borderRadius: "9999px",
                background: statusColor.bg,
                color: statusColor.text,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {link.status}
            </span>
            {link.affiliate_service && (
              <span
                style={{
                  fontSize: "0.7rem",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "9999px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                {link.affiliate_service}
              </span>
            )}
          </div>

          {/* Callback link */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              marginBottom: "0.25rem",
            }}
          >
            <Link2 size={12} />
            <code
              style={{
                background: "var(--surface)",
                padding: "0.1rem 0.35rem",
                borderRadius: "0.2rem",
                fontSize: "0.75rem",
                maxWidth: "260px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {link.callback_link}
            </code>
            <CopyButton text={callbackUrl} title="Copy full callback URL" />
          </div>

          {/* Price */}
          {link.price && (
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              {link.currency || ""} {link.price}
            </div>
          )}
        </div>

        {/* Right: clicks + actions */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          {link.click_count !== undefined && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
              }}
            >
              <MousePointerClick size={13} />
              <span>{link.click_count}</span>
            </div>
          )}
          <div style={{ display: "flex", gap: "0.25rem", marginTop: "auto" }}>
            <button
              onClick={() => setExpanded((v) => !v)}
              title="Details"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.35rem",
                borderRadius: "0.25rem",
                color: "var(--text-secondary)",
              }}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button
              onClick={() => onEdit(link)}
              title="Edit"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.35rem",
                borderRadius: "0.25rem",
                color: "var(--text-secondary)",
              }}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(link)}
              title="Delete"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.35rem",
                borderRadius: "0.25rem",
                color: "#ef4444",
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: "0.875rem 1rem",
            background: "var(--surface)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "0.75rem",
            fontSize: "0.8rem",
          }}
        >
          {link.affiliate_link && (
            <div>
              <div
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "0.2rem",
                  fontWeight: 600,
                }}
              >
                Affiliate URL
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <a
                  href={link.affiliate_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--primary, #6366f1)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "180px",
                  }}
                >
                  {link.affiliate_link}
                </a>
                <ExternalLink size={12} style={{ flexShrink: 0 }} />
              </div>
            </div>
          )}
          <div>
            <div
              style={{
                color: "var(--text-secondary)",
                marginBottom: "0.2rem",
                fontWeight: 600,
              }}
            >
              Callback URL (use in articles)
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
            >
              <code
                style={{
                  fontSize: "0.75rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "180px",
                }}
              >
                {callbackUrl}
              </code>
              <CopyButton text={callbackUrl} title="Copy callback URL" />
            </div>
          </div>
          {link.product_url && (
            <div>
              <div
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "0.2rem",
                  fontWeight: 600,
                }}
              >
                Product URL
              </div>
              <a
                href={link.product_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--primary, #6366f1)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                  maxWidth: "200px",
                }}
              >
                {link.product_url}
              </a>
            </div>
          )}
          {link.slug && (
            <div>
              <div
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "0.2rem",
                  fontWeight: 600,
                }}
              >
                Slug
              </div>
              <code>{link.slug}</code>
            </div>
          )}
          {link.tags?.length > 0 && (
            <div>
              <div
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "0.2rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <Tag size={11} /> Tags
              </div>
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}
              >
                {link.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: "var(--border)",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "9999px",
                      fontSize: "0.7rem",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {link.notes && (
            <div style={{ gridColumn: "1 / -1" }}>
              <div
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "0.2rem",
                  fontWeight: 600,
                }}
              >
                Notes
              </div>
              <div>{link.notes}</div>
            </div>
          )}
          <div>
            <div
              style={{
                color: "var(--text-secondary)",
                marginBottom: "0.2rem",
                fontWeight: 600,
              }}
            >
              Created
            </div>
            <div>{new Date(link.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AffiliateLinksPage() {
  const [links, setLinks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editLink, setEditLink] = useState(null);
  const [deleteLink, setDeleteLink] = useState(null);
  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";

  const loadLinks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { include_clicks: true };
      if (statusFilter !== "all") params.status = statusFilter;
      const data = await affiliateService.getLinks(params);
      setLinks(data.affiliate_links || []);
      setTotalCount(data.total_count ?? (data.affiliate_links || []).length);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load affiliate links.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const handleEdit = (link) => {
    setEditLink(link);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditLink(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditLink(null);
  };

  const handleSaved = () => {
    setShowModal(false);
    setEditLink(null);
    loadLinks();
  };

  const handleDeleteConfirmed = () => {
    setDeleteLink(null);
    loadLinks();
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "0.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "0.25rem",
              }}
            >
              Affiliate Links
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Manage your affiliate links in one place. The same link can be
              used across all your tenant websites via the callback URL.
            </p>
          </div>
          <button
            onClick={handleNew}
            className="btn btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              whiteSpace: "nowrap",
            }}
          >
            <Plus size={18} /> New Affiliate Link
          </button>
        </div>

        {/* Filter bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {["all", "active", "inactive"].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "9999px",
                border: "1px solid var(--border)",
                cursor: "pointer",
                fontSize: "0.8rem",
                background:
                  statusFilter === f
                    ? "var(--primary, #6366f1)"
                    : "transparent",
                color: statusFilter === f ? "#fff" : "var(--text-secondary)",
                fontWeight: statusFilter === f ? 600 : 400,
                textTransform: "capitalize",
              }}
            >
              {f}
            </button>
          ))}
          {!loading && (
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                marginLeft: "auto",
              }}
            >
              {totalCount} link{totalCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "flex-start",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "0.375rem",
              padding: "0.75rem",
              marginBottom: "1rem",
              color: "#dc2626",
              fontSize: "0.875rem",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : links.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              color: "var(--text-secondary)",
            }}
          >
            <Link2
              size={48}
              style={{
                opacity: 0.2,
                marginBottom: "1rem",
                display: "block",
                margin: "0 auto 1rem",
              }}
            />
            <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
              No affiliate links yet
            </p>
            <p style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Add your first affiliate link to start tracking clicks across all
              your websites.
            </p>
            <button
              onClick={handleNew}
              className="btn btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Plus size={16} /> Add Affiliate Link
            </button>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                baseUrl={baseUrl}
                onEdit={handleEdit}
                onDelete={setDeleteLink}
              />
            ))}
          </div>
        )}

        {/* Create / Edit modal */}
        {showModal && (
          <LinkModal
            link={editLink}
            onClose={handleModalClose}
            onSaved={handleSaved}
          />
        )}

        {/* Delete confirmation */}
        {deleteLink && (
          <DeleteModal
            link={deleteLink}
            onClose={() => setDeleteLink(null)}
            onDeleted={handleDeleteConfirmed}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
