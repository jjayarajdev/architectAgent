/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ea-mcp/agent-sprint0', '@ea-mcp/common', '@ea-mcp/tools'],
  experimental: {
    serverComponentsExternalPackages: ['@ea-mcp/agent-sprint0']
  }
}

module.exports = nextConfig