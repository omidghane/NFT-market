/** @type {import('next').NextConfig} */
const nextConfig = {
  env:{
    infuraId: process.env.INFURA_ID,
  },
  reactStrictMode: true,
}

module.exports = nextConfig
