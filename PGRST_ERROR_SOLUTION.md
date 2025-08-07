# PGRST116 错误解决方案

## 🔍 错误分析

您遇到的错误是 **PostgREST** 的 `PGRST116` 错误：

```json
{
  "code": "PGRST116",
  "details": "The result contains 0 rows",
  "hint": null,
  "message": "JSON object requested, multiple (or no) rows returned"
}
```

## 🎯 错误原因

这个错误通常发生在以下情况：

1. **数据库中没有数据**：相关表是空的
2. **查询条件不匹配**：WHERE 条件没有匹配到任何记录
3. **Prisma 客户端未更新**：新增的模型还没有生成到客户端
4. **权限问题**：RLS (Row Level Security) 阻止了数据访问

## 🔧 解决方案

### 1. 生成 Prisma 客户端

首先确保 Prisma 客户端包含新的视频模型：

```bash
# 生成Prisma客户端
npm run prisma:generate

# 推送数据库变更
npm run prisma:push
```

### 2. 初始化测试数据

运行视频种子脚本来创建测试数据：

```bash
# 创建视频相关的测试数据
npm run db:seed:video
```

### 3. 检查数据库连接

确保数据库连接正常：

```bash
# 检查数据库状态
npm run db:push
```

### 4. 验证数据存在

检查数据库中是否有数据：

```bash
# 运行测试脚本
node -e "
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function check() {
  const videos = await prisma.video.count()
  const users = await prisma.userProfile.count()
  console.log('视频数量:', videos)
  console.log('用户数量:', users)
  await prisma.\$disconnect()
}
check()
"
```

## 🚀 完整解决步骤

### 步骤 1：更新数据库结构

```bash
# 推送最新的schema到数据库
npm run prisma:push
```

### 步骤 2：生成客户端

```bash
# 生成包含新模型的Prisma客户端
npm run prisma:generate
```

### 步骤 3：创建测试数据

```bash
# 运行视频种子脚本
npm run db:seed:video
```

### 步骤 4：验证功能

```bash
# 启动开发服务器
npm run dev
```

然后访问：

- 视频管理：`http://localhost:3000/zh/project/video-manager`
- 视频播放器：`http://localhost:3000/zh/project/video-player`

## 📊 预期结果

运行种子脚本后，您应该看到：

```
🌱 开始初始化视频数据...
👤 创建测试用户...
✅ 测试用户创建成功: testuser
🎥 创建测试视频...
✅ 视频创建成功: Big Buck Bunny 动画短片
✅ 视频创建成功: Elephant Dream 实验短片
✅ 视频创建成功: Sintel 开源电影
💬 为视频 "Big Buck Bunny 动画短片" 创建测试弹幕...
✅ 弹幕创建成功
💬 为视频 "Elephant Dream 实验短片" 创建测试弹幕...
✅ 弹幕创建成功
💬 为视频 "Sintel 开源电影" 创建测试弹幕...
✅ 弹幕创建成功
🎉 视频数据初始化完成!
📊 数据统计:
   - 用户: 1
   - 视频: 3
   - 弹幕: 9
```

## 🔍 故障排除

### 如果仍然出现错误：

1. **检查数据库连接**

   ```bash
   # 验证环境变量
   echo $DATABASE_URL
   ```

2. **重置数据库**（谨慎使用）

   ```bash
   # 强制重置数据库
   npm run db:push:force
   npm run db:seed:video
   ```

3. **检查 Prisma 状态**

   ```bash
   # 验证schema
   npx prisma validate --schema=lib/prisma/schema.prisma
   ```

4. **查看详细错误**
   ```bash
   # 启用详细日志
   DEBUG=prisma:* npm run dev
   ```

## 📝 注意事项

1. **数据安全**：种子脚本会创建测试数据，生产环境请谨慎使用
2. **用户 ID**：当前使用固定的测试用户 ID `test-user-001`
3. **视频 URL**：使用 Google 提供的示例视频，确保网络连接正常
4. **权限设置**：确保数据库用户有足够的权限创建表和插入数据

## 🎉 成功标志

解决后，您应该能够：

- ✅ 访问视频管理页面并看到 3 个测试视频
- ✅ 在视频播放器中播放视频并看到弹幕
- ✅ 使用视频上传功能创建新视频
- ✅ 编辑和删除现有视频

如果问题仍然存在，请检查控制台日志获取更详细的错误信息。
