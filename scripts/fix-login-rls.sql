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

-- 7. 验证配置
-- 检查 RLS 状态
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('UserProfile', 'Post', 'Video', 'Danmaku')
ORDER BY tablename;

-- 检查策略
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('UserProfile', 'Post', 'Video', 'Danmaku')
ORDER BY tablename, policyname; 