/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'shrcmfucebizlfxkuest.supabase.co'],
  },
}

module.exports = nextConfig