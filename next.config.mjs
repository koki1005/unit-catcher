/** @type {import('next').NextConfig} */
const nextConfig = {
  // html5-qrcode uses browser APIs — prevent server-side import errors
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'html5-qrcode']
    }
    return config
  },
}

export default nextConfig
