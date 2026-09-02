/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/landing',
        // Temporary on purpose: a 308 is cached hard by browsers and would be
        // painful to undo. Switch to `true` once /landing is the final home.
        permanent: false,
      },
    ]
  },
}

export default nextConfig
