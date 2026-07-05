import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Next doesn't get confused by other lockfiles
  // that may exist higher up in the user's home directory.
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Lesson audio (two tracks, up to ~an hour each) is uploaded to the
    // transcribe Server Action; the default 1MB cap is far too small.
    serverActions: {
      bodySizeLimit: "80mb",
    },
  },
};

export default nextConfig;
