import { QueryClient } from '@tanstack/react-query'

// 创建 React Query 客户端
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 默认查询配置
      staleTime: 10 * 60 * 1000, // 10分钟数据保持新鲜
      gcTime: 30 * 60 * 1000, // 30分钟垃圾回收时间
      retry: 1, // 失败重试1次
      refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
      refetchOnMount: false, // 组件挂载时不重新获取
      refetchOnReconnect: false, // 网络重连时不重新获取
    },
    mutations: {
      // 默认变更配置
      retry: 1, // 失败重试1次
    },
  },
})

// all - 模块的根键，用于批量操作
// 具体函数 - 返回特定查询的键，用于具体的数据获取
// 层级结构 - 通过数组构建层级关系，便于缓存管理
// 类型安全 - 使用 TypeScript 确保键的正确性
// 可维护性 - 集中管理，易于修改和扩展
/**

 * const queryCache = new Map()

实际结构类似这样：
{
  // 查询键: ['user']
  "['user']": {
    data: UserData,
    status: 'success',
    dataUpdatedAt: 1234567890,
    // ... 其他元数据
}}
 */

// 查询键工厂
export const queryKeys = {
  // 用户相关
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    session: () => [...queryKeys.user.all, 'session'] as const,
  },

  // PDF 注释相关
  annotations: {
    all: ['annotations'] as const,
    list: (pdfUrl?: string) =>
      [...queryKeys.annotations.all, 'list', pdfUrl] as const,
    detail: (id: string) =>
      [...queryKeys.annotations.all, 'detail', id] as const,
  },

  // 博客文章相关
  posts: {
    all: ['posts'] as const,
    list: () => [...queryKeys.posts.all, 'list'] as const,
    detail: (slug: string) => [...queryKeys.posts.all, 'detail', slug] as const,
  },

  // 文件上传相关
  uploads: {
    all: ['uploads'] as const,
    resume: () => [...queryKeys.uploads.all, 'resume'] as const,
  },
  // 设置相关
  setting: {
    all: ['setting'] as const,
    password: () => [...queryKeys.setting.all, 'password'] as const,
  },
}
