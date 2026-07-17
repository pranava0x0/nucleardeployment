import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGitHubPages ? "/nucleardeployment" : "";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  ...(isGitHubPages ? { generateBuildId: async () => process.env.GITHUB_SHA?.slice(0, 12) ?? "local-pages" } : {}),
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: isGitHubPages,
  images: { unoptimized: true },
  typescript: { tsconfigPath: isGitHubPages ? "tsconfig.pages.json" : "tsconfig.json" },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
