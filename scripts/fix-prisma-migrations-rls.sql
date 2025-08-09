-- ========================================
-- Prisma Migrations 表 RLS 配置
-- 限制对 _prisma_migrations 表的访问
-- ========================================

-- 启用 _prisma_migrations 表的 RLS
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- 清理可能存在的旧策略
DROP POLICY IF EXISTS "Restrict migrations access" ON "_prisma_migrations";
DROP POLICY IF EXISTS "Service role can access migrations" ON "_prisma_migrations";

-- 创建策略：只允许 service_role 访问迁移表
CREATE POLICY "Service role can access migrations" ON "_prisma_migrations"
  FOR ALL USING (current_setting('role', true) = 'service_role');

-- 为 service_role 角色授权（确保 Prisma 可以管理迁移）
GRANT ALL PRIVILEGES ON "_prisma_migrations" TO service_role;

-- 拒绝其他角色访问
REVOKE ALL ON "_prisma_migrations" FROM authenticated;
REVOKE ALL ON "_prisma_migrations" FROM anon;

-- 验证配置
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = '_prisma_migrations';

-- 检查策略
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd 
FROM pg_policies 
WHERE tablename = '_prisma_migrations'; 