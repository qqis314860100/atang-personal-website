import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除无效的 experimental 选项
  experimental: {
    // 移除不支持的 searchParams 配置
    // 禁用一些可能导致问题的开发工具功能
    instrumentationHook: false,
    // 禁用开发工具以减少错误
    devIndicators: {
      buildActivity: false,
      buildActivityPosition: 'bottom-right',
    },
  },

  // 生产环境启用浏览器源映射
  productionBrowserSourceMaps: true,

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

  // 优化 webpack 配置
  webpack: (config, { dev, isServer }) => {
    // 优化客户端构建
    if (!isServer && !dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            // 优化搜索参数相关代码
            searchParams: {
              test: /[\\/]node_modules[\\/].*search-params.*[\\/]/,
              name: 'search-params',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      }
    }

    return config
  },
}

export default withNextIntl(nextConfig)
