import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { tenantService } from "@/lib/tenantService";
import { Building2, Save, ArrowLeft } from "lucide-react";

export default function EditTenant() {
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState({
    name: "",
    primary_domain: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadTenant();
    }
  }, [id]);

  const loadTenant = async () => {
    try {
      setLoading(true);
      const data = await tenantService.getTenant(id);
      const tenant = data.tenant || data;
      setFormData({
        name: tenant.name || "",
        primary_domain: tenant.primary_domain || "",
      });
    } catch (err) {
      console.error("Failed to load tenant:", err);
      setError(err.response?.data?.message || "Failed to load tenant");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await tenantService.updateTenant(id, formData);
      router.push(`/dashboard/tenants/${id}`);
    } catch (err) {
      console.error("Update error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update tenant",
      );
    } finally {
      setSaving(false);
    }
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
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ marginBottom: "2rem" }}>
            <button
              onClick={() => router.push(`/dashboard/tenants/${id}`)}
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
              }}
            >
              <ArrowLeft size={16} />
              Back to Tenant
            </button>
          </div>

          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "1rem",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                margin: "0 auto 1rem",
              }}
            >
              <Building2 size={28} />
            </div>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
              }}
            >
              Edit Tenant
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Update tenant information and settings
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Website Name *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="My Awesome Website"
                />
              </div>

              <div className="form-group">
                <label className="label">Primary Domain *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.primary_domain}
                  onChange={(e) =>
                    setFormData({ ...formData, primary_domain: e.target.value })
                  }
                  required
                  placeholder="example.com"
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.5rem",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "white",
                    border: "none",
                    borderRadius: "0.75rem",
                    fontWeight: 600,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  <Save size={20} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/tenants/${id}`)}
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
