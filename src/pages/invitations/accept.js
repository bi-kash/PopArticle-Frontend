import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { acceptInvitation, verifyInvitation } from "@/lib/invitationService";
import { authService } from "@/lib/authService";

export default function AcceptInvitation() {
  const router = useRouter();
  const { token, auto } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [invitationData, setInvitationData] = useState(null);
  const acceptingRef = useRef(false); // Prevent multiple calls

  useEffect(() => {
    console.log("=== Accept Invitation Page Loaded ===");
    console.log("Token from URL:", token);
    console.log("Auto flag:", auto);
    console.log("Full query:", router.query);
    console.log(
      "SessionStorage token:",
      sessionStorage.getItem("pending_invitation_token")
    );

    // Check if user is logged in
    const user = authService.getCurrentUser();
    console.log("Current user:", user ? "Logged in" : "Not logged in");
    setIsLoggedIn(!!user);

    // If we have auto=true but no token in URL yet, wait for router to update
    if (!token && router.isReady) {
      console.log("No token in URL, router is ready");
      setLoading(false);
      return;
    }

    // Auto-accept if user just logged in/registered
    if (user && token && auto === "true") {
      console.log(
        "✓ Conditions met for auto-accept: user exists, token exists, auto=true"
      );
      handleAccept();
    } else if (token && !auto && !user) {
      // Verify invitation and check if user exists
      console.log("Verifying invitation (no user logged in)");
      verifyAndRedirect();
    } else if (token && !auto && user) {
      // User is logged in but no auto flag, just show the accept button
      console.log("User logged in, showing accept button");
      setLoading(false);
    } else {
      console.log("No matching condition, waiting...");
    }
  }, [token, auto, router.isReady]);

  const verifyAndRedirect = async () => {
    try {
      setLoading(true);
      console.log("Verifying invitation token:", token);
      const data = await verifyInvitation(token);
      console.log("Verification response:", data);

      setInvitationData(data);

      // Check if user is already logged in
      const user = authService.getCurrentUser();
      if (user) {
        setLoading(false);
        return; // User is logged in, show accept button
      }

      // Store invitation token for after login/registration
      sessionStorage.setItem("pending_invitation_token", token);

      // Check if user exists
      if (data.user_exists === false) {
        // User doesn't exist, redirect to registration
        console.log("User does not exist, redirecting to registration");
        router.push(
          `/register?invitation=true&email=${encodeURIComponent(
            data.invitation?.email || data.email || ""
          )}`
        );
      } else {
        // User exists, redirect to login
        console.log("User exists, redirecting to login");
        router.push(
          `/login?invitation=true&email=${encodeURIComponent(
            data.invitation?.email || data.email || ""
          )}`
        );
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Invalid or expired invitation"
      );
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    // Prevent multiple simultaneous calls
    if (acceptingRef.current) {
      console.log("⚠️ Already accepting invitation, skipping duplicate call");
      return;
    }

    if (!token) {
      setError("Invalid invitation link");
      return;
    }

    // Re-check if user is logged in right now
    const user = authService.getCurrentUser();
    if (!user) {
      console.log("Not logged in, redirecting to login");
      sessionStorage.setItem("pending_invitation_token", token);
      router.push(`/login?invitation=true`);
      return;
    }

    try {
      acceptingRef.current = true; // Mark as accepting
      setLoading(true);
      setError("");

      console.log("✓ Accepting invitation with token:", token);
      const response = await acceptInvitation(token);
      console.log("✓ Accept response:", response);

      // Clear session storage
      sessionStorage.removeItem("pending_invitation_token");

      setSuccess(true);

      // Get tenant ID from response
      const tenantId = response.tenant?.id || response.tenant_id;

      // Redirect after 2 seconds
      setTimeout(() => {
        if (tenantId) {
          router.push(`/dashboard/tenants/${tenantId}/dashboard`);
        } else {
          router.push("/dashboard");
        }
      }, 2000);
    } catch (err) {
      console.error("❌ Accept invitation error:", err);
      console.error("Error response:", err.response);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to accept invitation. Please try again.";
      setError(errorMsg);
      acceptingRef.current = false; // Reset on error so user can retry
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    router.push("/dashboard");
  };

  if (success) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "3rem",
            borderRadius: "12px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            maxWidth: "500px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "#d4edda",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <svg width="40" height="40" fill="#28a745" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1
            style={{
              fontSize: "1.75rem",
              marginBottom: "1rem",
              color: "#1a1a1a",
            }}
          >
            Invitation Accepted!
          </h1>
          <p style={{ color: "#666", marginBottom: "2rem" }}>
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "3rem",
          borderRadius: "12px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "#e6f2ff",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <svg width="40" height="40" fill="#667eea" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: "1.75rem",
              marginBottom: "0.5rem",
              color: "#1a1a1a",
            }}
          >
            You're Invited!
          </h1>
          <p style={{ color: "#666", fontSize: "0.95rem" }}>
            Click below to accept your invitation
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fee",
              border: "1px solid #fcc",
              borderRadius: "6px",
              padding: "1rem",
              marginBottom: "1.5rem",
              color: "#c33",
            }}
          >
            {error}
          </div>
        )}

        {!isLoggedIn && (
          <div
            style={{
              background: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: "6px",
              padding: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "#856404",
              }}
            >
              <strong>Note:</strong> You need to sign in or create an account to
              accept this invitation.
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={handleDecline}
            disabled={loading}
            style={{
              flex: 1,
              padding: "0.875rem",
              border: "2px solid #e0e0e0",
              background: "white",
              color: "#666",
              borderRadius: "6px",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={loading}
            style={{
              flex: 1,
              padding: "0.875rem",
              border: "none",
              background: loading ? "#ccc" : "#667eea",
              color: "white",
              borderRadius: "6px",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {loading
              ? "Accepting..."
              : isLoggedIn
              ? "Accept Invitation"
              : "Sign In to Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}
