import settings from "@/contents/site-settings.json";

const siteConfig = {
  get siteName() {
    return (
      process.env.NEXT_PUBLIC_APP_NAME || settings.site_title || "PopArticle"
    );
  },
  get tagline() {
    return settings.site_tagline || "AI-Powered Content Platform";
  },
  get description() {
    return settings.site_description || "";
  },
  get logoText() {
    return (
      process.env.NEXT_PUBLIC_APP_NAME ||
      settings.logo_text ||
      settings.site_title ||
      "PopArticle"
    );
  },
  get copyrightHolder() {
    return settings.copyright_holder || this.siteName;
  },
  get contactEmail() {
    return settings.contact_email || "";
  },
};

export default siteConfig;
