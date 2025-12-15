import { useState } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { tenantService } from "@/lib/tenantService";
import { Building2, Save } from "lucide-react";

export default function NewTenant() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    primary_domain: "",
    plan: "free",
  });
  const [categories, setCategories] = useState([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const tenantData = {
        ...formData,
        categories: categories.length > 0 ? categories : undefined,
      };
      const response = await tenantService.registerTenant(tenantData);
      const tenantId = response.tenant?.id || response.id;

      if (tenantId) {
        router.push(`/dashboard/tenants/${tenantId}/dashboard`);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Tenant registration error:", err);
      console.error("Error response:", err.response);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to register tenant";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    const trimmed = categoryInput.trim();
    if (
      trimmed &&
      !categories.some((cat) => cat.toLowerCase() === trimmed.toLowerCase())
    ) {
      setCategories([...categories, trimmed]);
      setCategoryInput("");
    }
  };

  const handleRemoveCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCategory();
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

              {/* Categories Section */}
              <div className="form-group">
                <label className="label">Initial Categories (Optional)</label>
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
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter category name"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleAddCategory}
                    disabled={!categoryInput.trim()}
                  >
                    Add
                  </button>
                </div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Add categories for organizing your articles (e.g., Technology,
                  News, Blog)
                </p>
                {categories.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    {categories.map((category, index) => (
                      <span
                        key={index}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem 0.75rem",
                          background: "var(--primary-color)",
                          color: "white",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                      >
                        {category}
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(index)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            padding: "0",
                            fontSize: "1.25rem",
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="alert alert-warning"
                style={{ marginBottom: "1rem" }}
              >
                <strong>Note:</strong> After registering your tenant,
                you&apos;ll have access to a dedicated dashboard to manage
                articles and categories.
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
