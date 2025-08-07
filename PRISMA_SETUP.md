# Prisma 设置说明

## 📁 文件结构

```
lib/prisma/
├── schema.prisma          # 主schema文件（包含所有模型）
├── client.ts              # Prisma客户端实例
├── seed.ts                # 数据库种子文件
└── migrations/            # 数据库迁移文件
```

## 🚀 快速开始

### 1. 生成 Prisma 客户端

```bash
# 使用自定义schema路径生成客户端
npx prisma generate --schema=lib/prisma/schema.prisma

# 或者使用npm脚本
npm run prisma:generate
```

### 2. 推送数据库变更

```bash
# 推送schema变更到数据库
npx prisma db push --schema=lib/prisma/schema.prisma

# 或者使用npm脚本
npm run prisma:push
```

### 3. 运行数据库迁移

```bash
# 创建并运行迁移
npx prisma migrate dev --schema=lib/prisma/schema.prisma

# 或者使用npm脚本
npm run prisma:migrate
```

### 4. 运行数据库种子

```bash
# 运行种子文件
npm run db:seed
```

## 📋 可用的 npm 脚本

```json
{
  "prisma:generate": "prisma generate --schema=lib/prisma/schema.prisma",
  "prisma:push": "prisma db push --schema=lib/prisma/schema.prisma",
  "prisma:migrate": "prisma migrate dev --schema=lib/prisma/schema.prisma",
  "db:seed": "tsx lib/prisma/seed.ts"
}
```

## 🔧 环境变量

确保在 `.env` 文件中设置以下环境变量：

```env
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"
```

## 📊 数据库模型

### 核心模型

- `UserProfile` - 用户资料
- `Post` - 文章
- `Category` - 分类
- `PDFAnnotation` - PDF 注释

### 弹幕系统模型

- `Danmaku` - 弹幕主表
- `DanmakuPool` - 弹幕池
- `DanmakuStats` - 弹幕统计
- `DanmakuTimeDistribution` - 弹幕时间分布

### 分析模型

- `AnalyticsEvent` - 埋点事件
- `PageView` - 页面访问
- `UserBehaviorAggregate` - 用户行为聚合
- `AnalyticsModule` - 模块配置
- `AnalyticsEventDefinition` - 事件定义

### 聊天模型

- `ChatMessage` - 聊天消息

## 🛠️ 开发工具

### Prisma Studio

```bash
npx prisma studio --schema=lib/prisma/schema.prisma
```

### 查看数据库状态

```bash
npx prisma db pull --schema=lib/prisma/schema.prisma
```

## 🔍 故障排除

### 1. 客户端生成失败

- 检查 schema 文件语法
- 确保数据库连接正常
- 验证环境变量设置

### 2. 数据库连接失败

- 检查 DATABASE_URL 格式
- 确认数据库服务运行
- 验证网络连接

### 3. 迁移冲突

- 使用 `prisma migrate reset` 重置
- 检查迁移文件冲突
- 手动解决冲突后重新迁移

## 📝 注意事项

1. **Schema 路径**：所有 Prisma 命令都需要指定 `--schema=lib/prisma/schema.prisma`
2. **环境变量**：确保 `.env` 文件中的数据库连接字符串正确
3. **客户端缓存**：修改 schema 后需要重新生成客户端
4. **迁移安全**：生产环境谨慎使用 `db push`，建议使用 `migrate deploy`
