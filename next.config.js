/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: {
      displayName: true,
      ssr: true,
      fileName: true,
    },
  },
  transpilePackages: [
    '@nesolagus/core',
    '@nesolagus/survey-components',
    '@nesolagus/dashboard-widgets',
  ],
  // Enable static exports for assets
  output: 'standalone',
}

module.exports = nextConfig
