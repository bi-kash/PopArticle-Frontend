const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const pngToIco = require("png-to-ico").default;

// Read site settings
const siteSettings = require("../src/contents/site-settings.json");

const OUTPUT_DIR = path.join(__dirname, "../public/meta");
const SITE_NAME = siteSettings.logo_text || siteSettings.site_title || "Site";

// Icon sizes to generate
const ICON_SIZES = [
  { name: "favicon.png", size: 32 },
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "logo-192.png", size: 192 },
  { name: "logo-512.png", size: 512 },
  { name: "maskable_icon_x192.png", size: 192 },
  { name: "maskable_icon_x512.png", size: 512 },
];

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Function to generate text-based icon using SVG
const {
  generateLogoSvg,
  generateOgBannerSvg,
} = require("../src/utils/logoSvg");

async function generateIcon(text, size, outputPath) {
  const svg = generateLogoSvg({
    logoText: text,
    size,
    palette: siteSettings.logo_colors,
    bgColor: siteSettings.logo_bg_color || "#FFFFFF",
  });

  // Convert SVG to PNG using sharp
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(outputPath);
}

// Main execution
async function generateAllIcons() {
  console.log("🎨 Generating icons for:", SITE_NAME);
  console.log("📁 Output directory:", OUTPUT_DIR);

  try {
    for (const icon of ICON_SIZES) {
      const outputPath = path.join(OUTPUT_DIR, icon.name);
      console.log(`⏳ Generating ${icon.name} (${icon.size}x${icon.size})...`);
      await generateIcon(SITE_NAME, icon.size, outputPath);
      console.log(`✅ Created ${icon.name}`);
    }

    console.log("\n🎉 All icons generated successfully!");

    // Copy favicon to public root for browsers that look for /favicon.png
    fs.copyFileSync(
      path.join(OUTPUT_DIR, "favicon.png"),
      path.join(__dirname, "../public/favicon.png"),
    );
    console.log("📋 Copied favicon.png to public root");

    // Generate favicon.ico for maximum browser tab compatibility
    const faviconIcoBuffer = await pngToIco([
      fs.readFileSync(path.join(OUTPUT_DIR, "favicon-16x16.png")),
      fs.readFileSync(path.join(OUTPUT_DIR, "favicon-32x32.png")),
    ]);
    fs.writeFileSync(path.join(OUTPUT_DIR, "favicon.ico"), faviconIcoBuffer);
    fs.writeFileSync(
      path.join(__dirname, "../public/favicon.ico"),
      faviconIcoBuffer,
    );
    console.log("📋 Generated favicon.ico in meta and public root");

    // Generate OG banner (1200x630)
    console.log("⏳ Generating og-default.png (1200x630)...");
    const ogSvg = generateOgBannerSvg({
      siteTitle: siteSettings.site_title || SITE_NAME,
      tagline: siteSettings.site_tagline || siteSettings.site_description || "",
      palette: siteSettings.logo_colors,
    });
    await sharp(Buffer.from(ogSvg))
      .resize(1200, 630)
      .png()
      .toFile(path.join(OUTPUT_DIR, "og-default.png"));
    // Also copy to public root so /og-default.png works
    fs.copyFileSync(
      path.join(OUTPUT_DIR, "og-default.png"),
      path.join(__dirname, "../public/og-default.png"),
    );
    console.log("✅ Created og-default.png");

    // Generate site.webmanifest
    const manifest = {
      name: siteSettings.site_title || "BackSuit",
      short_name: siteSettings.site_title || "BackSuit",
      description: siteSettings.site_description || "",
      icons: [
        { src: "/meta/logo-192.png", sizes: "192x192", type: "image/png" },
        { src: "/meta/logo-512.png", sizes: "512x512", type: "image/png" },
        {
          src: "/meta/maskable_icon_x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: "/meta/maskable_icon_x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      start_url: "/",
      display: "standalone",
      theme_color: siteSettings.logo_colors?.[0] || "#6366f1",
      background_color: "#ffffff",
    };
    fs.writeFileSync(
      path.join(OUTPUT_DIR, "site.webmanifest"),
      JSON.stringify(manifest, null, 2),
    );
    console.log("📋 Generated site.webmanifest");

    console.log(
      "\n💡 Tip: Icons are based on logo_text from site-settings.json",
    );
  } catch (error) {
    console.error("❌ Error generating icons:", error);
    process.exit(1);
  }
}

// Run the script
generateAllIcons();
