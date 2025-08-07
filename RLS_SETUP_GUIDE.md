# Supabase RLS 配置指南

## 🚨 问题说明

您的项目登录不上去的主要原因是 **Supabase 的 Row Level Security (RLS) 没有正确配置**。RLS 是 Supabase 的安全机制，需要手动设置才能让用户正常访问数据库。

## 🔧 解决方案

### 方法一：手动配置（推荐）

#### 1. 登录 Supabase Dashboard

1. 访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 进入 **"SQL Editor"** 页面

#### 2. 执行 RLS 配置脚本

复制以下 SQL 代码并在 SQL Editor 中执行：

```sql
-- ========================================
-- 修复登录问题的 RLS 配置脚本
-- 解决 Supabase 认证和数据库访问问题
-- ========================================

-- 1. 启用 UserProfile 表的 RLS
ALTER TABLE "UserProfile" ENABLE ROW LEVEL SECURITY;

-- 2. 创建基本的用户认证策略
-- 允许用户查看自己的资料
CREATE POLICY "Users can view own profile" ON "UserProfile"
  FOR SELECT USING (auth.uid()::text = id);

-- 允许用户更新自己的资料
CREATE POLICY "Users can update own profile" ON "UserProfile"
  FOR UPDATE USING (auth.uid()::text = id);

-- 允许用户插入自己的资料（注册时）
CREATE POLICY "Users can insert own profile" ON "UserProfile"
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- 允许所有用户查看所有资料（可选，用于用户列表等）
CREATE POLICY "Users can view all profiles" ON "UserProfile"
  FOR SELECT USING (true);

-- 3. 为其他重要表启用 RLS
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Video" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Danmaku" ENABLE ROW LEVEL SECURITY;

-- 4. 创建基本的访问策略
-- Post 表策略
CREATE POLICY "Users can view all posts" ON "Post"
  FOR SELECT USING (true);

CREATE POLICY "Users can create own posts" ON "Post"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own posts" ON "Post"
  FOR UPDATE USING (auth.uid()::text = "userId");

-- Video 表策略
CREATE POLICY "Users can view public videos" ON "Video"
  FOR SELECT USING ("isPublic" = true OR auth.uid()::text = "userId");

CREATE POLICY "Users can create own videos" ON "Video"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

-- Danmaku 表策略
CREATE POLICY "Users can view all danmaku" ON "Danmaku"
  FOR SELECT USING (true);

CREATE POLICY "Users can create own danmaku" ON "Danmaku"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

-- 5. 授予必要的权限
-- 为 authenticated 角色授权
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 为 anon 角色授权（用于未登录用户访问公开内容）
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 为 service_role 角色授权（用于服务端操作）
GRANT ALL ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 6. 设置默认权限
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
```

#### 3. 验证配置

执行完成后，您应该看到类似以下的成功消息：

```
Success. No rows returned
```

### 方法二：使用项目脚本

#### 1. 运行配置脚本

```bash
npm run setup:rls
```

#### 2. 按照脚本提示操作

脚本会显示需要手动执行的 SQL 语句。

## 🔍 验证配置是否成功

### 检查 RLS 状态

在 SQL Editor 中执行：

```sql
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('UserProfile', 'Post', 'Video', 'Danmaku')
ORDER BY tablename;
```

### 检查策略

在 SQL Editor 中执行：

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('UserProfile', 'Post', 'Video', 'Danmaku')
ORDER BY tablename, policyname;
```

## 🛠️ 故障排除

### 问题 1：SQL 执行失败

**可能原因：**

- 表不存在
- 权限不足
- SQL 语法错误

**解决方案：**

1. 确认表已创建
2. 检查数据库连接
3. 逐条执行 SQL 语句

### 问题 2：策略创建失败

**可能原因：**

- 策略名称冲突
- 权限不足

**解决方案：**

1. 先删除现有策略：

```sql
DROP POLICY IF EXISTS "Users can view own profile" ON "UserProfile";
DROP POLICY IF EXISTS "Users can update own profile" ON "UserProfile";
DROP POLICY IF EXISTS "Users can insert own profile" ON "UserProfile";
DROP POLICY IF EXISTS "Users can view all profiles" ON "UserProfile";
```

2. 重新创建策略

### 问题 3：仍然有权限错误

**可能原因：**

- 用户未登录
- 认证配置问题

**解决方案：**

1. 确认用户已登录
2. 检查 Supabase 认证配置
3. 验证环境变量设置

## 📊 RLS 策略说明

### 策略 1：用户资料访问

```sql
CREATE POLICY "Users can view own profile" ON "UserProfile"
  FOR SELECT USING (auth.uid()::text = id);
```

- 用户只能查看自己的资料
- `auth.uid()` 返回当前登录用户的 ID
- `::text` 将 UUID 转换为文本进行比较

### 策略 2：用户资料更新

```sql
CREATE POLICY "Users can update own profile" ON "UserProfile"
  FOR UPDATE USING (auth.uid()::text = id);
```

- 用户只能更新自己的资料

### 策略 3：用户资料创建

```sql
CREATE POLICY "Users can insert own profile" ON "UserProfile"
  FOR INSERT WITH CHECK (auth.uid()::text = id);
```

- 用户只能创建自己的资料
- `WITH CHECK` 确保插入的数据符合条件

## 🔒 安全说明

### 数据隔离

- 每个用户只能访问自己的数据
- 不同用户之间的数据完全隔离
- 防止数据泄露和越权访问

### 权限控制

- 所有操作都需要用户登录
- 自动验证用户身份
- 防止未授权访问

## ✅ 配置完成后的测试

### 1. 基本功能测试

1. 登录用户账户
2. 尝试访问用户资料
3. 验证数据正常显示
4. 检查其他功能是否正常

### 2. 权限测试

1. 使用不同用户账户登录
2. 验证只能看到自己的数据
3. 确认无法访问其他用户的数据

### 3. 错误处理测试

1. 未登录状态下尝试操作
2. 验证适当的错误提示
3. 确认安全机制正常工作

## 🚀 部署注意事项

### 生产环境

- 确保 RLS 策略在生产环境中正确配置
- 定期检查权限设置
- 监控异常访问行为

### 备份策略

- 定期备份数据库
- 保存 RLS 策略配置
- 准备恢复方案

## 📝 总结

RLS 配置完成后，您的项目应该能够：

1. ✅ 正常登录和注册
2. ✅ 访问用户资料
3. ✅ 创建和管理内容
4. ✅ 安全地隔离用户数据

如果配置后仍有问题，请检查：

- 环境变量是否正确设置
- Supabase 项目配置是否正确
- 网络连接是否正常
