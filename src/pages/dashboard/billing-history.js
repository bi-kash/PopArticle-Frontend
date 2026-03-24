import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { subscriptionService } from "@/lib/subscriptionService";
import {
  Receipt,
  ArrowLeft,
  Calendar,
  CreditCard,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function BillingHistory() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const historyData = await subscriptionService
        .getHistory()
        .catch(() => ({ history: [] }));
      setHistory(historyData.history || historyData.events || []);
    } catch (err) {
      console.error("Failed to load billing history:", err);
      setError(err.response?.data?.error || "Failed to load billing history");
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType?.toLowerCase()) {
      case "subscription.created":
      case "subscription.activated":
        return (
          <TrendingUp size={18} style={{ color: "var(--success-color)" }} />
        );
      case "subscription.canceled":
        return (
          <TrendingDown size={18} style={{ color: "var(--danger-color)" }} />
        );
      case "subscription.updated":
      case "subscription.upgraded":
        return (
          <TrendingUp size={18} style={{ color: "var(--primary-color)" }} />
        );
      case "transaction.completed":
      case "payment.completed":
        return (
          <CreditCard size={18} style={{ color: "var(--success-color)" }} />
        );
      default:
        return <Receipt size={18} style={{ color: "var(--text-secondary)" }} />;
    }
  };

  const getEventLabel = (eventType) => {
    const labels = {
      "subscription.created": "Subscription Created",
      "subscription.activated": "Subscription Activated",
      "subscription.updated": "Subscription Updated",
      "subscription.canceled": "Subscription Canceled",
      "subscription.paused": "Subscription Paused",
      "subscription.resumed": "Subscription Resumed",
      "subscription.upgraded": "Plan Upgraded",
      "subscription.downgraded": "Plan Downgraded",
      "transaction.completed": "Payment Completed",
      "payment.completed": "Payment Completed",
      "payment.failed": "Payment Failed",
    };
    return labels[eventType?.toLowerCase()] || eventType || "Event";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          {/* Back button */}
          <div style={{ marginBottom: "1.5rem" }}>
            <button
              onClick={() => router.push("/dashboard/subscription")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.5rem 1rem",
                background: "var(--surface)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "0.875rem",
              }}
            >
              <ArrowLeft size={18} />
              Back to Subscription
            </button>
          </div>

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "0.75rem",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Receipt size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                Billing History
              </h1>
              <p style={{ color: "var(--text-secondary)" }}>
                View your subscription and payment history
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="card"
              style={{
                background: "#fef2f2",
                borderColor: "#fecaca",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <AlertCircle
                  size={20}
                  style={{ color: "var(--danger-color)" }}
                />
                <p style={{ color: "#991b1b" }}>{error}</p>
              </div>
            </div>
          )}

          {/* History List */}
          <div className="card">
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "1.5rem",
              }}
            >
              Transaction History
            </h2>

            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <Receipt
                  size={48}
                  style={{
                    color: "var(--text-secondary)",
                    margin: "0 auto 1rem",
                  }}
                />
                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                  No Billing History
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    marginBottom: "1.5rem",
                  }}
                >
                  Your billing history will appear here once you subscribe to a
                  plan.
                </p>
                <Link href="/dashboard/subscription">
                  <button
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.625rem 1.25rem",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    <CreditCard size={18} />
                    View Plans
                  </button>
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {history.map((event, index) => (
                  <div
                    key={event.id || index}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "1rem",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      background: "var(--surface)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "var(--background)",
                        border: "1px solid var(--border-color)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {getEventIcon(event.event_type || event.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <h4 style={{ fontWeight: "600" }}>
                          {getEventLabel(event.event_type || event.type)}
                        </h4>
                        {event.amount && (
                          <span
                            style={{
                              fontWeight: "600",
                              color:
                                event.event_type?.includes("payment") ||
                                event.event_type?.includes("transaction")
                                  ? "var(--success-color)"
                                  : "var(--text-primary)",
                            }}
                          >
                            ${event.amount}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          color: "var(--text-secondary)",
                          fontSize: "0.875rem",
                        }}
                      >
                        <Calendar size={14} />
                        <span>
                          {formatDate(event.created_at || event.occurred_at)}
                        </span>
                      </div>
                      {event.plan && (
                        <p
                          style={{
                            marginTop: "0.5rem",
                            fontSize: "0.875rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Plan:{" "}
                          <span style={{ textTransform: "capitalize" }}>
                            {event.plan}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
