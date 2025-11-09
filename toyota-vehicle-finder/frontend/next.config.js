const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'www.buyatoyota.com',
      'buyatoyota.com',
      'www.toyota.com',
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
}
module.exports = nextConfig
