import { useState } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { tenantService } from "@/lib/tenantService";
import { Building2, Save } from "lucide-react";

export default function NewTenant() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    primary_domain: "",
    plan: "free",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await tenantService.registerTenant(formData);
      router.push("/dashboard/tenants");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register tenant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
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
              Register New Tenant
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Register a new website that can use PopArticle for authentication
              and content
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
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    marginTop: "0.25rem",
                  }}
                >
                  A friendly name for your website
                </p>
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
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    marginTop: "0.25rem",
                  }}
                >
                  The main domain where your website is hosted
                </p>
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

              <div
                className="alert alert-warning"
                style={{ marginBottom: "1rem" }}
              >
                <strong>Note:</strong> After registering your tenant,
                you&apos;ll receive a tenant ID that you can use to enable
                authentication on your website.
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  <Save size={20} />
                  {loading ? "Registering..." : "Register Tenant"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => router.push("/dashboard/tenants")}
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
