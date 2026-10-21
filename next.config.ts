import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Product and category slugs are resolved on demand so catalogue CRUD does
  // not require a database connection or a seeded catalogue during the build.
};

export default nextConfig;
