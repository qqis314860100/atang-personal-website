import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除无效的 experimental 选项
  experimental: {
    // trace: false, // 已移除
    // serverComponentsExternalPackages: [], // 已移除
  },

  // 更新为新的配置选项
  serverExternalPackages: [], // 替代 serverComponentsExternalPackages

  // 禁用一些可能导致问题的功能
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: false,
  },
  // 禁用遥测
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
  },
  // 确保客户端导航正常工作
  reactStrictMode: true,
  // 移除 webpack 配置以避免与 Turbopack 冲突
}

export default withNextIntl(nextConfig)
