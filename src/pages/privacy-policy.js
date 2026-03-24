import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import siteConfig from "@/lib/siteConfig";

export default function PrivacyPolicy() {
  const name = siteConfig.siteName;
  return (
    <>
      <Head>
        <title>Privacy Policy - {name}</title>
        <meta
          name="description"
          content={`Privacy Policy for ${name} - AI-Powered Content Platform`}
        />

        {/* Open Graph */}
        <meta property="og:title" content={`Privacy Policy - ${name}`} />
        <meta
          property="og:description"
          content={`Privacy Policy for ${name} - AI-Powered Content Platform`}
        />
        <meta property="og:image" content="/og-default.png" />
      </Head>

      <Navbar />

      <main
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "2rem 1rem",
          color: "var(--text-primary)",
          lineHeight: 1.7,
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
          }}
        >
          Privacy Policy
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "2rem",
            fontSize: "0.95rem",
          }}
        >
          Last updated: February 12, 2026
        </p>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "0.75rem",
            }}
          >
            1. Introduction
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            {name} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates
            the {name} platform, an AI-powered content generation and management
            service. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you use our platform, including
            our website, APIs, and related services (collectively, the
            &quot;Service&quot;).
          </p>
          <p>
            By accessing or using the Service, you agree to this Privacy Policy.
            If you do not agree with the terms of this policy, please do not
            access or use the Service.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "0.75rem",
            }}
          >
            2. Information We Collect
          </h2>

          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
            }}
          >
            2.1 Personal Information
          </h3>
          <p style={{ marginBottom: "0.75rem" }}>
            When you register for an account, we may collect:
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>Full name</li>
            <li style={{ marginBottom: "0.5rem" }}>Email address</li>
            <li style={{ marginBottom: "0.5rem" }}>Username</li>
            <li style={{ marginBottom: "0.5rem" }}>
              Password (stored in hashed form)
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Profile image URL (if provided or obtained via OAuth)
            </li>
          </ul>

          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
            }}
          >
            2.2 OAuth and Social Login Data
          </h3>
          <p style={{ marginBottom: "0.75rem" }}>
            When you authenticate via third-party OAuth providers (Google,
            GitHub, LinkedIn, Facebook), we receive and store:
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              Your name and email from the OAuth provider
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Profile photo URL from the OAuth provider
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              OAuth provider identifier
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              OAuth access tokens (used solely to authenticate your identity)
            </li>
          </ul>

          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
            }}
          >
            2.3 Social Media Posting Credentials
          </h3>
          <p style={{ marginBottom: "0.75rem" }}>
            If you choose to connect social media accounts for content
            distribution (e.g., Facebook, Twitter/X, LinkedIn, Instagram), we
            may collect and store:
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              Social media access tokens and refresh tokens
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Social media page/account identifiers
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Platform-specific permissions you have granted
            </li>
          </ul>
          <p style={{ marginBottom: "1rem" }}>
            These credentials are stored securely and used exclusively to
            publish or schedule content on your behalf to the platforms you have
            authorized. You can revoke access at any time through your account
            settings or the respective social media platform.
          </p>

          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
            }}
          >
            2.4 Content Data
          </h3>
          <p style={{ marginBottom: "1rem" }}>
            We store articles, comments, categories, and other content you
            create or generate using our Service. This includes AI-generated
            content produced on your behalf.
          </p>

          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
            }}
          >
            2.5 Usage and Log Data
          </h3>
          <p style={{ marginBottom: "1rem" }}>
            We automatically collect information about how you interact with our
            Service, including IP addresses, browser type, device information,
            pages visited, and access times. This data helps us improve the
            Service and diagnose technical issues.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "0.75rem",
            }}
          >
            3. How We Use Your Information
          </h2>
          <p style={{ marginBottom: "0.75rem" }}>
            We use the information we collect to:
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              Provide, maintain, and improve the Service
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Authenticate your identity and manage your account
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Generate, schedule, and publish content on your behalf
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Post content to your connected social media accounts as authorized
              by you
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Send transactional emails (e.g., team invitations, account
              notifications)
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Support multi-tenant functionality (managing separate
              websites/organizations)
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Respond to your inquiries, support requests, and messages
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Monitor and analyze usage trends to improve user experience
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Detect, prevent, and address fraud, abuse, and security issues
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "0.75rem",
            }}
          >
            4. Information Sharing and Disclosure
          </h2>
          <p style={{ marginBottom: "0.75rem" }}>
            We do not sell your personal information. We may share your
            information in the following circumstances:
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong>With your consent:</strong> When you explicitly authorize
              us to share information, such as when connecting social media
              accounts for content posting.
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong>Within your tenant/organization:</strong> Team members
              within the same tenant may see shared articles, categories, and
              team information.
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong>Third-party service providers:</strong> We use trusted
              third-party services for hosting, analytics, email delivery, and
              AI content generation. These providers are contractually obligated
              to protect your data.
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong>Social media platforms:</strong> When you authorize us to
              post content to your social media accounts, the content and
              associated metadata are shared with those platforms per their own
              terms of service.
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong>Legal requirements:</strong> We may disclose your
              information if required by law, regulation, or legal process.
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "0.75rem",
            }}
          >
            5. Data Security
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            We implement appropriate technical and organizational measures to
            protect your personal information, including:
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              Encryption of passwords using industry-standard hashing algorithms
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              JWT-based authentication with token expiration
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Secure storage of API keys and OAuth tokens
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              HTTPS encryption for all data in transit
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Regular security audits and updates
            </li>
          </ul>
          <p>
            However, no method of transmission over the Internet or electronic
            storage is 100% secure. While we strive to use commercially
            acceptable means to protect your data, we cannot guarantee its
            absolute security.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "0.75rem",
            }}
          >
            6. Data Retention
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            We retain your personal information for as long as your account is
            active or as needed to provide you the Service. You may request
            deletion of your account and associated data at any time by
            contacting us. Content you have published to external social media
            platforms is governed by those platforms&apos; retention policies.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "0.75rem",
            }}
          >
            7. Your Rights
          </h2>
          <p style={{ marginBottom: "0.75rem" }}>
            Depending on your jurisdiction, you may have the following rights:
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong>Access:</strong> Request a copy of the personal data we
              hold about you.
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong>Correction:</strong> Request correction of inaccurate
              personal data.
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong>Deletion:</strong> Request deletion of your personal data.
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong>Portability:</strong> Request your data in a portable
              format.
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong>Withdraw consent:</strong> Revoke previously granted
              consent for data processing activities, including social media
              account connections.
            </li>
          </ul>
          <p>
            To exercise any of these rights, please contact us using the
            information provided below.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "0.75rem",
            }}
          >
            8. Cookies and Tracking
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            We use cookies to store authentication tokens (access tokens and
            refresh tokens) and user session data. These cookies are essential
            for the Service to function and are not used for advertising or
            tracking purposes. By using the Service, you consent to the use of
            these essential cookies.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "0.75rem",
            }}
          >
            9. Third-Party Services
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            Our Service integrates with third-party services, including AI
            content generation providers, OAuth authentication providers
            (Google, GitHub, LinkedIn, Facebook), and social media platforms.
            Each third-party service has its own privacy policy, and we
            encourage you to review them. We are not responsible for the privacy
            practices of third-party services.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "0.75rem",
            }}
          >
            10. Children&apos;s Privacy
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            The Service is not intended for use by individuals under the age of
            13 (or the applicable age of digital consent in your jurisdiction).
            We do not knowingly collect personal information from children. If
            you become aware that a child has provided us with personal
            information, please contact us so we can take appropriate action.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "0.75rem",
            }}
          >
            11. Changes to This Privacy Policy
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the &quot;Last updated&quot; date. Your continued use
            of the Service after any changes constitute your acceptance of the
            updated policy.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "0.75rem",
            }}
          >
            12. Contact Us
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            If you have any questions about this Privacy Policy, please contact
            us via our{" "}
            <Link
              href="/contact"
              style={{
                color: "var(--primary-color)",
                textDecoration: "underline",
              }}
            >
              Contact Page
            </Link>
            .
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
