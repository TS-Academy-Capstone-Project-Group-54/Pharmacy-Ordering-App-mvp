type NextConfig = {
  images?: {
    remotePatterns?: Array<{
      protocol: string;
      hostname: string;
    }>;
  };
};

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
