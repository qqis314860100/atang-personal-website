# 性能埋点修复总结

## 🔍 **问题分析**

从错误日志中发现性能埋点的问题：

```
❌ null value in column "page" of relation "PerformanceMetric" violates not-null constraint
❌ null value in column "load_time" of relation "PerformanceMetric" violates not-null constraint
```

## ✅ **修复方案**

### 1. 修复页面字段为空的问题

**问题**: `trackPerformance` 方法没有传递 `page` 信息

**修复**: 在埋点代码中添加当前页面路径

```typescript
// 修复前
trackPerformance(metric: string, value: number, properties?: any) {
  this.throttledTrackEvent({
    type: 'performance',
    // ❌ 缺少page字段
    eventName: metric,
    value,
    performanceMetrics: { ... }
  })
}

// 修复后
trackPerformance(metric: string, value: number, properties?: any) {
  this.throttledTrackEvent({
    type: 'performance',
    page: typeof window !== 'undefined' ? window.location.pathname : '/', // ✅ 添加页面路径
    eventName: metric,
    value,
    performanceMetrics: { ... }
  })
}
```

### 2. 修复 API 路由中的默认值处理

**问题**: API 路由中 `page` 字段可能为空

**修复**: 为所有类型添加默认值

```typescript
// 修复前
await analyticsService.recordPerformanceMetric({
  page, // ❌ 可能为空
  load_time: performanceMetrics.loadTime,
  // ...
})

// 修复后
await analyticsService.recordPerformanceMetric({
  page: page || '/', // ✅ 添加默认值
  load_time: performanceMetrics.loadTime || 0, // ✅ 添加默认值
  dom_content_loaded: performanceMetrics.domContentLoaded || 0, // ✅ 添加默认值
  // ...
})
```

### 3. 修复字段名映射问题

**问题**: 前端使用 `'page_load_time'` 但 API 期望 `'loadTime'`

**修复**: 添加字段名映射

```typescript
// 字段名映射
const fieldMapping: Record<string, string> = {
  loadTime: 'loadTime',
  domContentLoaded: 'domContentLoaded',
  firstContentfulPaint: 'firstContentfulPaint',
  largestContentfulPaint: 'largestContentfulPaint',
  cumulativeLayoutShift: 'cumulativeLayoutShift',
  firstInputDelay: 'firstInputDelay',
  page_load_time: 'loadTime', // ✅ 前端字段名映射
}
```

## 📋 **修复的文件**

### `lib/analytics/tracker.ts`

- ✅ 修复 `trackPerformance` 方法，添加页面路径
- ✅ 添加字段名映射逻辑

### `app/api/analytics/track/route.ts`

- ✅ 为所有类型添加默认 `page` 值
- ✅ 为性能指标添加默认数值

## 🎯 **修复效果**

### 修复前的错误:

```
❌ null value in column "page" violates not-null constraint
❌ null value in column "load_time" violates not-null constraint
```

### 修复后应该看到:

```
✅ 性能指标正常记录
✅ 页面路径正确传递
✅ 必需字段有默认值
✅ Dashboard数据正常显示
```

## 🧪 **测试验证**

可以使用以下脚本测试修复效果：

```bash
# 运行测试脚本
node scripts/test-performance-fix.js
```

测试内容：

- ✅ 使用 `loadTime` 字段的埋点
- ✅ 使用 `page_load_time` 字段的埋点
- ✅ Dashboard 数据获取

## 📊 **技术细节**

### 字段映射逻辑

```typescript
const fieldName = fieldMapping[metric] || metric
performanceMetrics: {
  [fieldName]: value, // 使用映射后的字段名
  ...properties,
}
```

### 默认值处理

```typescript
page: page || '/', // 页面路径默认值
load_time: performanceMetrics.loadTime || 0, // 加载时间默认值
dom_content_loaded: performanceMetrics.domContentLoaded || 0, // DOM加载时间默认值
```

### 数据库约束

- `page`: String (必需)
- `load_time`: Float (必需)
- `dom_content_loaded`: Float (必需)
- 其他性能指标: Float? (可选)

现在性能埋点系统应该可以正常工作了！🎉
