// 页面路径映射系统
export interface PageMapping {
  path: string
  name: string
  category: string
  description?: string
}

// 页面映射配置
export const PAGE_MAPPINGS: PageMapping[] = [
  // 主页相关
  { path: '/', name: '主页', category: 'content' },
  { path: '/zh', name: '主页', category: 'content' },
  { path: '/en', name: '主页', category: 'content' },
  { path: '/dashboard', name: '主页', category: 'content' },
  { path: '/zh/dashboard', name: '主页', category: 'content' },
  { path: '/en/dashboard', name: '主页', category: 'content' },

  // 博客相关
  { path: '/blog', name: '博客列表', category: 'content' },
  { path: '/zh/blog', name: '博客列表', category: 'content' },
  { path: '/en/blog', name: '博客列表', category: 'content' },
  { path: '/blog/[id]', name: '博客内容', category: 'content' },
  { path: '/zh/blog/[id]', name: '博客内容', category: 'content' },
  { path: '/en/blog/[id]', name: '博客内容', category: 'content' },

  // 分析相关
  { path: '/analytics', name: '数据分析', category: 'analytics' },
  { path: '/zh/analytics', name: '数据分析', category: 'analytics' },
  { path: '/en/analytics', name: '数据分析', category: 'analytics' },

  // 用户相关
  { path: '/profile', name: '个人资料', category: 'user' },
  { path: '/zh/profile', name: '个人资料', category: 'user' },
  { path: '/en/profile', name: '个人资料', category: 'user' },
  { path: '/settings', name: '设置', category: 'user' },
  { path: '/zh/settings', name: '设置', category: 'user' },
  { path: '/en/settings', name: '设置', category: 'user' },

  // 其他页面
  { path: '/about', name: '关于我们', category: 'content' },
  { path: '/zh/about', name: '关于我们', category: 'content' },
  { path: '/en/about', name: '关于我们', category: 'content' },
  { path: '/contact', name: '联系我们', category: 'content' },
  { path: '/zh/contact', name: '联系我们', category: 'content' },
  { path: '/en/contact', name: '联系我们', category: 'content' },
]

// 页面路径解析函数
export function parsePagePath(pathname: string): {
  name: string
  category: string
  originalPath: string
  pathAnalysis: PathAnalysis
} {
  // 移除查询参数
  const cleanPath = pathname.split('?')[0]

  // 路径分析
  const pathAnalysis: PathAnalysis = {
    segments: cleanPath.split('/').filter(Boolean),
    depth: cleanPath.split('/').filter(Boolean).length,
    hasQueryParams: pathname.includes('?'),
    isDynamic: cleanPath.includes('[') || /\d+/.test(cleanPath),
    locale: '',
    category: '',
    subPaths: [],
    queryParams: [],
  }

  // 解析路径段
  if (pathAnalysis.segments.length > 0) {
    pathAnalysis.locale = pathAnalysis.segments[0]
    pathAnalysis.category = pathAnalysis.segments[1] || 'home'
    pathAnalysis.subPaths = pathAnalysis.segments.slice(2)
  }

  // 解析查询参数
  if (pathname.includes('?')) {
    const [path, query] = pathname.split('?')
    const params = new URLSearchParams(query)
    params.forEach((value, key) => {
      pathAnalysis.queryParams.push({ [key]: value })
    })
  }

  // 尝试精确匹配
  const exactMatch = PAGE_MAPPINGS.find((mapping) => mapping.path === cleanPath)
  if (exactMatch) {
    return {
      name: exactMatch.name,
      category: exactMatch.category,
      originalPath: cleanPath,
      pathAnalysis,
    }
  }

  // 处理动态路由（如博客详情页）
  const segments = cleanPath.split('/').filter(Boolean)
  if (segments.length >= 3 && segments[1] === 'blog') {
    // 博客详情页: /zh/blog/123 -> 博客内容
    return {
      name: '博客内容',
      category: 'content',
      originalPath: cleanPath,
      pathAnalysis,
    }
  }

  // 处理其他动态路由
  const dynamicMatch = PAGE_MAPPINGS.find((mapping) => {
    const mappingSegments = mapping.path.split('/').filter(Boolean)
    if (segments.length !== mappingSegments.length) return false

    return mappingSegments.every((segment, index) => {
      return segment === segments[index] || segment.startsWith('[')
    })
  })

  if (dynamicMatch) {
    return {
      name: dynamicMatch.name,
      category: dynamicMatch.category,
      originalPath: cleanPath,
      pathAnalysis,
    }
  }

  // 默认处理
  const locale = segments[0]
  const page = segments[1] || 'home'

  // 根据路径段推断页面名称
  let name = '未知页面'
  let category = 'content'

  switch (page) {
    case 'dashboard':
      name = '主页'
      break
    case 'blog':
      name = segments[2] ? '博客内容' : '博客列表'
      break
    case 'analytics':
      name = '数据分析'
      break
    case 'profile':
      name = '个人资料'
      break
    case 'settings':
      name = '设置'
      break
    case 'about':
      name = '关于我们'
      break
    case 'contact':
      name = '联系我们'
      break
    default:
      name = `${page.charAt(0).toUpperCase() + page.slice(1)}`
  }

  return {
    name,
    category,
    originalPath: cleanPath,
    pathAnalysis,
  }
}

// 路径分析接口
export interface PathAnalysis {
  segments: string[]
  depth: number
  hasQueryParams: boolean
  isDynamic: boolean
  locale: string
  category: string
  subPaths: string[]
  queryParams: { [key: string]: string }[]
}

// 获取页面统计信息
export function getPageStats(pageViews: any[]): Array<{
  name: string
  views: number
  avgTime: number
  pathAnalysis: PathAnalysis
  originalPath: string
}> {
  const pageStats = new Map<
    string,
    {
      views: number
      totalTime: number
      count: number
      pathAnalysis: PathAnalysis
      originalPath: string
    }
  >()

  pageViews.forEach((view) => {
    const pageInfo = parsePagePath(view.page)
    const key = view.page // 使用完整路径作为key

    if (!pageStats.has(key)) {
      pageStats.set(key, {
        views: 0,
        totalTime: 0,
        count: 0,
        pathAnalysis: pageInfo.pathAnalysis,
        originalPath: view.page,
      })
    }

    const stats = pageStats.get(key)!
    stats.views++
    // 这里可以添加停留时间计算逻辑
    stats.count++
  })

  return Array.from(pageStats.entries()).map(([path, stats]) => ({
    name: path, // 使用完整路径作为名称
    views: stats.views,
    avgTime: stats.count > 0 ? Math.round(stats.totalTime / stats.count) : 0,
    pathAnalysis: stats.pathAnalysis,
    originalPath: stats.originalPath,
  }))
}
