# B 站风格弹幕系统实现

## 📖 概述

这是一个完整的 B 站风格弹幕系统实现，支持精确到毫秒的弹幕时间戳，完全集成 Supabase 数据库。系统包含前端弹幕渲染、后端数据存储等核心功能。

## 🎯 核心特性

### ⏱️ **精确时间控制**

- **毫秒级精度**：弹幕时间戳精确到毫秒
- **帧级同步**：支持 30fps/60fps 视频的精确同步
- **实时渲染**：基于 requestAnimationFrame 的高性能渲染

### 🗄️ **数据库设计**

- **Supabase 集成**：完全兼容 PostgreSQL 的 Supabase 数据库
- **高性能索引**：针对弹幕查询优化的复合索引
- **统计缓存**：实时统计信息缓存

### 🎨 **弹幕类型**

- **滚动弹幕**：从左到右滚动
- **顶部弹幕**：固定在顶部显示
- **底部弹幕**：固定在底部显示
- **逆向弹幕**：从右到左滚动
- **高级弹幕**：支持复杂动画效果

## 🏗️ 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端组件      │    │   弹幕系统      │    │   Supabase      │
│                 │    │                 │    │                 │
│ VideoPlayer     │◄──►│ DanmakuSystem   │◄──►│ PostgreSQL      │
│ Danmaku         │    │ DanmakuService  │    │ Prisma Client   │
│ DanmakuList     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 文件结构

```
app/[locale]/project/(feature)/video-player/
├── lib/
│   ├── danmaku-system.ts           # 弹幕系统核心
│   ├── danmaku-prisma-service.ts   # Prisma服务
│   ├── danmaku-supabase-example.ts # Supabase集成示例
│   └── danmaku-schema.sql          # 数据库Schema
├── components/
│   ├── VideoPlayer.tsx             # 视频播放器
│   ├── Danmaku.tsx                 # 弹幕渲染组件
│   └── DanmakuList.tsx             # 弹幕列表
└── README-DANMAKU.md               # 本文档
```

## 🚀 快速开始

### 1. 数据库设置

首先运行 Prisma 迁移来创建弹幕相关的表：

```bash
# 生成Prisma客户端
npx prisma generate

# 运行数据库迁移
npx prisma db push
```

### 2. 初始化弹幕系统

```typescript
import { createDanmakuSupabaseExample } from './lib/danmaku-supabase-example'

// 获取视频元素和容器
const videoElement = document.querySelector('video') as HTMLVideoElement
const container = document.querySelector('.danmaku-container') as HTMLElement

// 初始化弹幕系统
const danmakuExample = createDanmakuSupabaseExample(videoElement, container)
```

### 3. 发送弹幕

```typescript
// 发送滚动弹幕
await danmakuExample.sendDanmaku('这是一条弹幕', DanmakuType.SCROLL)

// 发送顶部弹幕
await danmakuExample.sendDanmaku('顶部弹幕', DanmakuType.TOP)

// 发送底部弹幕
await danmakuExample.sendDanmaku('底部弹幕', DanmakuType.BOTTOM)
```

## 📊 数据库 Schema

### 核心表结构

#### 1. 弹幕主表 (Danmaku)

```sql
CREATE TABLE danmaku (
  id          VARCHAR PRIMARY KEY,
  videoId     VARCHAR NOT NULL,           -- 视频ID
  userId      VARCHAR NOT NULL,           -- 用户ID
  content     TEXT NOT NULL,              -- 弹幕内容
  timeMs      INTEGER NOT NULL,           -- 精确到毫秒的时间戳
  type        INTEGER DEFAULT 1,          -- 弹幕类型
  fontSize    INTEGER DEFAULT 25,         -- 字体大小
  color       INTEGER DEFAULT 16777215,   -- 颜色（RGB）
  timestampMs BIGINT NOT NULL,           -- 发送时间戳
  poolType    INTEGER DEFAULT 0,          -- 弹幕池类型
  userHash    VARCHAR,                    -- 用户哈希
  rowId       INTEGER,                    -- 弹幕行ID
  createdAt   TIMESTAMP DEFAULT NOW(),
  updatedAt   TIMESTAMP DEFAULT NOW()
);
```

#### 2. 弹幕池表 (DanmakuPool)

```sql
CREATE TABLE danmaku_pool (
  id       VARCHAR PRIMARY KEY,
  videoId  VARCHAR NOT NULL,              -- 视频ID
  poolType INTEGER NOT NULL,              -- 0=普通池，1=字幕池，2=特殊池
  name     VARCHAR NOT NULL,              -- 池名称
  createdAt TIMESTAMP DEFAULT NOW()
);
```

#### 3. 弹幕统计表 (DanmakuStats)

```sql
CREATE TABLE danmaku_stats (
  id           VARCHAR PRIMARY KEY,
  videoId      VARCHAR UNIQUE,            -- 视频ID
  totalCount   INTEGER DEFAULT 0,         -- 总弹幕数
  scrollCount  INTEGER DEFAULT 0,         -- 滚动弹幕数
  topCount     INTEGER DEFAULT 0,         -- 顶部弹幕数
  bottomCount  INTEGER DEFAULT 0,         -- 底部弹幕数
  reverseCount INTEGER DEFAULT 0,         -- 逆向弹幕数
  advancedCount INTEGER DEFAULT 0,        -- 高级弹幕数
  createdAt    TIMESTAMP DEFAULT NOW(),
  updatedAt    TIMESTAMP DEFAULT NOW()
);
```

#### 4. 弹幕时间分布表 (DanmakuTimeDistribution)

```sql
CREATE TABLE danmaku_time_distribution (
  id           VARCHAR PRIMARY KEY,
  videoId      VARCHAR NOT NULL,          -- 视频ID
  timeBucket   INTEGER NOT NULL,          -- 时间桶（秒）
  danmakuCount INTEGER DEFAULT 0,         -- 该时间段的弹幕数量
  createdAt    TIMESTAMP DEFAULT NOW()
);
```

## ⚡ 性能优化

### 1. 数据库索引优化

```sql
-- 核心查询索引
CREATE INDEX idx_danmaku_video_time ON danmaku(videoId, timeMs);
CREATE INDEX idx_danmaku_video_pool_time ON danmaku(videoId, poolType, timeMs);

-- 复合索引
CREATE INDEX idx_danmaku_video_time_type ON danmaku(videoId, timeMs, type);
```

### 2. 前端渲染优化

- **虚拟滚动**：只渲染可见区域的弹幕
- **对象池**：复用 DOM 元素减少 GC 压力
- **requestAnimationFrame**：60fps 流畅渲染
- **CSS3 动画**：硬件加速的弹幕滚动

### 3. 数据加载策略

- **分段加载**：长视频按时间范围加载弹幕
- **预加载**：提前加载下一段弹幕
- **缓存机制**：本地缓存已加载的弹幕

## 🎮 使用示例

### 基础使用

```typescript
// 1. 初始化
const danmakuExample = createDanmakuSupabaseExample(videoElement, container)

// 2. 发送弹幕
await danmakuExample.sendDanmaku('Hello World!')

// 3. 获取统计
const stats = await danmakuExample.getDanmakuStats('video-123')

// 4. 获取热门弹幕
const hotDanmaku = await danmakuExample.getHotDanmaku('video-123', 10)
```

### 高级功能

```typescript
// 按时间范围加载弹幕
await danmakuExample.loadDanmakuByTimeRange(
  'video-123',
  0, // 开始时间（毫秒）
  60000 // 结束时间（毫秒）
)

// 获取弹幕统计
const stats = await danmakuExample.getDanmakuStats('video-123')
console.log('总弹幕数:', stats.totalCount)
console.log('滚动弹幕数:', stats.typeCount[DanmakuType.SCROLL])
console.log('时间分布:', stats.timeDistribution)
```

## 🔧 配置选项

### 弹幕系统配置

```typescript
interface DanmakuConfig {
  fps: number // 渲染帧率
  maxDanmaku: number // 最大同时显示弹幕数
  scrollSpeed: number // 滚动速度
  opacity: number // 透明度
  fontSize: number // 字体大小
}
```

### 数据库配置

```typescript
interface DatabaseConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl: boolean
}
```

## 🛠️ 开发工具

### 调试工具

```typescript
// 浏览器控制台调试
window.danmakuSupabaseExample = {
  sendDanmaku: (content, type) => {...},
  getDanmakuStats: () => {...},
  getHotDanmaku: (videoId, limit) => {...},
  getActiveCount: () => {...},
  getQueueCount: () => {...},
  setFPS: (fps) => {...}
};
```

### 性能监控

```typescript
// 监控弹幕性能
console.log('活跃弹幕数:', danmakuExample.getActiveDanmakuCount())
console.log('队列弹幕数:', danmakuExample.getQueueDanmakuCount())
console.log('FPS:', danmakuExample.getFPS())
```

## 🚀 部署指南

### 1. 环境要求

- Node.js 18+
- PostgreSQL 12+
- Supabase 账户

### 2. 环境变量

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."
```

### 3. 部署步骤

```bash
# 1. 安装依赖
npm install

# 2. 生成Prisma客户端
npx prisma generate

# 3. 运行数据库迁移
npx prisma db push

# 4. 构建项目
npm run build

# 5. 启动服务
npm start
```

## 📝 更新日志

### v1.0.0 (2024-01-XX)

- ✅ 基础弹幕系统实现
- ✅ Supabase 数据库集成
- ✅ 精确时间戳支持
- ✅ 多种弹幕类型
- ✅ 核心统计功能
- ✅ 性能优化

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个弹幕系统！

## 📄 许可证

MIT License

---

**注意**：这个弹幕系统完全兼容 B 站的设计理念，支持精确到毫秒的时间控制，并且完全集成 Supabase 数据库。所有代码都经过优化，确保在生产环境中能够稳定运行。
