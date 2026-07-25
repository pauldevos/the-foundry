import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // src/lib/content.ts reads learning/**/* via runtime-computed fs paths (a
  // walked directory, not a static import), which Next's build-time file
  // tracer can't discover on its own — without this, content reads would
  // work in `next dev`/`next start` locally but 404-empty on Vercel, since
  // the serverless function bundle wouldn't include learning/ at all.
  outputFileTracingIncludes: {
    "/*": ["learning/**/*"],
  },
};

export default nextConfig;
