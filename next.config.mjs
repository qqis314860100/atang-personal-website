import createNextIntlPlugin from 'next-intl/plugin'
import { spawn } from 'child_process'
import path from 'path'

const withNextIntl = createNextIntlPlugin()

// 在开发环境启动 i18n 文件监听服务
if (process.env.NODE_ENV === 'development') {
  let i18nWatcher = null
  
  const startI18nWatcher = () => {
    if (i18nWatcher) return
    
    console.log('🔥 启动 i18n 热更新服务...')
    i18nWatcher = spawn('node', ['scripts/watch-i18n.cjs'], {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    
    i18nWatcher.on('error', (error) => {
      console.error('❌ i18n 热更新服务启动失败:', error)
    })
    
    i18nWatcher.on('exit', (code) => {
      if (code !== 0) {
        console.log(`⚠️  i18n 热更新服务退出，代码: ${code}`)
      }
      i18nWatcher = null
    })
  }
  
  // 优雅退出处理
  const cleanup = () => {
    if (i18nWatcher) {
      console.log('\n🛑 正在关闭 i18n 热更新服务...')
      i18nWatcher.kill('SIGTERM')
      i18nWatcher = null
    }
  }
  
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
  process.on('exit', cleanup)
  
  // 延迟启动，确保 Next.js 服务器先启动
  setTimeout(startI18nWatcher, 2000)
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除无效的 experimental 选项
  experimental: {
    // 移除不支持的 searchParams 配置和无效的配置选项
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

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // Vercel优化配置
//   experimental: {
//     serverComponentsExternalPackages: ['@supabase/supabase-js']
//   },

//   // 图片优化
//   images: {
//     domains: ['your-domain.com', 'supabase.co'],
//     formats: ['image/webp', 'image/avif']
//   },

//   // 重定向配置
//   async redirects() {
//     return [
//       {
//         source: '/home',
//         destination: '/',
//         permanent: true,
//       },
//     ]
//   },

//   // 头部配置
//   async headers() {
//     return [
//       {
//         source: '/(.*)',
//         headers: [
//           {
//             key: 'X-Frame-Options',
//             value: 'DENY',
//           },
//           {
//             key: 'X-Content-Type-Options',
//             value: 'nosniff',
//           },
//         ],
//       },
//     ]
//   },
// }

// export default nextConfig

export default withNextIntl(nextConfig)
