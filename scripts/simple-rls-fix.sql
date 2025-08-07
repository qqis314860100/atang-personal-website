-- ========================================
-- 最简单的 RLS 策略配置
-- 解决无限递归问题
-- ========================================

-- 1. 删除所有现有策略
DROP POLICY IF EXISTS "Users can view own profile" ON "UserProfile";
DROP POLICY IF EXISTS "Users can update own profile" ON "UserProfile";
DROP POLICY IF EXISTS "Users can insert own profile" ON "UserProfile";
DROP POLICY IF EXISTS "Users can view all profiles" ON "UserProfile";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "UserProfile";
DROP POLICY IF EXISTS "Enable read access for all users" ON "UserProfile";
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON "UserProfile";

-- 2. 创建最简单的策略
-- 允许所有已认证用户访问 UserProfile 表
CREATE POLICY "Allow all authenticated users" ON "UserProfile"
  FOR ALL USING (auth.role() = 'authenticated');

-- 3. 或者更宽松的策略（临时测试用）
-- 允许所有操作（仅用于测试）
CREATE POLICY "Allow all operations" ON "UserProfile"
  FOR ALL USING (true);

-- 4. 验证
SELECT 
  policyname, 
  cmd, 
  permissive, 
  roles 
FROM pg_policies 
WHERE tablename = 'UserProfile' 
  AND schemaname = 'public'; 