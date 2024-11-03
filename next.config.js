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
  // ... any other config options you have
}

module.exports = nextConfig
