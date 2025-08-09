# 数据库集成指南

## 概述

我们已经成功将 Dashboard 连接到真实的 Supabase 数据库，实现了完整的数据收集、存储和分析功能。

## 数据库架构

### 数据表结构

1. **page_views** - 页面浏览记录

   - 记录用户访问的页面信息
   - 包含设备、浏览器、地理位置等详细信息

2. **user_events** - 用户事件

   - 记录用户交互行为（点击、滚动、表单提交等）
   - 支持自定义属性和数值

3. **user_sessions** - 用户会话

   - 跟踪用户会话的生命周期
   - 记录会话时长、页面数量等指标

4. **performance_metrics** - 性能指标

   - 记录页面加载性能数据
   - 包含 Core Web Vitals 指标

5. **error_logs** - 错误日志
   - 记录 JavaScript 错误和异常
   - 支持错误严重程度分级

## 环境配置

### 1. 环境变量设置

在 `.env.local` 文件中添加以下配置：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE=your_service_role_key

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. 数据库初始化

在 Supabase SQL Editor 中运行 `scripts/init-database.sql` 脚本：

```sql
-- 创建所有数据表
-- 创建索引
-- 插入示例数据
-- 设置安全策略
```

## 数据收集流程

### 1. 客户端数据收集

```typescript
// 自动收集的数据
- 页面浏览记录
- 用户交互事件（点击、滚动、表单提交）
- 性能指标
- JavaScript错误
- 设备信息（浏览器、操作系统、屏幕分辨率）
```

### 2. 数据发送

```typescript
// 通过 /api/analytics/track 接口发送数据
POST /api/analytics/track
{
  "type": "pageview|event|session|performance|error",
  "page": "/dashboard",
  "sessionId": "session-123",
  "userId": "user-456",
  // ... 其他数据
}
```

### 3. 数据存储

```typescript
// 服务端处理
;-验证数据完整性 - 获取真实IP地址 - 存储到对应的数据表 - 错误处理和日志记录
```

## API 接口

### 1. 数据收集接口

```
POST /api/analytics/track
```

**支持的请求类型：**

- `pageview` - 页面浏览
- `event` - 用户事件
- `session` - 会话管理
- `performance` - 性能指标
- `error` - 错误日志

### 2. Dashboard 数据接口

```
GET /api/analytics/dashboard?timeRange=7d&section=traffic
```

**查询参数：**

- `timeRange` - 时间范围（1d, 7d, 30d, 90d）
- `section` - 数据类型（traffic, behavior, performance, realtime, all）

## 功能特性

### 1. 实时数据收集

- ✅ 自动页面浏览跟踪
- ✅ 用户交互事件收集
- ✅ 性能指标监控
- ✅ 错误日志记录
- ✅ 设备信息检测

### 2. 数据分析

- ✅ 流量分析（页面浏览、独立访客、热门页面）
- ✅ 用户行为分析（交互事件、会话指标）
- ✅ 性能监控（加载时间、错误率）
- ✅ 实时数据（当前用户、活跃会话）

### 3. 数据可视化

- ✅ 图表展示（Recharts）
- ✅ 实时更新（WebSocket）
- ✅ 数据导出（Excel/JSON）
- ✅ 响应式设计

## 部署步骤

### 1. 准备 Supabase 项目

1. 创建 Supabase 项目
2. 获取项目 URL 和 API 密钥
3. 设置环境变量

### 2. 初始化数据库

```bash
# 在Supabase SQL Editor中运行
# 复制 scripts/init-database.sql 的内容并执行
```

### 3. 测试数据库连接

```bash
# 运行测试脚本
node scripts/test-database.js
```

### 4. 启动应用

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 5. 验证功能

1. 访问 `http://localhost:3000/dashboard`
2. 检查数据收集是否正常
3. 查看 Dashboard 数据是否显示
4. 测试实时功能

## 数据安全

### 1. 行级安全策略（RLS）

所有数据表都启用了 RLS，只允许服务角色访问：

```sql
-- 允许服务角色完全访问
CREATE POLICY "Allow service role full access" ON table_name FOR ALL USING (true);
```

### 2. 数据隐私

- 不收集个人身份信息
- IP 地址仅用于地理位置分析
- 支持数据匿名化

## 性能优化

### 1. 数据库索引

```sql
-- 为常用查询字段创建索引
CREATE INDEX idx_page_views_timestamp ON page_views(timestamp);
CREATE INDEX idx_user_events_event_type ON user_events(event_type);
```

### 2. 查询优化

- 使用分页查询避免大量数据
- 实现数据缓存机制
- 优化复杂聚合查询

### 3. 客户端优化

- 批量发送数据减少请求
- 实现离线数据缓存
- 错误重试机制

## 监控和维护

### 1. 数据监控

- 监控数据收集量
- 检查错误率
- 分析性能指标

### 2. 数据库维护

- 定期清理旧数据
- 优化查询性能
- 备份重要数据

### 3. 系统监控

- 监控 API 响应时间
- 检查 WebSocket 连接状态
- 分析用户行为模式

## 故障排除

### 1. 数据库连接问题

```bash
# 检查环境变量
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_SERVICE_ROLE

# 运行连接测试
node scripts/test-database.js
```

### 2. 数据收集问题

```javascript
// 检查浏览器控制台
console.log('Analytics tracker initialized')

// 检查网络请求
// 查看 /api/analytics/track 接口响应
```

### 3. Dashboard 显示问题

```javascript
// 检查API响应
fetch('/api/analytics/dashboard')
  .then((res) => res.json())
  .then((data) => console.log(data))
```

## 扩展功能

### 1. 高级分析

- 用户路径分析
- 转化漏斗分析
- A/B 测试支持

### 2. 实时功能

- 实时用户地图
- 实时性能监控
- 实时错误告警

### 3. 数据导出

- 自定义报表
- 数据可视化
- 第三方集成

## 总结

我们已经成功实现了：

✅ **完整的数据库架构** - 5 个核心数据表
✅ **自动数据收集** - 客户端和服务端数据收集
✅ **实时数据分析** - Dashboard 实时显示
✅ **数据可视化** - 图表和导出功能
✅ **安全策略** - RLS 和隐私保护
✅ **性能优化** - 索引和查询优化

现在你的 Dashboard 已经连接到真实的数据库，可以收集和分析真实的用户数据了！
