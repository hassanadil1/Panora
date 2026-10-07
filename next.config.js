/** @type {import('next').NextConfig} */
const embedFrameSrc = [
  "'self'",
  "https://my.matterport.com",
  "https://*.matterport.com",
  "https://momento360.com",
  "https://*.momento360.com",
  "https://roundme.com",
  "https://*.roundme.com",
  "https://kuula.co",
  "https://*.kuula.co",
  "https://vrway.com",
  "https://*.vrway.com",
];

const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.mapbox.com",
              "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
              "img-src 'self' data: blob: https://*.mapbox.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://events.mapbox.com",
              `frame-src ${embedFrameSrc.join(" ")}`,
              "worker-src blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
