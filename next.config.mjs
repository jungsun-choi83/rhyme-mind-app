/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/sample-3s.mp3", destination: "/", permanent: false },
      { source: "/sample-3s", destination: "/", permanent: false },
    ]
  },
}

export default nextConfig
