'use client'

import dynamic from 'next/dynamic'
import { SkeletonLoading } from './ui/loading-spinner'

// 懒加载 Dashboard 组件
export const LazyDashboard = dynamic(
  () =>
    import('@/app/[locale]/dashboard/page').then((mod) => ({
      default: mod.default,
    })),
  {
    loading: () => <SkeletonLoading className="min-h-screen" />,
    ssr: false, // 禁用服务端渲染，提升性能
  }
)

// 懒加载 Blog 组件
export const LazyBlog = dynamic(
  () =>
    import('@/app/[locale]/blog/page').then((mod) => ({
      default: mod.default,
    })),
  {
    loading: () => <SkeletonLoading className="min-h-screen" />,
    ssr: false,
  }
)

// 懒加载 Project 组件
export const LazyProject = dynamic(
  () =>
    import('@/app/[locale]/project/page').then((mod) => ({
      default: mod.default,
    })),
  {
    loading: () => <SkeletonLoading className="min-h-screen" />,
    ssr: false,
  }
)

// 懒加载 User Resume 组件
export const LazyUserResume = dynamic(
  () =>
    import('@/app/[locale]/user/resume/page').then((mod) => ({
      default: mod.default,
    })),
  {
    loading: () => <SkeletonLoading className="min-h-screen" />,
    ssr: false,
  }
)

// 懒加载 Analytics 组件
export const LazyAnalytics = dynamic(
  () =>
    import('@/components/analytics/analytics-summary').then((mod) => ({
      default: mod.default,
    })),
  {
    loading: () => <SkeletonLoading className="h-64" />,
    ssr: false,
  }
)

// 懒加载 Socket 测试组件
export const LazySocketTest = dynamic(
  () =>
    import('@/app/test-socket/page').then((mod) => ({ default: mod.default })),
  {
    loading: () => <SkeletonLoading className="min-h-screen" />,
    ssr: false,
  }
)
