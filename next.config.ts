import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@payloadcms/db-sqlite",
    "@esbuild/darwin-x64",
    "@esbuild/darwin-arm64",
    "better-sqlite3",
    "@libsql/client",
    "esbuild",
  ],
};

export default withPayload(nextConfig);
