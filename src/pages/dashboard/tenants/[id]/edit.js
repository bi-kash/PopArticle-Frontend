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
    plan: "free",
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
        plan: tenant.plan || "free",
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
          "Failed to update tenant"
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
              className="btn btn-secondary"
              onClick={() => router.push(`/dashboard/tenants/${id}`)}
            >
              <ArrowLeft size={20} />
              Back to Tenant
            </button>
          </div>

          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <Building2
              size={48}
              style={{ color: "var(--primary-color)", margin: "0 auto 1rem" }}
            />
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

              <div className="form-group">
                <label className="label">Plan</label>
                <select
                  className="select"
                  value={formData.plan}
                  onChange={(e) =>
                    setFormData({ ...formData, plan: e.target.value })
                  }
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ flex: 1 }}
                >
                  <Save size={20} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => router.push(`/dashboard/tenants/${id}`)}
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
