-- ========================================
-- 修复 RLS 无限递归错误
-- 解决 UserProfile 表的策略问题
-- ========================================

-- 1. 先删除所有现有的 UserProfile 策略
DROP POLICY IF EXISTS "Users can view own profile" ON "UserProfile";
DROP POLICY IF EXISTS "Users can update own profile" ON "UserProfile";
DROP POLICY IF EXISTS "Users can insert own profile" ON "UserProfile";
DROP POLICY IF EXISTS "Users can view all profiles" ON "UserProfile";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "UserProfile";
DROP POLICY IF EXISTS "Enable read access for all users" ON "UserProfile";
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON "UserProfile";

-- 2. 重新创建正确的策略
-- 允许用户查看自己的资料（基于用户ID匹配）
CREATE POLICY "Users can view own profile" ON "UserProfile"
  FOR SELECT USING (auth.uid()::text = id);

-- 允许用户更新自己的资料
CREATE POLICY "Users can update own profile" ON "UserProfile"
  FOR UPDATE USING (auth.uid()::text = id);

-- 允许用户插入自己的资料（注册时）
CREATE POLICY "Users can insert own profile" ON "UserProfile"
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- 允许所有用户查看所有资料（用于用户列表等）
CREATE POLICY "Users can view all profiles" ON "UserProfile"
  FOR SELECT USING (true);

-- 3. 验证策略
-- 检查策略是否正确创建
SELECT 
  policyname, 
  cmd, 
  permissive, 
  roles 
FROM pg_policies 
WHERE tablename = 'UserProfile' 
  AND schemaname = 'public'
ORDER BY policyname; 