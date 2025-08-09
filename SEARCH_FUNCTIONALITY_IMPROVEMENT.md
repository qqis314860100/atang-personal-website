# 错误日志搜索功能改进

## 问题描述

用户反映搜索框输入不会查询数据，搜索功能不工作。

## 根本原因

之前的实现只在前端进行搜索过滤，但在重构过程中，搜索逻辑被移到了`useMemo`中，但数据源仍然是固定的 Dashboard API 返回的有限数据（最多 50 条）。

## 解决方案

### 1. 数据库层面搜索支持

在`lib/database/analytics.ts`中添加了新的`getErrorLogs`方法，支持：

- 时间范围过滤
- 搜索词过滤（支持全字段搜索或指定字段搜索）
- 严重程度过滤
- 排序（按时间、次数、严重程度）
- 分页

### 2. 新的 API 端点

创建了`app/api/analytics/error-logs/route.ts`，提供 RESTful API：

```
GET /api/analytics/error-logs?searchTerm=xxx&searchField=all&severity=all&sortBy=timestamp&sortOrder=desc&page=1&limit=50
```

### 3. React Query Hook

在`lib/query-hook/use-analytics.ts`中添加了`useErrorLogs` hook，支持：

- 自动缓存（30 秒新鲜度，5 分钟缓存时间）
- 请求参数变化时自动重新请求
- 错误处理和加载状态

### 4. 组件重构

- `ErrorLogs.tsx`: 使用新的 API hook，移除本地数据处理逻辑
- `ErrorLogsList.tsx`: 支持 API 分页数据和本地分页数据两种模式
- `useErrorLogs.ts`: 简化事件处理，移除调试信息

## 功能特性

### 搜索功能

- **全字段搜索**: 在错误类型、消息、页面、用户代理中搜索
- **指定字段搜索**: 可选择特定字段进行搜索
- **大小写敏感**: 支持区分大小写搜索
- **正则表达式**: 支持正则表达式搜索（前端选项，后端暂未实现）

### 过滤和排序

- **严重程度过滤**: 高、中、低、全部
- **多字段排序**: 时间、次数、严重程度
- **升序/降序**: 支持双向排序

### 分页

- **服务端分页**: 减少数据传输，提高性能
- **动态页大小**: 10、20、50 条每页
- **页面导航**: 完整的分页控件

## 性能优化

1. **数据库索引**: 建议在`error_type`, `error_message`, `page`, `user_agent`, `severity`, `timestamp`字段上添加索引
2. **缓存策略**: React Query 提供智能缓存，减少重复请求
3. **服务端分页**: 避免传输大量不需要的数据

## 使用示例

```typescript
// 使用新的搜索API
const { data, isLoading, error } = useErrorLogs({
  searchTerm: 'TypeError',
  searchField: 'type',
  severity: 'high',
  sortBy: 'timestamp',
  sortOrder: 'desc',
  page: 1,
  limit: 20,
})
```

## 向后兼容性

- 保留了 fallback 数据支持，确保在 API 失败时仍能显示基础数据
- `ErrorLogsList`组件支持两种数据模式（API 分页和本地分页）

## 测试验证

- API 端点测试: ✅ 正常返回搜索结果
- 前端集成: ✅ 搜索功能正常工作
- 性能测试: ✅ 响应时间良好

## 后续改进建议

1. 添加搜索历史记录
2. 实现正则表达式搜索的后端支持
3. 添加更多搜索字段（如 IP 地址、用户 ID）
4. 实现搜索结果高亮显示
5. 添加导出搜索结果功能
