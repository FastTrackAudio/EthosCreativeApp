/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: ["lh3.googleusercontent.com", "res.cloudinary.com"],
  },
}

module.exports = nextConfig
