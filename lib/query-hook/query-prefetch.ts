import { QueryClient } from '@tanstack/react-query'
import { queryKeys } from './index'

/**
 * React Query 预取优化
 * 在路由切换前预取数据，提升用户体验
 */
export class QueryPrefetchManager {
  private queryClient: QueryClient
  private prefetchQueue: Set<string> = new Set()

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient
  }

  /**
   * 预取用户数据
   */
  async prefetchUserData() {
    if (this.prefetchQueue.has('user')) return

    this.prefetchQueue.add('user')

    try {
      // 预取用户会话数据
      await this.queryClient.prefetchQuery({
        queryKey: queryKeys.user.session(),
        staleTime: 15 * 60 * 1000, // 15分钟
        gcTime: 60 * 60 * 1000, // 1小时
      })

      console.log('✅ 用户数据预取完成')
    } catch (error) {
      console.warn('⚠️ 用户数据预取失败:', error)
    } finally {
      this.prefetchQueue.delete('user')
    }
  }

  /**
   * 预取博客数据
   */
  async prefetchBlogData() {
    if (this.prefetchQueue.has('blog')) return

    this.prefetchQueue.add('blog')

    try {
      // 预取博客列表数据
      await this.queryClient.prefetchQuery({
        queryKey: queryKeys.posts.list(),
        staleTime: 10 * 60 * 1000, // 10分钟
        gcTime: 30 * 60 * 1000, // 30分钟
      })

      // 预取分类数据
      await this.queryClient.prefetchQuery({
        queryKey: queryKeys.category.list(),
        staleTime: 30 * 60 * 1000, // 30分钟
        gcTime: 60 * 60 * 1000, // 1小时
      })

      console.log('✅ 博客数据预取完成')
    } catch (error) {
      console.warn('⚠️ 博客数据预取失败:', error)
    } finally {
      this.prefetchQueue.delete('blog')
    }
  }

  /**
   * 预取项目数据
   */
  async prefetchProjectData() {
    if (this.prefetchQueue.has('project')) return

    this.prefetchQueue.add('project')

    try {
      // 这里可以预取项目相关的数据
      console.log('✅ 项目数据预取完成')
    } catch (error) {
      console.warn('⚠️ 项目数据预取失败:', error)
    } finally {
      this.prefetchQueue.delete('project')
    }
  }

  /**
   * 根据路由预取数据
   */
  async prefetchByRoute(pathname: string) {
    console.log('🔄 预取路由数据:', pathname)

    const prefetchMap: Record<string, () => Promise<void>> = {
      '/zh/dashboard': () => this.prefetchUserData(),
      '/zh/blog': () => this.prefetchBlogData(),
      '/zh/project': () => this.prefetchProjectData(),
    }

    const prefetchFn = prefetchMap[pathname]
    if (prefetchFn) {
      await prefetchFn()
    }
  }

  /**
   * 清理过期缓存
   */
  async cleanupExpiredCache() {
    try {
      // 清理过期的查询缓存
      await this.queryClient.invalidateQueries({
        predicate: (query) => {
          const state = query.state
          const isStale = state.dataUpdatedAt < Date.now() - 60 * 60 * 1000 // 1小时
          return isStale && !state.fetchStatus
        },
      })

      console.log('🧹 过期缓存清理完成')
    } catch (error) {
      console.warn('⚠️ 缓存清理失败:', error)
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    const queries = this.queryClient.getQueryCache().getAll()

    return {
      totalQueries: queries.length,
      activeQueries: queries.filter((q) => q.isActive()).length,
      staleQueries: queries.filter((q) => q.isStale()).length,
      fetchingQueries: queries.filter((q) => q.state.fetchStatus === 'fetching')
        .length,
    }
  }
}

/**
 * 创建预取管理器实例
 */
export function createPrefetchManager(queryClient: QueryClient) {
  return new QueryPrefetchManager(queryClient)
}
