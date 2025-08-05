import { ModuleTracker } from '../types'
import { analytics } from '../core'

/**
 * 博客模块埋点器
 *
 * 负责追踪博客相关的所有用户行为，包括：
 * - 文章阅读行为（阅读时长、完成率）
 * - 文章操作（创建、编辑、删除、发布）
 * - 分类使用情况
 * - 搜索行为
 * - 目录使用情况
 *
 * 这些数据用于：
 * - 分析用户阅读偏好
 * - 优化内容策略
 * - 提升用户体验
 * - 内容推荐算法
 */
export class BlogTracker implements ModuleTracker {
  moduleName = 'blog'
  version = '1.0.0'

  /**
   * 初始化博客埋点器
   */
  initialize(): void {
    console.log('Blog tracker initialized')
  }

  /**
   * 处理博客相关事件
   *
   * @param eventType 事件类型
   * @param data 事件数据
   */
  trackEvent(eventType: string, data: any): void {
    switch (eventType) {
      case 'post_view':
        this.trackPostView(data)
        break
      case 'post_action':
        this.trackPostAction(data)
        break
      case 'category_usage':
        this.trackCategoryUsage(data)
        break
      case 'search':
        this.trackSearch(data)
        break
      case 'toc_usage':
        this.trackTocUsage(data)
        break
      default:
        console.log(`Unknown blog event type: ${eventType}`)
    }
  }

  /**
   * 追踪博客模块的性能指标
   *
   * @param metric 性能指标名称
   * @param value 性能指标数值
   */
  trackPerformance(metric: string, value: number): void {
    analytics.trackPerformance(`blog_${metric}`, value, 'ms')
  }

  /**
   * 追踪博客模块的错误
   *
   * @param error 错误对象
   * @param context 错误上下文信息
   */
  trackError(error: Error, context?: any): void {
    analytics.trackError('blog_error', error.message, error.stack, context)
  }

  private trackPostView(data: {
    postId: string
    readTime: number
    completionRate: number
    categoryId?: string
  }) {
    analytics.trackBusinessEvent('post_view', data.postId, {
      readTime: data.readTime,
      completionRate: data.completionRate,
      categoryId: data.categoryId,
    })
  }

  private trackPostAction(data: {
    action: 'create' | 'edit' | 'delete' | 'publish'
    postId: string
    success: boolean
  }) {
    analytics.trackUserAction(`post_${data.action}`, data.postId, data.success)
  }

  private trackCategoryUsage(data: {
    categoryId: string
    action: 'view' | 'filter' | 'create'
  }) {
    analytics.trackUserAction(`category_${data.action}`, data.categoryId)
  }

  private trackSearch(data: {
    query: string
    results: number
    clickedResult?: string
  }) {
    analytics.trackBusinessEvent('search', 'search', {
      query: data.query,
      results: data.results,
      clickedResult: data.clickedResult,
    })
  }

  private trackTocUsage(data: {
    postId: string
    clickedSection: string
    scrollPosition: number
  }) {
    analytics.trackUserAction(
      'toc_click',
      data.postId,
      true,
      undefined,
      undefined
    )
    analytics.trackBusinessEvent('toc_usage', data.postId, {
      clickedSection: data.clickedSection,
      scrollPosition: data.scrollPosition,
    })
  }
}
