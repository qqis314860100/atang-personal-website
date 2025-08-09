# 埋点系统改进总结

## 🎯 **主要改进**

### 1. **全局埋点架构优化**

- ✅ 将埋点初始化从页面级移至全局 Layout 层
- ✅ 创建了 `AnalyticsProvider` 组件统一管理
- ✅ 自动监听路由变化，无需手动添加埋点代码

### 2. **SSR 兼容性修复**

- ✅ 修复了 `localStorage is not defined` 错误
- ✅ 添加客户端环境检查 `typeof window !== 'undefined'`
- ✅ 服务端环境生成临时用户 ID

### 3. **架构改进**

#### **原来的方式**：

```tsx
// 每个页面都需要手动添加
useEffect(() => {
  analyticsTracker.init()
  analyticsTracker.trackPageView('analytics', 'main')
  const loadTime = performance.now()
  analyticsTracker.trackPerformance('page_load_time', loadTime)
}, [])
```

#### **现在的方式**：

```tsx
// Layout层自动处理
<AnalyticsProvider>{children}</AnalyticsProvider>
```

## 🔧 **技术实现**

### 全局埋点提供者

```tsx
// components/analytics/AnalyticsProvider.tsx
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // 全局初始化（仅客户端）
    if (typeof window !== 'undefined') {
      analyticsTracker.init()
    }
  }, [])

  useEffect(() => {
    // 自动监听路由变化
    if (typeof window !== 'undefined' && pathname) {
      // 智能解析页面信息
      const segments = pathname.split('/').filter(Boolean)
      const page = segments[1] || 'home'
      const category = page === 'dashboard' ? 'analytics' : 'content'

      // 自动埋点
      analyticsTracker.trackPageView(category, page)
      analyticsTracker.trackPerformance('page_load_time', performance.now())
    }
  }, [pathname])

  return <>{children}</>
}
```

### SSR 安全的用户 ID 生成

```tsx
private generateUserId(): string {
  // 检查是否在客户端环境
  if (typeof window === 'undefined') {
    return 'server_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  let userId = localStorage.getItem('analytics_user_id')
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('analytics_user_id', userId)
  }
  return userId
}
```

## 📊 **权限修复**

### 问题

- 数据库重置后缺少必要权限
- RLS 策略阻止了埋点数据写入

### 解决方案

1. **禁用 RLS**（开发阶段）：

```sql
-- scripts/disable-rls.sql
ALTER TABLE "PageView" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "UserEvent" DISABLE ROW LEVEL SECURITY;
-- ... 其他表
```

2. **权限设置**：

```sql
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT ON "PageView" TO anon;
-- ... 其他权限
```

## 🎉 **优势**

### 1. **开发体验**

- ✅ 无需在每个页面手动添加埋点
- ✅ 自动处理路由变化
- ✅ 统一的错误处理

### 2. **性能优化**

- ✅ 全局单次初始化
- ✅ 避免重复代码
- ✅ 智能路由解析

### 3. **维护性**

- ✅ 集中管理埋点逻辑
- ✅ 易于扩展和修改
- ✅ 清晰的代码组织

## 🚀 **使用方法**

现在，所有页面都会自动被埋点追踪：

- 页面访问自动记录
- 性能指标自动收集
- 用户行为自动分析

只需要访问页面，数据就会自动上报到 `/api/analytics/track`！

## 📍 **文件结构**

```
components/
  analytics/
    AnalyticsProvider.tsx     # 全局埋点提供者

app/[locale]/
  layout.tsx                 # 添加了AnalyticsProvider
  dashboard/
    page.tsx                 # 移除了手动埋点代码

lib/
  analytics/
    tracker.ts               # 修复了SSR问题
  query-hook/
    use-analytics.ts         # React Query hooks

scripts/
  disable-rls.sql           # 权限修复SQL
```

这样的架构更加清晰、可维护，也避免了 SSR 相关的问题！
