# Prisma Migrations 表 RLS 配置说明

## 🔒 **问题说明**

在 Supabase Dashboard 中看到 `_prisma_migrations` 表显示为 "Unrestricted"，这表明该表没有启用行级安全（RLS）。

## ⚠️ **为什么需要保护这个表？**

`_prisma_migrations` 是 Prisma 的内部表，包含数据库迁移历史：

- 存储已执行的迁移记录
- 包含敏感的数据库结构信息
- 不应被普通用户访问
- 只有服务端应用需要访问

## ✅ **解决方案**

我已经在 `scripts/fix-sql-rls.sql` 中添加了相应的配置：

### 1. 启用 RLS

```sql
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
```

### 2. 创建访问策略

```sql
-- 只允许 service_role 访问
CREATE POLICY "Service role can access migrations" ON "_prisma_migrations"
  FOR ALL USING (current_setting('role', true) = 'service_role');
```

### 3. 权限控制

```sql
-- 授予 service_role 完整权限
GRANT ALL PRIVILEGES ON "_prisma_migrations" TO service_role;

-- 禁止其他角色访问
REVOKE ALL ON "_prisma_migrations" FROM authenticated;
REVOKE ALL ON "_prisma_migrations" FROM anon;
```

## 🎯 **效果**

执行后：

- ✅ `_prisma_migrations` 表将启用 RLS
- ✅ 只有服务端可以访问迁移表
- ✅ 普通用户无法查看/修改迁移历史
- ✅ Prisma 操作仍然正常工作

## 📋 **执行步骤**

1. 在 Supabase Dashboard 的 SQL 编辑器中
2. 执行完整的 `scripts/fix-sql-rls.sql` 脚本
3. 验证 `_prisma_migrations` 表不再显示为 "Unrestricted"

这样就确保了数据库迁移表的安全性！
