/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "utfs.io", // UploadThing domain
      "lh3.googleusercontent.com", // For Google profile images
      "avatars.githubusercontent.com", // Optional: For GitHub avatars if needed
      "images.unsplash.com", // Optional: For Unsplash images if used
    ],
  },
  webpack: (config, { isServer }) => {
    // Canvas is only needed on the server
    if (isServer) {
      config.externals.push({
        canvas: 'commonjs canvas',
      });
    }

    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    return config;
  },
  transpilePackages: ['react-pdf', 'pdfjs-dist']
}

module.exports = nextConfig
