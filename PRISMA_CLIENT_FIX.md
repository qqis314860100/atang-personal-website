# Prisma Client 浏览器环境错误修复

## 问题描述

在视频管理系统中遇到了以下错误：

```
Error: PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in ``).
```

这个错误是因为 Prisma Client 只能在服务器端运行，不能在客户端（浏览器）中运行。

## 问题原因

1. **VideoService** 直接在客户端组件中被调用
2. **use-videos hook** 直接调用 VideoService 的方法
3. **Prisma Client** 被错误地打包到了客户端代码中

## 解决方案

### 1. 创建 API 路由

将所有的数据库操作移到服务器端的 API 路由中：

#### `/app/api/videos/route.ts`

- `GET` - 获取视频列表
- `POST` - 创建视频

#### `/app/api/videos/[id]/route.ts`

- `GET` - 获取单个视频
- `PUT` - 更新视频
- `DELETE` - 删除视频

#### `/app/api/videos/[id]/view/route.ts`

- `POST` - 增加观看次数

#### `/app/api/videos/[id]/danmaku/route.ts`

- `GET` - 获取弹幕列表
- `POST` - 发送弹幕

### 2. 修改 VideoService

将 VideoService 改为通过 fetch API 调用服务器端接口：

```typescript
// 修改前
static async getVideos(params) {
  return await prisma.video.findMany({ ... })
}

// 修改后
static async getVideos(params) {
  const response = await fetch(`/api/videos?${searchParams}`)
  return response.json()
}
```

### 3. 保持 use-videos hook 不变

React Query hooks 保持不变，因为它们现在调用的是修改后的 VideoService，而 VideoService 通过 API 路由与服务器通信。

## 技术架构

```
客户端 (Browser)
    ↓ fetch API
API 路由 (Server)
    ↓ Prisma Client
数据库 (PostgreSQL)
```

## 修复步骤

1. **创建 API 路由** - 将所有数据库操作移到服务器端
2. **修改 VideoService** - 改为通过 fetch API 调用
3. **添加测试数据** - 确保数据库中有测试数据
4. **验证修复** - 测试视频管理系统功能

## 关键文件修改

### 新增文件

- `app/api/videos/route.ts`
- `app/api/videos/[id]/route.ts`
- `app/api/videos/[id]/view/route.ts`
- `app/api/videos/[id]/danmaku/route.ts`
- `scripts/seed-video-test.js`

### 修改文件

- `lib/services/video-service.ts` - 改为使用 fetch API
- `app/api/videos/route.ts` - 使用 Prisma Client
- `app/api/videos/[id]/route.ts` - 使用 Prisma Client

## 测试验证

1. **添加测试数据**：

   ```bash
   node scripts/seed-video-test.js
   ```

2. **测试 API 路由**：

   - 访问 `/api/test-videos` 验证数据
   - 访问 `/api/videos` 获取视频列表

3. **测试视频管理页面**：
   - 访问视频管理页面
   - 验证视频列表显示
   - 测试搜索和筛选功能

## 最佳实践

1. **服务器端数据库操作** - 所有 Prisma 操作都应在服务器端进行
2. **API 路由设计** - 使用 RESTful API 设计原则
3. **错误处理** - 在 API 路由中添加适当的错误处理
4. **类型安全** - 保持 TypeScript 类型定义的一致性

## 注意事项

1. **环境变量** - 确保数据库连接字符串正确配置
2. **Prisma Schema** - 确保 schema 已正确生成
3. **客户端缓存** - React Query 会自动处理客户端缓存
4. **错误边界** - 在客户端组件中添加错误边界处理

## 后续改进

1. **认证授权** - 添加用户认证和权限控制
2. **文件上传** - 实现视频文件上传功能
3. **实时更新** - 添加 WebSocket 实时更新
4. **性能优化** - 添加数据库查询优化和缓存策略
