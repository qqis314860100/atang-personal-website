# Web Vitals 性能监控系统

基于官方 `web-vitals` 库的完整性能监控解决方案，支持所有核心 Web Vitals 指标。

## 🚀 快速开始

### 1. 基础使用

```typescript
import { initAnalytics } from '@/lib/analytics'

// 在应用入口初始化
const analytics = initAnalytics('your-session-id', 'user-id', {
  debug: true, // 开发环境启用调试
  reportAllChanges: false, // 是否报告所有变化
})
```

### 2. React Hook 使用

```typescript
import { usePerformanceMonitoring } from '@/lib/analytics'

function MyApp() {
  const analytics = usePerformanceMonitoring(sessionId, userId)

  // 获取性能数据
  const performanceData = analytics?.getPerformanceData()

  // 获取性能建议
  const insights = analytics?.getPerformanceInsights()

  return <div>...</div>
}
```

### 3. Next.js 应用集成

在 `app/layout.tsx` 中添加：

```typescript
'use client'
import { initAnalytics } from '@/lib/analytics'
import { useEffect } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // 生成或获取 session ID
    const sessionId = crypto.randomUUID()

    // 初始化性能监控
    initAnalytics(sessionId, undefined, {
      debug: process.env.NODE_ENV === 'development',
      enableWebVitals: true,
      enablePerformance: false,
    })
  }, [])

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

## 📊 监控的指标

### Core Web Vitals

| 指标    | 描述           | 良好标准 | 需要改进 |
| ------- | -------------- | -------- | -------- |
| **LCP** | 最大内容绘制   | ≤ 2.5s   | > 4.0s   |
| **FID** | 首次输入延迟   | ≤ 100ms  | > 300ms  |
| **INP** | 交互到下次绘制 | ≤ 200ms  | > 500ms  |
| **CLS** | 累积布局偏移   | ≤ 0.1    | > 0.25   |

### 其他重要指标

| 指标     | 描述         | 良好标准 |
| -------- | ------------ | -------- |
| **FCP**  | 首次内容绘制 | ≤ 1.8s   |
| **TTFB** | 首字节时间   | ≤ 800ms  |
| **FP**   | 首次绘制     | ≤ 1.0s   |

## 🔧 API 参考

### initAnalytics(sessionId, userId?, options?)

初始化分析工具。

**参数：**

- `sessionId: string` - 会话 ID
- `userId?: string` - 用户 ID（可选）
- `options?: object` - 配置选项
  - `enableWebVitals?: boolean` - 启用 Web Vitals（默认：true）
  - `enablePerformance?: boolean` - 启用原生性能监控（默认：false）
  - `debug?: boolean` - 调试模式（默认：false）
  - `reportAllChanges?: boolean` - 报告所有变化（默认：false）

### AnalyticsManager 方法

#### getPerformanceData()

获取当前收集的性能数据。

```typescript
const data = analytics.getPerformanceData()
console.log(data)
// {
//   webVitals: { fcp: 1200, lcp: 2100, cls: 0.05, ... },
//   score: 85,
//   grade: { grade: 'B', color: '#3B82F6', description: '良好' }
// }
```

#### getPerformanceInsights()

获取性能优化建议。

```typescript
const insights = analytics.getPerformanceInsights()
console.log(insights)
// [
//   {
//     metric: 'LCP',
//     status: 'warning',
//     value: 3200,
//     recommendation: '需要改进：最大内容绘制时间偏慢。建议预加载关键资源、优化图片加载。'
//   }
// ]
```

#### flush()

手动发送当前收集的数据。

```typescript
analytics.flush()
```

## 🎯 性能评分系统

### 评分计算

- **LCP**: 25% 权重
- **FID/INP**: 25% 权重
- **CLS**: 25% 权重
- **FCP**: 25% 权重

### 评级标准

| 分数   | 等级 | 颜色    | 描述     |
| ------ | ---- | ------- | -------- |
| 90-100 | A    | 🟢 绿色 | 优秀     |
| 75-89  | B    | 🔵 蓝色 | 良好     |
| 50-74  | C    | 🟡 黄色 | 一般     |
| 25-49  | D    | 🟠 橙色 | 需要改进 |
| 0-24   | F    | 🔴 红色 | 差       |

## 🔍 调试工具

### 开发环境调试

启用调试模式后，可以在浏览器控制台看到详细日志：

```typescript
initAnalytics(sessionId, userId, { debug: true })
```

### 浏览器控制台

访问全局分析对象：

```javascript
// 获取当前性能数据
__analytics.getPerformanceData()

// 获取Web Vitals收集器
__webVitalsCollector.getData()

// 手动发送数据
__analytics.flush()
```

## 📈 数据存储

所有性能数据会自动发送到：

- **API 端点**: `/api/analytics/web-vitals`
- **数据库表**: `PerformanceMetric`

数据包含：

- 所有 Web Vitals 指标
- 性能评分和等级
- 页面路径和会话信息
- 时间戳

## 🛠️ 故障排除

### 常见问题

1. **指标未收集到**

   - 确保页面完全加载
   - 检查浏览器是否支持相关 API
   - 启用调试模式查看日志

2. **数据未发送**

   - 检查网络连接
   - 确认 API 端点正常工作
   - 查看浏览器 Network 面板

3. **SPA 路由问题**
   - 系统会自动处理路由变化
   - 每次路由变化会重新初始化收集器

### 浏览器支持

- **Chrome**: 全面支持
- **Firefox**: 部分支持（缺少某些新指标）
- **Safari**: 基础支持
- **Edge**: 全面支持

## 📖 最佳实践

1. **生产环境关闭调试模式**
2. **合理设置 reportAllChanges**（可能产生大量数据）
3. **定期分析性能趋势**
4. **根据建议优化页面性能**
5. **监控关键页面的性能变化**

## 🔗 相关资源

- [Web Vitals 官方文档](https://web.dev/vitals/)
- [Core Web Vitals 优化指南](https://web.dev/optimize-cls/)
- [Performance API 文档](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)
