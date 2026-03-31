import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { vercelService } from "@/lib/vercelService";
import { authService } from "@/lib/authService";
import {
  Rocket,
  Github,
  ExternalLink,
  Tag,
  Globe,
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.replace("/login");
      return;
    }
    loadTemplates(1);
  }, []);

  const loadTemplates = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await vercelService.listPublicTemplates({
        page,
        per_page: 20,
      });
      setTemplates(data.templates || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  /* derive all unique tags for filter */
  const allTags = [...new Set(templates.flatMap((t) => t.tags || []))].sort();

  /* filtered list */
  const filtered = templates.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q) ||
      (t.tags || []).some((tag) => tag.toLowerCase().includes(q));
    const matchesTag = !selectedTag || (t.tags || []).includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <DashboardLayout>
      <div>
        {/* ── Header ─────────────────────────── */}
        <div style={{ marginBottom: "1.75rem" }}>
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
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Rocket size={24} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: "bold" }}>
                Templates
              </h1>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  margin: 0,
                }}
              >
                Ready-to-deploy frontend templates — pick one and launch your
                site in seconds
              </p>
            </div>
          </div>
        </div>

        {/* ── Search &amp; Filter ─────────────────── */}
        <div
          className="card"
          style={{
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: "1 1 240px",
              minWidth: 200,
            }}
          >
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-secondary)",
              }}
            />
            <input
              type="text"
              placeholder="Search templates…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem 0.55rem 2.25rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--border-color)",
                fontSize: "0.875rem",
                background: "var(--background)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          {allTags.length > 0 && (
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              <button
                onClick={() => setSelectedTag("")}
                style={{
                  padding: "0.3rem 0.7rem",
                  borderRadius: 9999,
                  border: "1px solid var(--border-color)",
                  background: !selectedTag
                    ? "var(--primary-color)"
                    : "var(--background)",
                  color: !selectedTag ? "white" : "var(--text-secondary)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                  style={{
                    padding: "0.3rem 0.7rem",
                    borderRadius: 9999,
                    border: "1px solid var(--border-color)",
                    background:
                      selectedTag === tag
                        ? "var(--primary-color)"
                        : "var(--background)",
                    color:
                      selectedTag === tag ? "white" : "var(--text-secondary)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Content ─────────────────────────── */}
        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : error ? (
          <div
            className="card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1.5rem",
              borderLeft: "4px solid var(--danger-color)",
            }}
          >
            <AlertCircle size={22} color="var(--danger-color)" />
            <span style={{ color: "var(--danger-color)" }}>{error}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: "center",
              padding: "4rem 1rem",
            }}
          >
            <Globe
              size={48}
              style={{
                margin: "0 auto 1rem",
                opacity: 0.3,
                color: "var(--text-secondary)",
              }}
            />
            <div
              style={{
                fontWeight: 600,
                fontSize: "1.1rem",
                marginBottom: "0.4rem",
              }}
            >
              {search || selectedTag
                ? "No templates match your filters"
                : "No templates available yet"}
            </div>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
                maxWidth: 400,
                margin: "0 auto",
              }}
            >
              {search || selectedTag
                ? "Try adjusting your search or tag filter."
                : "Templates shared by the platform admin will appear here. Check back soon!"}
            </p>
          </div>
        ) : (
          <>
            {/* ── Template Grid ──────────────────── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {filtered.map((tpl) => (
                <div
                  key={tpl.id}
                  className="card"
                  style={{
                    padding: 0,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    transition: "box-shadow 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 8px 32px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.transform = "";
                  }}
                >
                  {/* preview image area */}
                  {(() => {
                    // Prefer custom_domain, then preview_url; skip vercel.com deploy links
                    const rawUrl = tpl.custom_domain || tpl.preview_url;
                    const screenshotUrl =
                      rawUrl && !rawUrl.includes("vercel.com/new")
                        ? rawUrl
                        : null;
                    return screenshotUrl ? (
                      <a
                        href={screenshotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "block",
                          height: 200,
                          background: "#f1f5f9",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={`https://api.microlink.io/?url=${encodeURIComponent(screenshotUrl)}&screenshot=true&meta=false&embed=screenshot.url`}
                          alt={`${tpl.name} preview`}
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "top",
                            display: "block",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "none",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                              "linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%)",
                            color: "#7c3aed",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            gap: 6,
                          }}
                        >
                          <ExternalLink size={16} /> Live Preview
                        </div>
                        {/* hover overlay */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0,0,0,0.35)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: 0,
                            transition: "opacity 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.opacity = "1")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.opacity = "0")
                          }
                        >
                          <span
                            style={{
                              color: "white",
                              fontWeight: 600,
                              fontSize: "0.85rem",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <ExternalLink size={16} /> Visit Site
                          </span>
                        </div>
                      </a>
                    ) : (
                      <div
                        style={{
                          height: 120,
                          background:
                            "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Globe
                          size={36}
                          color="var(--text-secondary)"
                          style={{ opacity: 0.3 }}
                        />
                      </div>
                    );
                  })()}

                  {/* body */}
                  <div
                    style={{
                      padding: "1.25rem",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        marginBottom: "0.35rem",
                      }}
                    >
                      {tpl.name}
                    </h3>
                    {tpl.description && (
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-secondary)",
                          marginBottom: "0.75rem",
                          lineHeight: 1.5,
                          flex: 1,
                        }}
                      >
                        {tpl.description}
                      </p>
                    )}
                    {/* tags */}
                    {tpl.tags?.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.3rem",
                          flexWrap: "wrap",
                          marginBottom: "1rem",
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

                    {/* action buttons */}
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                        marginTop: "auto",
                      }}
                    >
                      {tpl.vercel_deploy_url && (
                        <a
                          href={tpl.vercel_deploy_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: "0.82rem",
                            textDecoration: "none",
                          }}
                        >
                          <Rocket size={14} />
                          Deploy to Vercel
                        </a>
                      )}
                      {tpl.github_repo_url && (
                        <a
                          href={tpl.github_repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: "0.82rem",
                            textDecoration: "none",
                            color: "var(--text-primary)",
                          }}
                        >
                          <Github size={14} />
                          View Source
                        </a>
                      )}
                      {(tpl.custom_domain || tpl.preview_url) && (
                        <a
                          href={tpl.custom_domain || tpl.preview_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: "0.82rem",
                            textDecoration: "none",
                            color: "var(--text-primary)",
                          }}
                        >
                          <ArrowUpRight size={14} />
                          Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Pagination ────────────────────── */}
            {pagination && pagination.pages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginTop: "2rem",
                }}
              >
                <button
                  className="btn"
                  disabled={pagination.page <= 1}
                  onClick={() => loadTemplates(pagination.page - 1)}
                  style={{ padding: "0.45rem 0.65rem" }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  className="btn"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => loadTemplates(pagination.page + 1)}
                  style={{ padding: "0.45rem 0.65rem" }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
