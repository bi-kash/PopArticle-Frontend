import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service - PopArticle</title>
        <meta
          name="description"
          content="Terms of Service for PopArticle - AI-Powered Content Platform"
        />

        {/* Open Graph */}
        <meta property="og:title" content="Terms of Service - PopArticle" />
        <meta
          property="og:description"
          content="Terms of Service for PopArticle - AI-Powered Content Platform"
        />
        <meta property="og:image" content="/og-default.svg" />
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
          Terms of Service
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
            1. Acceptance of Terms
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            By accessing or using the PopArticle platform (&quot;Service&quot;),
            you agree to be bound by these Terms of Service (&quot;Terms&quot;).
            If you do not agree to these Terms, you may not access or use the
            Service. These Terms apply to all visitors, users, and others who
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
            2. Description of Service
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            PopArticle is an AI-powered content generation, management, and
            distribution platform. The Service allows users to:
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              Generate articles using artificial intelligence
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Create, edit, and manage content in HTML and Markdown formats
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Organize content using categories and multi-tenant workspaces
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Schedule and publish content to connected social media platforms
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Collaborate with team members within organizations
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Manage multiple websites/tenants from a single account
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
            3. Account Registration
          </h2>
          <p style={{ marginBottom: "0.75rem" }}>
            To access certain features of the Service, you must register for an
            account. When registering, you agree to:
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              Provide accurate, current, and complete information
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Maintain and promptly update your account information
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Maintain the security of your password and accept all risks of
              unauthorized access
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Immediately notify us of any unauthorized use of your account
            </li>
          </ul>
          <p>
            You may register using email/password or through supported OAuth
            providers (Google, GitHub, LinkedIn, Facebook). You are responsible
            for all activity that occurs under your account.
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
            4. User Content
          </h2>

          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
            }}
          >
            4.1 Your Content
          </h3>
          <p style={{ marginBottom: "1rem" }}>
            You retain ownership of all content you create, upload, or generate
            through the Service (&quot;User Content&quot;). By using the
            Service, you grant PopArticle a non-exclusive, worldwide,
            royalty-free license to store, display, and process your User
            Content solely for the purpose of providing the Service to you.
          </p>

          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
            }}
          >
            4.2 AI-Generated Content
          </h3>
          <p style={{ marginBottom: "1rem" }}>
            Content generated by our AI tools is provided &quot;as is.&quot; You
            are solely responsible for reviewing, editing, and publishing
            AI-generated content. We do not guarantee the accuracy, originality,
            or suitability of AI-generated content. You agree to review all
            AI-generated content before publishing or distributing it.
          </p>

          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
            }}
          >
            4.3 Prohibited Content
          </h3>
          <p style={{ marginBottom: "0.75rem" }}>
            You agree not to create or distribute content that:
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              Infringes on intellectual property rights of others
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Is unlawful, harmful, threatening, abusive, harassing, defamatory,
              or invasive of privacy
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Contains malware, spam, or phishing content
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Violates any applicable laws or regulations
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Impersonates any person or entity
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
            5. Social Media Integration
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            The Service allows you to connect third-party social media accounts
            for content distribution. By connecting your social media accounts,
            you:
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              Authorize PopArticle to post content to your connected accounts on
              your behalf
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Agree to comply with the terms of service of each connected
              platform
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Acknowledge that social media platforms may modify or restrict
              their APIs, which may affect the Service&apos;s functionality
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Accept responsibility for all content posted through the Service
              to your social media accounts
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              May revoke access at any time through your PopArticle account
              settings or directly through the social media platform
            </li>
          </ul>
          <p style={{ marginBottom: "1rem" }}>
            We store social media access tokens securely and use them only for
            the purposes you have authorized. We do not post to your accounts
            without your explicit action or scheduled instruction.
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
            6. Multi-Tenant Usage
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            PopArticle supports multi-tenant architecture, allowing
            organizations to create and manage separate workspaces. As a tenant
            administrator, you are responsible for:
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              Managing team member access and permissions within your tenant
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Ensuring team members comply with these Terms
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Controlling content published under your tenant&apos;s domains
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
            7. API Usage
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            If you use our API (via API keys or Bearer tokens), you agree to:
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              Keep your API keys confidential and secure
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Not share API keys with unauthorized parties
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Use the API in accordance with our rate limits and documentation
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Not attempt to reverse-engineer, decompile, or disassemble the
              Service
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
            8. Intellectual Property
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            The Service, including its original content, features, and
            functionality, is and will remain the exclusive property of
            PopArticle. The Service is protected by copyright, trademark, and
            other laws. Our trademarks and trade dress may not be used in
            connection with any product or service without prior written
            consent.
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
            9. Termination
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            We may terminate or suspend your account immediately, without prior
            notice or liability, for any reason, including breach of these
            Terms. Upon termination, your right to use the Service will
            immediately cease. You may also delete your account at any time. All
            provisions of these Terms which by their nature should survive
            termination shall survive, including ownership provisions, warranty
            disclaimers, indemnity, and limitations of liability.
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
            10. Disclaimer of Warranties
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS
            AVAILABLE&quot; BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER
            EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE
            UNINTERRUPTED, SECURE, OR ERROR-FREE. WE MAKE NO WARRANTIES
            REGARDING THE ACCURACY OR RELIABILITY OF AI-GENERATED CONTENT. YOUR
            USE OF THE SERVICE IS AT YOUR SOLE RISK.
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
            11. Limitation of Liability
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            IN NO EVENT SHALL POPARTICLE, ITS DIRECTORS, EMPLOYEES, PARTNERS,
            AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
            WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER
            INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF (OR
            INABILITY TO ACCESS OR USE) THE SERVICE, CONTENT POSTED THROUGH THE
            SERVICE TO SOCIAL MEDIA PLATFORMS, OR ANY AI-GENERATED CONTENT.
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
            12. Indemnification
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            You agree to indemnify and hold harmless PopArticle and its
            officers, directors, employees, and agents from any claims, damages,
            losses, liabilities, and expenses (including attorneys&apos; fees)
            arising out of or relating to your use of the Service, your User
            Content, your violation of these Terms, or your violation of any
            rights of another party, including content posted to social media
            platforms through the Service.
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
            13. Governing Law
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            These Terms shall be governed by and construed in accordance with
            applicable laws, without regard to conflict of law provisions. Any
            disputes arising from these Terms or the Service shall be resolved
            through good-faith negotiation, and if necessary, through binding
            arbitration or in the courts of competent jurisdiction.
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
            14. Changes to Terms
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            We reserve the right to modify or replace these Terms at any time.
            If a revision is material, we will provide reasonable notice prior
            to any new terms taking effect. Your continued use of the Service
            after any changes constitutes acceptance of the new Terms.
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
            15. Contact Us
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            If you have any questions about these Terms of Service, please
            contact us via our{" "}
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
