import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { subscriptionService } from "@/lib/subscriptionService";
import { tenantService } from "@/lib/tenantService";
import {
  CreditCard,
  ArrowLeft,
  Check,
  Crown,
  Zap,
  Building2,
  AlertCircle,
  Pause,
  Play,
  X,
  Loader2,
  Receipt,
} from "lucide-react";

export default function TenantSubscription() {
  const router = useRouter();
  const { id } = router.query;
  const [tenant, setTenant] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [isPaddleConfigured, setIsPaddleConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("=== Loading Subscription Data ===");
      console.log("Tenant ID:", id);

      const [tenantData, subscriptionData, plansData] = await Promise.all([
        tenantService.getTenant(id),
        subscriptionService.getStatus(id).catch((err) => {
          console.error(
            "Subscription status error:",
            err.response?.data || err.message,
          );
          return null;
        }),
        subscriptionService.getPlans().catch((err) => {
          console.error("Plans error:", err.response?.data || err.message);
          return { plans: [] };
        }),
      ]);

      console.log("Tenant data:", tenantData);
      console.log("Subscription data:", subscriptionData);
      console.log("Plans data from API:", plansData);

      setTenant(tenantData.tenant || tenantData);
      setSubscription(subscriptionData);
      setPlans(plansData.plans || []);
      setIsPaddleConfigured(plansData.is_paddle_configured || false);

      if (!plansData.is_paddle_configured) {
        console.warn("⚠️ Paddle is NOT configured on the backend!");
        setError(
          "Paddle payment gateway is not configured. Please contact support.",
        );
      }
    } catch (err) {
      console.error("Failed to load subscription data:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.error || "Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planName) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccessMessage(""); // Clear any existing success messages
      const normalizedPlan = planName?.toLowerCase().trim();
      console.log("=== SUBSCRIBE BUTTON CLICKED ===");
      console.log("Subscribing to plan:", {
        original: planName,
        normalized: normalizedPlan,
        tenantId: id,
      });
      const baseUrl = window.location.origin;
      const requestData = {
        plan: normalizedPlan,
        success_url: `${baseUrl}/dashboard/tenants/${id}/subscription?success=true`,
        cancel_url: `${baseUrl}/dashboard/tenants/${id}/subscription?canceled=true`,
      };

      console.log("Checkout request data:", requestData);

      const checkoutData = await subscriptionService.createCheckout(
        id,
        requestData,
      );

      console.log("=== CHECKOUT API RESPONSE ===");
      console.log("Full response:", checkoutData);
      console.log("checkout_url:", checkoutData?.checkout_url);
      console.log("Response keys:", Object.keys(checkoutData || {}));

      // Redirect to Paddle checkout
      if (checkoutData?.checkout_url) {
        console.log("✅ Redirecting to Paddle:", checkoutData.checkout_url);
        // Don't set loading to false - we're redirecting
        window.location.href = checkoutData.checkout_url;
      } else {
        console.error("❌ No checkout_url in response");
        console.error(
          "Full response object:",
          JSON.stringify(checkoutData, null, 2),
        );

        // Display the actual error from backend if present
        const errorMsg =
          checkoutData?.error ||
          checkoutData?.message ||
          "No checkout URL received from backend. Backend response: " +
            JSON.stringify(checkoutData);

        setError(errorMsg);
        setActionLoading(false);

        // Also show an alert for immediate visibility
        alert(
          "Checkout Failed!\n\n" +
            errorMsg +
            "\n\nCheck browser console for details.",
        );
      }
    } catch (err) {
      console.error("=== CHECKOUT ERROR ===");
      console.error("Error object:", err);
      console.error("Error response:", err.response);
      console.error("Error data:", err.response?.data);
      console.error("Status code:", err.response?.status);

      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to create checkout session. Please check backend Paddle configuration.";

      setError(errorMessage);
      setActionLoading(false);

      // Show alert with full error details
      alert(
        "Checkout API Error!\n\n" +
          "Status: " +
          (err.response?.status || "Unknown") +
          "\n" +
          "Error: " +
          errorMessage +
          "\n\n" +
          "Backend Response: " +
          JSON.stringify(err.response?.data, null, 2) +
          "\n\n" +
          "Check browser console for full details.",
      );
    }
  };

  const handleUpgrade = async (planName) => {
    try {
      setActionLoading(true);
      setError("");
      await subscriptionService.upgradeSubscription(id, {
        plan: planName,
        proration: "prorated_immediately",
      });
      setSuccessMessage(`Successfully upgraded to ${planName} plan!`);
      await loadData();
    } catch (err) {
      console.error("Failed to upgrade:", err);
      setError(err.response?.data?.error || "Failed to upgrade subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (effectiveFrom = "next_billing_period") => {
    try {
      setActionLoading(true);
      setError("");
      await subscriptionService.cancelSubscription(id, {
        effective_from: effectiveFrom,
      });
      setSuccessMessage("Subscription canceled successfully");
      setShowCancelModal(false);
      await loadData();
    } catch (err) {
      console.error("Failed to cancel:", err);
      setError(err.response?.data?.error || "Failed to cancel subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      setActionLoading(true);
      setError("");
      await subscriptionService.pauseSubscription(id);
      setSuccessMessage("Subscription paused successfully");
      await loadData();
    } catch (err) {
      console.error("Failed to pause:", err);
      setError(err.response?.data?.error || "Failed to pause subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    try {
      setActionLoading(true);
      setError("");
      await subscriptionService.resumeSubscription(id);
      setSuccessMessage("Subscription resumed successfully");
      await loadData();
    } catch (err) {
      console.error("Failed to resume:", err);
      setError(err.response?.data?.error || "Failed to resume subscription");
    } finally {
      setActionLoading(false);
    }
  };

  // Check for success/cancel query params
  useEffect(() => {
    if (router.query.success === "true") {
      console.log("User returned from successful checkout");
      // Reload subscription data first
      loadData().then(() => {
        setSuccessMessage(
          "Subscription successful! Your plan has been activated.",
        );
      });
      // Remove query params from URL
      router.replace(`/dashboard/tenants/${id}/subscription`, undefined, {
        shallow: true,
      });
    }
    if (router.query.canceled === "true") {
      console.log("User canceled checkout");
      setError("Checkout was canceled. You can try again when ready.");
      router.replace(`/dashboard/tenants/${id}/subscription`, undefined, {
        shallow: true,
      });
    }
  }, [router.query, id]);

  const getPlanIcon = (planName) => {
    switch (planName?.toLowerCase()) {
      case "enterprise":
        return <Crown size={24} />;
      case "pro":
        return <Zap size={24} />;
      case "basic":
        return <CreditCard size={24} />;
      default:
        return <Building2 size={24} />;
    }
  };

  const getPlanColor = (planName) => {
    switch (planName?.toLowerCase()) {
      case "enterprise":
        return "#8b5cf6";
      case "pro":
        return "#2563eb";
      case "basic":
        return "#10b981";
      default:
        return "#64748b";
    }
  };

  const isCurrentPlan = (planName) => {
    return subscription?.plan?.toLowerCase() === planName?.toLowerCase();
  };

  const canUpgrade = (planName) => {
    const planOrder = { free: 0, basic: 1, pro: 2, enterprise: 3 };
    const currentPlanLevel = planOrder[subscription?.plan?.toLowerCase()] || 0;
    const targetPlanLevel = planOrder[planName?.toLowerCase()] || 0;
    return targetPlanLevel > currentPlanLevel;
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
          <div style={{ marginBottom: "2rem" }}>
            <button
              className="btn btn-secondary"
              onClick={() => router.push(`/dashboard/tenants/${id}`)}
              style={{ marginBottom: "1rem" }}
            >
              <ArrowLeft size={20} />
              Back to Tenant
            </button>
          </div>

          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem",
              marginBottom: "2rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <CreditCard size={32} style={{ color: "var(--primary-color)" }} />
              <div>
                <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                  Subscription Management
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>
                  {tenant?.name} - Manage your subscription and billing
                </p>
              </div>
            </div>
            <Link href={`/dashboard/tenants/${id}/billing-history`}>
              <button className="btn btn-secondary">
                <Receipt size={18} />
                Billing History
              </button>
            </Link>
          </div>

          {/* Messages */}
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

          {successMessage && (
            <div
              className="card"
              style={{
                background: "#f0fdf4",
                borderColor: "#bbf7d0",
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
                <Check size={20} style={{ color: "var(--success-color)" }} />
                <p style={{ color: "#166534" }}>{successMessage}</p>
              </div>
            </div>
          )}

          {/* Paddle Configuration Status */}
          {!isPaddleConfigured && (
            <div
              className="card"
              style={{
                background: "#fef3c7",
                borderColor: "#fcd34d",
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
                  style={{ color: "var(--warning-color)" }}
                />
                <div>
                  <p style={{ color: "#92400e", fontWeight: "600" }}>
                    Paddle Payment Gateway Not Configured
                  </p>
                  <p
                    style={{
                      color: "#92400e",
                      fontSize: "0.875rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    The payment system is not set up. Subscriptions cannot be
                    processed until Paddle is configured on the backend.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Current Subscription Status */}
          <div className="card" style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "1.5rem",
              }}
            >
              Current Subscription
            </h2>

            {subscription?.has_subscription ? (
              <div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1.5rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.875rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Plan
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          color: getPlanColor(subscription.plan),
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {getPlanIcon(subscription.plan)}
                      </span>
                      <span
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "600",
                          textTransform: "capitalize",
                        }}
                      >
                        {subscription.plan}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.875rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Status
                    </p>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        background:
                          subscription.status === "active"
                            ? "#dcfce7"
                            : subscription.status === "paused"
                              ? "#fef3c7"
                              : "#fee2e2",
                        color:
                          subscription.status === "active"
                            ? "#166534"
                            : subscription.status === "paused"
                              ? "#92400e"
                              : "#991b1b",
                      }}
                    >
                      {subscription.status}
                    </span>
                  </div>

                  <div>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.875rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Article Limit
                    </p>
                    <p style={{ fontSize: "1.25rem", fontWeight: "600" }}>
                      {subscription.article_limit} / month
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.875rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Billing Cycle
                    </p>
                    <p
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "600",
                        textTransform: "capitalize",
                      }}
                    >
                      {subscription.billing_cycle?.interval || "Monthly"}
                    </p>
                  </div>
                </div>

                {subscription.current_period && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.875rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Current Period
                    </p>
                    <p style={{ fontWeight: "500" }}>
                      {new Date(
                        subscription.current_period.start,
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        subscription.current_period.end,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Subscription Actions */}
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {subscription.status === "active" && (
                    <button
                      className="btn btn-secondary"
                      onClick={handlePause}
                      disabled={actionLoading}
                    >
                      <Pause size={18} />
                      Pause Subscription
                    </button>
                  )}

                  {subscription.status === "paused" && (
                    <button
                      className="btn btn-success"
                      onClick={handleResume}
                      disabled={actionLoading}
                    >
                      <Play size={18} />
                      Resume Subscription
                    </button>
                  )}

                  {subscription.status !== "canceled" && (
                    <button
                      className="btn btn-danger"
                      onClick={() => setShowCancelModal(true)}
                      disabled={actionLoading}
                    >
                      <X size={18} />
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <Building2
                  size={48}
                  style={{
                    color: "var(--text-secondary)",
                    margin: "0 auto 1rem",
                  }}
                />
                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                  No Active Subscription
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    marginBottom: "1.5rem",
                  }}
                >
                  You're currently on the Free plan. Choose a plan below to
                  unlock more features.
                </p>
              </div>
            )}
          </div>

          {/* Available Plans */}
          <div className="card">
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "1.5rem",
              }}
            >
              Available Plans
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  style={{
                    border: isCurrentPlan(plan.name)
                      ? `2px solid ${getPlanColor(plan.name)}`
                      : "1px solid var(--border-color)",
                    borderRadius: "0.75rem",
                    padding: "1.5rem",
                    position: "relative",
                    background: isCurrentPlan(plan.name)
                      ? "#f8fafc"
                      : "transparent",
                  }}
                >
                  {isCurrentPlan(plan.name) && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-12px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: getPlanColor(plan.name),
                        color: "white",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                      }}
                    >
                      Current Plan
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <span style={{ color: getPlanColor(plan.name) }}>
                      {getPlanIcon(plan.name)}
                    </span>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "600" }}>
                      {plan.display_name}
                    </h3>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <span style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
                      ${plan.price}
                    </span>
                    {plan.price !== "0" && (
                      <span style={{ color: "var(--text-secondary)" }}>
                        /month
                      </span>
                    )}
                  </div>

                  <ul style={{ marginBottom: "1.5rem", listStyle: "none" }}>
                    <li
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <Check
                        size={16}
                        style={{ color: "var(--success-color)" }}
                      />
                      <span>{plan.article_limit} articles/month</span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <Check
                        size={16}
                        style={{ color: "var(--success-color)" }}
                      />
                      <span>AI-powered content generation</span>
                    </li>
                    {plan.name !== "free" && (
                      <li
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <Check
                          size={16}
                          style={{ color: "var(--success-color)" }}
                        />
                        <span>Priority support</span>
                      </li>
                    )}
                    {(plan.name === "pro" || plan.name === "enterprise") && (
                      <li
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <Check
                          size={16}
                          style={{ color: "var(--success-color)" }}
                        />
                        <span>Advanced analytics</span>
                      </li>
                    )}
                    {plan.name === "enterprise" && (
                      <li
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <Check
                          size={16}
                          style={{ color: "var(--success-color)" }}
                        />
                        <span>Dedicated account manager</span>
                      </li>
                    )}
                  </ul>

                  {isCurrentPlan(plan.name) ? (
                    <button
                      className="btn btn-secondary"
                      style={{ width: "100%", justifyContent: "center" }}
                      disabled
                    >
                      Current Plan
                    </button>
                  ) : plan.name === "free" ? (
                    <button
                      className="btn btn-secondary"
                      style={{ width: "100%", justifyContent: "center" }}
                      disabled
                    >
                      Free Plan
                    </button>
                  ) : subscription?.has_subscription &&
                    canUpgrade(plan.name) ? (
                    <button
                      className="btn btn-primary"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => handleUpgrade(plan.name)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          <Zap size={18} />
                          Upgrade
                        </>
                      )}
                    </button>
                  ) : !subscription?.has_subscription ||
                    subscription?.plan?.toLowerCase() === "free" ? (
                    <button
                      className="btn btn-primary"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => handleSubscribe(plan.name)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          <CreditCard size={18} />
                          Subscribe
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      className="btn btn-secondary"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => handleUpgrade(plan.name)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        "Switch Plan"
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cancel Modal */}
          {showCancelModal && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
              onClick={() => setShowCancelModal(false)}
            >
              <div
                className="card"
                style={{
                  maxWidth: "480px",
                  width: "90%",
                  margin: "1rem",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "600",
                    marginBottom: "1rem",
                  }}
                >
                  Cancel Subscription
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    marginBottom: "1.5rem",
                  }}
                >
                  Are you sure you want to cancel your subscription? Choose when
                  the cancellation should take effect.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <button
                    className="btn btn-secondary"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => handleCancel("next_billing_period")}
                    disabled={actionLoading}
                  >
                    Cancel at end of billing period
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => handleCancel("immediately")}
                    disabled={actionLoading}
                  >
                    Cancel immediately
                  </button>
                  <button
                    className="btn"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      background: "transparent",
                      border: "1px solid var(--border-color)",
                    }}
                    onClick={() => setShowCancelModal(false)}
                    disabled={actionLoading}
                  >
                    Keep my subscription
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
