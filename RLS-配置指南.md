# Supabase RLS 配置指南

## 🚨 权限问题解决方案

您遇到的 `permission denied for table PDFAnnotation` 错误是因为 Supabase 的 Row Level Security (RLS) 策略还没有配置。

## 📋 手动配置步骤

### 1. 登录 Supabase Dashboard

1. 访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 进入 "SQL Editor" 页面

### 2. 执行 RLS 配置 SQL

复制以下 SQL 代码并在 SQL Editor 中执行：

```sql
-- 启用PDFAnnotation表的Row Level Security
ALTER TABLE "PDFAnnotation" ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的注释
CREATE POLICY "Users can view own annotations" ON "PDFAnnotation"
  FOR SELECT USING (auth.uid()::text = "userId");

-- 创建策略：用户只能插入自己的注释
CREATE POLICY "Users can insert own annotations" ON "PDFAnnotation"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

-- 创建策略：用户只能更新自己的注释
CREATE POLICY "Users can update own annotations" ON "PDFAnnotation"
  FOR UPDATE USING (auth.uid()::text = "userId");

-- 创建策略：用户只能删除自己的注释
CREATE POLICY "Users can delete own annotations" ON "PDFAnnotation"
  FOR DELETE USING (auth.uid()::text = "userId");

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS "PDFAnnotation_userId_idx" ON "PDFAnnotation" ("userId");
CREATE INDEX IF NOT EXISTS "PDFAnnotation_pdfUrl_idx" ON "PDFAnnotation" ("pdfUrl");
CREATE INDEX IF NOT EXISTS "PDFAnnotation_userId_pdfUrl_idx" ON "PDFAnnotation" ("userId", "pdfUrl");
```

### 3. 验证配置

执行完成后，您应该看到类似以下的成功消息：

```
Success. No rows returned
```

## 🔍 验证配置是否成功

### 方法 1：检查 RLS 状态

在 SQL Editor 中执行：

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'PDFAnnotation';
```

### 方法 2：检查策略

在 SQL Editor 中执行：

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'PDFAnnotation';
```

## 🛠️ 故障排除

### 问题 1：SQL 执行失败

**可能原因：**

- 表不存在
- 权限不足
- SQL 语法错误

**解决方案：**

1. 确认 `PDFAnnotation` 表已创建
2. 检查数据库连接
3. 逐条执行 SQL 语句

### 问题 2：策略创建失败

**可能原因：**

- 策略名称冲突
- 权限不足

**解决方案：**

1. 先删除现有策略：

```sql
DROP POLICY IF EXISTS "Users can view own annotations" ON "PDFAnnotation";
DROP POLICY IF EXISTS "Users can insert own annotations" ON "PDFAnnotation";
DROP POLICY IF EXISTS "Users can update own annotations" ON "PDFAnnotation";
DROP POLICY IF EXISTS "Users can delete own annotations" ON "PDFAnnotation";
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

### 策略 1：查看权限

```sql
CREATE POLICY "Users can view own annotations" ON "PDFAnnotation"
  FOR SELECT USING (auth.uid()::text = "userId");
```

- 用户只能查看自己创建的注释
- `auth.uid()` 返回当前登录用户的 ID
- `::text` 将 UUID 转换为文本进行比较

### 策略 2：插入权限

```sql
CREATE POLICY "Users can insert own annotations" ON "PDFAnnotation"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
```

- 用户只能插入自己的注释
- `WITH CHECK` 确保插入的数据符合条件

### 策略 3：更新权限

```sql
CREATE POLICY "Users can update own annotations" ON "PDFAnnotation"
  FOR UPDATE USING (auth.uid()::text = "userId");
```

- 用户只能更新自己的注释

### 策略 4：删除权限

```sql
CREATE POLICY "Users can delete own annotations" ON "PDFAnnotation"
  FOR DELETE USING (auth.uid()::text = "userId");
```

- 用户只能删除自己的注释

## 🔒 安全说明

### 数据隔离

- 每个用户只能访问自己的注释数据
- 不同用户之间的数据完全隔离
- 防止数据泄露和越权访问

### 权限控制

- 所有操作都需要用户登录
- 自动验证用户身份
- 防止未授权访问

### 性能优化

- 创建索引提高查询性能
- 减少不必要的数据库扫描
- 优化查询响应时间

## ✅ 配置完成后的测试

### 1. 基本功能测试

1. 登录用户账户
2. 尝试创建新注释
3. 验证注释保存成功
4. 检查注释列表显示

### 2. 权限测试

1. 使用不同用户账户登录
2. 验证只能看到自己的注释
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

### 监控告警

- 设置权限错误告警
- 监控异常访问模式
- 记录安全事件日志
