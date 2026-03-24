/**
 * Generates a professional logo SVG string for icon generation.
 * Used by scripts/generate-icons.js to create favicons and app icons.
 */
function generateLogoSvg({ logoText, size, palette, bgColor }) {
  const colors =
    Array.isArray(palette) && palette.length >= 2
      ? palette
      : ["#6366f1", "#8b5cf6"];

  const words = logoText.split(" ").filter(Boolean);
  // Use first letter of each word (max 2) for the icon monogram
  const initials = words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const fontSize = size * 0.38;
  const padding = size * 0.12;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors[0]}"/>
      <stop offset="100%" stop-color="${colors[1]}"/>
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.25)"/>
      <stop offset="50%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#bg)"/>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#shine)"/>
  <text
    x="50%"
    y="53%"
    dominant-baseline="middle"
    text-anchor="middle"
    fill="white"
    font-family="'Montserrat', 'SF Pro Display', system-ui, -apple-system, sans-serif"
    font-weight="800"
    font-size="${fontSize}"
    letter-spacing="${size * -0.01}"
  >${initials}</text>
</svg>`;
}

module.exports = { generateLogoSvg, generateOgBannerSvg };

/**
 * Generates a 1200×630 Open Graph banner SVG.
 */
function generateOgBannerSvg({ siteTitle, tagline, palette }) {
  const colors =
    Array.isArray(palette) && palette.length >= 2
      ? palette
      : ["#6366f1", "#8b5cf6"];

  const words = siteTitle.split(" ").filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors[0]}"/>
      <stop offset="100%" stop-color="${colors[1]}"/>
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.12)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)" opacity="0.5"/>
  <circle cx="1050" cy="80" r="200" fill="rgba(255,255,255,0.06)"/>
  <circle cx="150" cy="550" r="180" fill="rgba(255,255,255,0.05)"/>
  <circle cx="1100" cy="500" r="120" fill="rgba(255,255,255,0.04)"/>
  <rect x="88" y="200" width="100" height="100" rx="22" fill="rgba(255,255,255,0.18)"/>
  <text x="138" y="258" dominant-baseline="middle" text-anchor="middle"
    fill="white" font-family="system-ui,-apple-system,sans-serif"
    font-weight="800" font-size="44">${initials}</text>
  <text x="88" y="345" fill="white"
    font-family="system-ui,-apple-system,sans-serif"
    font-weight="800" font-size="80" letter-spacing="-2">${siteTitle}</text>
  <text x="88" y="410" fill="rgba(255,255,255,0.82)"
    font-family="system-ui,-apple-system,sans-serif"
    font-weight="400" font-size="30" letter-spacing="0.5">${tagline || ""}</text>
  <rect x="88" y="490" width="160" height="4" rx="2" fill="rgba(255,255,255,0.4)"/>
</svg>`;
}
