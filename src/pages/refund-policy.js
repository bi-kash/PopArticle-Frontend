import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import siteConfig from "@/lib/siteConfig";

export default function RefundPolicy() {
  const name = siteConfig.siteName;
  const email = siteConfig.contactEmail;

  return (
    <>
      <Head>
        <title>Refund Policy — {name}</title>
        <meta
          name="description"
          content={`Refund and cancellation policy for ${name} subscriptions.`}
        />
      </Head>

      <Navbar />

      <main
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "3rem 1.5rem 5rem",
          color: "var(--text-primary)",
          lineHeight: 1.75,
        }}
      >
        <div style={{ marginBottom: "2.5rem" }}>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 2.75rem)",
              fontWeight: 800,
              marginBottom: "0.75rem",
            }}
          >
            Refund Policy
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Intro */}
        <section style={{ marginBottom: "2rem" }}>
          <p>
            We want you to be completely satisfied with your {name}{" "}
            subscription. This Refund Policy outlines the terms under which
            refunds and cancellations are handled. By subscribing to our
            service, you agree to the terms described below.
          </p>
        </section>

        {/* 30-day */}
        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.375rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            30-Day Money-Back Guarantee
          </h2>
          <p>
            If you are not satisfied with {name} for any reason, you may request
            a full refund within
            <strong> 30 days</strong> of your initial purchase. This applies to
            first-time purchases of any subscription plan. To request a refund,
            contact us at{" "}
            <a href={`mailto:${email}`} style={{ color: "#6366f1" }}>
              {email}
            </a>{" "}
            with your account email and order details.
          </p>
        </section>

        {/* Subscriptions */}
        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.375rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            Subscription Cancellations
          </h2>
          <p>
            You may cancel your subscription at any time from your
            account&apos;s billing settings. Upon cancellation:
          </p>
          <ul
            style={{
              paddingLeft: "1.5rem",
              marginTop: "0.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <li>
              Your subscription will remain active until the end of the current
              billing period.
            </li>
            <li>You will not be charged for subsequent billing periods.</li>
            <li>
              No partial refunds are issued for unused time within a billing
              period, except as covered by the 30-day guarantee above.
            </li>
          </ul>
        </section>

        {/* Non-refundable */}
        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.375rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            Non-Refundable Items
          </h2>
          <p>The following are not eligible for refunds:</p>
          <ul
            style={{
              paddingLeft: "1.5rem",
              marginTop: "0.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <li>Renewals after the 30-day guarantee window has passed.</li>
            <li>
              Add-on credits or one-time purchases once they have been consumed
              or used.
            </li>
            <li>
              Accounts suspended or terminated due to a violation of our{" "}
              <Link href="/terms-of-service" style={{ color: "#6366f1" }}>
                Terms of Service
              </Link>
              .
            </li>
          </ul>
        </section>

        {/* Paddle */}
        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.375rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            Payment Processing
          </h2>
          <p>
            Payments for {name} subscriptions are processed securely by{" "}
            <strong>Paddle.com</strong>, our Merchant of Record. Paddle handles
            billing, receipts, and VAT/sales tax on our behalf. For billing
            questions or disputes, you may also contact Paddle directly via
            their{" "}
            <a
              href="https://paddle.com/support"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#6366f1" }}
            >
              support page
            </a>
            .
          </p>
        </section>

        {/* How to request */}
        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.375rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            How to Request a Refund
          </h2>
          <ol
            style={{
              paddingLeft: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <li>
              Email us at{" "}
              <a href={`mailto:${email}`} style={{ color: "#6366f1" }}>
                {email}
              </a>{" "}
              with the subject line{" "}
              <strong>&ldquo;Refund Request&rdquo;</strong>.
            </li>
            <li>
              Include your account email address and a brief reason for the
              request.
            </li>
            <li>
              We will review your request and respond within{" "}
              <strong>3 business days</strong>.
            </li>
            <li>
              Approved refunds are returned to the original payment method
              within 5–10 business days, depending on your bank.
            </li>
          </ol>
        </section>

        {/* Changes */}
        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.375rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            Changes to This Policy
          </h2>
          <p>
            We reserve the right to modify this Refund Policy at any time.
            Changes will be posted on this page with an updated date. Continued
            use of the service after changes constitutes acceptance of the new
            policy.
          </p>
        </section>

        {/* Contact */}
        <section
          style={{
            background: "linear-gradient(135deg, #ede9fe, #e0e7ff)",
            borderRadius: "1rem",
            padding: "2rem",
            marginTop: "2.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
            }}
          >
            Questions?
          </h2>
          <p style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>
            If you have any questions about this policy or need help with a
            refund, we&apos;re happy to help.
          </p>
          <Link
            href="/contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              padding: "0.625rem 1.25rem",
              borderRadius: "0.5rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              textDecoration: "none",
            }}
          >
            Contact Support
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
