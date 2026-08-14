/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production";

// 'unsafe-inline' / 'unsafe-eval' are required by Next's runtime (and by the
// dev overlay). They weaken script-src, but the directive still blocks script
// from any origin not listed here, which is the bulk of the benefit. Tightening
// further means migrating to nonce-based CSP via middleware.
// Google Identity Services pulls a script, a stylesheet, an iframe and avatar
// images from these origins. Every one has to be allowed explicitly or the
// sign-in button silently fails to render.
const GOOGLE_SCRIPT = "https://accounts.google.com https://apis.google.com";
const GOOGLE_STYLE = "https://accounts.google.com";
const GOOGLE_FRAME = "https://accounts.google.com";
const GOOGLE_CONNECT = "https://accounts.google.com";
const GOOGLE_IMG = "https://lh3.googleusercontent.com https://ssl.gstatic.com";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${GOOGLE_SCRIPT}`,
  // style-src-elem falls back to style-src; GSI loads /gsi/style from Google.
  `style-src 'self' 'unsafe-inline' ${GOOGLE_STYLE}`,
  `style-src-elem 'self' 'unsafe-inline' ${GOOGLE_STYLE}`,
  `img-src 'self' data: blob: https: ${GOOGLE_IMG}`,
  "font-src 'self' data:",
  `connect-src 'self' ${GOOGLE_CONNECT}`,
  `frame-src ${GOOGLE_FRAME}`,               // Google Sign-In renders in an iframe
  "form-action 'self'",
  "frame-ancestors 'none'",                  // clickjacking
  "base-uri 'self'",
  "object-src 'none'",
  isProd ? "upgrade-insecure-requests" : "",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  // HSTS only in production — it would pin localhost to https otherwise.
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  poweredByHeader: false, // don't advertise the framework
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Admin pages and API responses must never be cached by a shared proxy.
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        source: "/leg-deals-admin",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
