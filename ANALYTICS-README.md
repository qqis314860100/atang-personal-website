# 埋点系统使用说明

## 概述

本项目实现了一个完整的埋点（Analytics）系统，用于收集和分析用户行为数据。系统采用模块化设计，支持多种事件类型，并且易于扩展。

## 系统架构

### 核心组件

1. **SimpleTracker** (`lib/analytics/simple-tracker.ts`)

   - 简化的埋点追踪器
   - 避免复杂的依赖关系
   - 直接发送事件到服务器

2. **API 路由** (`app/api/analytics/track/route.ts`)

   - 接收埋点事件
   - 数据验证和存储
   - 错误处理

3. **数据库模型** (`prisma/schema.prisma`)
   - `AnalyticsEvent`: 基础事件表
   - `PageView`: 页面访问记录
   - `UserBehaviorAggregate`: 用户行为聚合
   - `AnalyticsModule`: 模块配置
   - `AnalyticsEventDefinition`: 事件定义

## 使用方法

### 1. 初始化埋点系统

```typescript
import { tracker } from '@/lib/analytics/simple-tracker'

// 初始化
tracker.initialize()
```

### 2. 追踪页面访问

```typescript
// 追踪页面访问
tracker.trackPageView('dashboard', 'main')
tracker.trackPageView('blog', 'list')
```

### 3. 追踪用户交互

```typescript
// 追踪用户交互
tracker.trackUserInteraction('click', 'button', 'dashboard', {
  button: 'submit',
})
tracker.trackUserInteraction('hover', 'card', 'blog', { card: 'post' })
tracker.trackUserInteraction('scroll', 'page', 'dashboard', {
  direction: 'down',
})
```

### 4. 追踪数据查看

```typescript
// 追踪数据查看
tracker.trackDataView('line', 'user_activity')
tracker.trackDataView('bar', 'page_views')
tracker.trackDataView('pie', 'device_distribution')
```

### 5. 追踪任务管理

```typescript
// 追踪任务管理
tracker.trackTaskManagement('create', 'onboarding', 'task_001')
tracker.trackTaskManagement('complete', 'onboarding', 'task_001')
tracker.trackTaskManagement('update', 'project', 'project_001')
```

### 6. 追踪时间追踪

```typescript
// 追踪时间追踪
tracker.trackTimeTracking('start', 'dashboard')
tracker.trackTimeTracking('stop', 'dashboard', 300000) // 5分钟
tracker.trackTimeTracking('pause', 'project', 120000) // 2分钟
```

### 7. 追踪通知

```typescript
// 追踪通知
tracker.trackNotification('success', '操作成功完成！')
tracker.trackNotification('warning', '请注意这个警告信息')
tracker.trackNotification('error', '发生了一个错误')
tracker.trackNotification('info', '这是一条信息通知')
```

### 8. 追踪性能指标

```typescript
// 追踪性能指标
tracker.trackPerformance('page_load_time', 1200) // 毫秒
tracker.trackPerformance('api_response_time', 800)
tracker.trackPerformance('render_time', 500)
```

### 9. 追踪错误

```typescript
// 追踪错误
tracker.trackError('网络连接失败', 'network')
tracker.trackError('数据加载失败', 'data_loading')
tracker.trackError('用户权限不足', 'permission')
```

## 页面集成

### 在组件中使用

```typescript
'use client'

import { useEffect } from 'react'
import { tracker } from '@/lib/analytics/simple-tracker'

export default function MyComponent() {
  useEffect(() => {
    // 页面加载时追踪
    tracker.trackPageView('my-component', 'main')
  }, [])

  const handleClick = () => {
    // 用户交互时追踪
    tracker.trackUserInteraction('click', 'my_button', 'my-component')
  }

  return <button onClick={handleClick}>点击我</button>
}
```

### 在仪表盘中查看

访问以下页面查看埋点数据：

- `/analytics` - 数据分析仪表盘
- `/analytics-data` - 原始埋点数据展示
- `/test-analytics` - 埋点系统测试页面

## 事件类型说明

### 1. page_view

- **用途**: 追踪页面访问
- **参数**: `page` (页面路径), `section` (页面区域)

### 2. user_interaction

- **用途**: 追踪用户交互
- **参数**: `action` (动作类型), `element` (元素), `section` (区域), `value` (值)

### 3. data_view

- **用途**: 追踪数据查看
- **参数**: `chart_type` (图表类型), `data_source` (数据源)

### 4. task_management

- **用途**: 追踪任务管理
- **参数**: `action` (动作), `task_type` (任务类型), `task_id` (任务 ID)

### 5. time_tracking

- **用途**: 追踪时间追踪
- **参数**: `action` (动作), `project` (项目), `duration` (时长)

### 6. notification

- **用途**: 追踪通知
- **参数**: `type` (类型), `message` (消息)

### 7. performance

- **用途**: 追踪性能指标
- **参数**: `metric` (指标), `value` (值)

### 8. error

- **用途**: 追踪错误
- **参数**: `error` (错误信息), `context` (上下文)

## 数据存储

所有埋点事件都会发送到 `/api/analytics/track` 端点，并存储在数据库中。

### 数据库表结构

```sql
-- 基础事件表
CREATE TABLE "AnalyticsEvent" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL,
  "sessionId" TEXT NOT NULL,
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- 页面访问表
CREATE TABLE "PageView" (
  "id" TEXT NOT NULL,
  "page" TEXT NOT NULL,
  "section" TEXT,
  "sessionId" TEXT NOT NULL,
  "userId" TEXT,
  "timestamp" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);
```

## 扩展指南

### 添加新的事件类型

1. 在 `SimpleTracker` 中添加新方法
2. 在数据库中添加相应的表结构
3. 更新 API 路由以处理新的事件类型

### 添加新的追踪模块

1. 创建新的追踪器类
2. 实现相应的接口
3. 注册到主追踪服务中

## 最佳实践

1. **性能考虑**: 埋点事件应该异步发送，避免阻塞主线程
2. **数据隐私**: 确保不收集敏感信息
3. **错误处理**: 埋点失败不应影响主要功能
4. **数据量控制**: 合理控制埋点频率，避免数据量过大
5. **测试**: 在开发环境中充分测试埋点功能

## 故障排除

### 常见问题

1. **埋点事件未发送**

   - 检查网络连接
   - 确认 API 端点正常工作
   - 查看浏览器控制台错误

2. **数据未显示**

   - 检查数据库连接
   - 确认数据已正确存储
   - 验证查询逻辑

3. **性能问题**
   - 减少埋点频率
   - 使用批量发送
   - 优化数据结构

## 相关文件

- `lib/analytics/simple-tracker.ts` - 核心追踪器
- `app/api/analytics/track/route.ts` - API 端点
- `prisma/schema.prisma` - 数据库模型
- `app/analytics/page.tsx` - 数据分析页面
- `app/analytics-data/page.tsx` - 数据展示页面
- `app/test-analytics/page.tsx` - 测试页面
- `components/analytics/analytics-summary.tsx` - 摘要组件
