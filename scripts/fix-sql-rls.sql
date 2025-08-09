-- ========================================
-- 完整的 RLS 配置脚本 (基于 schema.prisma)
-- 解决 Supabase 认证和数据库访问问题
-- ========================================

-- ==================== 1. 清理现有策略 ====================
-- 删除可能存在的旧策略，避免冲突
DROP POLICY IF EXISTS "Users can view own profile" ON "UserProfile";
DROP POLICY IF EXISTS "Users can update own profile" ON "UserProfile";
DROP POLICY IF EXISTS "Users can insert own profile" ON "UserProfile";
DROP POLICY IF EXISTS "Users can view all profiles" ON "UserProfile";
DROP POLICY IF EXISTS "Users can view all posts" ON "Post";
DROP POLICY IF EXISTS "Users can create own posts" ON "Post";
DROP POLICY IF EXISTS "Users can update own posts" ON "Post";
DROP POLICY IF EXISTS "Users can delete own posts" ON "Post";
DROP POLICY IF EXISTS "Users can view all categories" ON "Category";
DROP POLICY IF EXISTS "Users can create own categories" ON "Category";
DROP POLICY IF EXISTS "Users can update own categories" ON "Category";
DROP POLICY IF EXISTS "Users can view all annotations" ON "PDFAnnotation";
DROP POLICY IF EXISTS "Users can create own annotations" ON "PDFAnnotation";
DROP POLICY IF EXISTS "Users can update own annotations" ON "PDFAnnotation";
DROP POLICY IF EXISTS "Users can delete own annotations" ON "PDFAnnotation";

-- 埋点系统策略清理
DROP POLICY IF EXISTS "Allow all page view operations" ON "PageView";
DROP POLICY IF EXISTS "Allow all user event operations" ON "UserEvent";
DROP POLICY IF EXISTS "Allow all performance metric operations" ON "PerformanceMetric";
DROP POLICY IF EXISTS "Allow all error log operations" ON "ErrorLog";
DROP POLICY IF EXISTS "Allow all user session operations" ON "UserSession";

-- 视频系统策略清理
DROP POLICY IF EXISTS "Users can view public videos" ON "Video";
DROP POLICY IF EXISTS "Users can create own videos" ON "Video";
DROP POLICY IF EXISTS "Users can update own videos" ON "Video";
DROP POLICY IF EXISTS "Users can view all danmaku" ON "Danmaku";
DROP POLICY IF EXISTS "Users can create own danmaku" ON "Danmaku";
DROP POLICY IF EXISTS "Users can view all video comments" ON "VideoComment";
DROP POLICY IF EXISTS "Users can create own video comments" ON "VideoComment";
DROP POLICY IF EXISTS "Users can update own video comments" ON "VideoComment";
DROP POLICY IF EXISTS "Users can view all video likes" ON "VideoLike";
DROP POLICY IF EXISTS "Users can create own video likes" ON "VideoLike";
DROP POLICY IF EXISTS "Users can view all play records" ON "VideoPlayRecord";
DROP POLICY IF EXISTS "Users can create own play records" ON "VideoPlayRecord";

-- ==================== 2. 启用表的 RLS ====================
-- 核心用户表
ALTER TABLE "UserProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PDFAnnotation" ENABLE ROW LEVEL SECURITY;

-- 埋点系统表
ALTER TABLE "PageView" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PerformanceMetric" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ErrorLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserSession" ENABLE ROW LEVEL SECURITY;

-- 视频系统表
ALTER TABLE "Video" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Danmaku" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DanmakuPool" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DanmakuStats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DanmakuTimeDistribution" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VideoComment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VideoPlayRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VideoLike" ENABLE ROW LEVEL SECURITY;

-- Prisma 内部表
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- ==================== 3. 用户资料表策略 ====================
-- 允许用户查看自己的资料
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

-- ==================== 4. 文章系统策略 ====================
-- Post 表策略
CREATE POLICY "Users can view all posts" ON "Post"
  FOR SELECT USING (true);

CREATE POLICY "Users can create own posts" ON "Post"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own posts" ON "Post"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own posts" ON "Post"
  FOR DELETE USING (auth.uid()::text = "userId");

-- Category 表策略
CREATE POLICY "Users can view all categories" ON "Category"
  FOR SELECT USING (true);

CREATE POLICY "Users can create own categories" ON "Category"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own categories" ON "Category"
  FOR UPDATE USING (auth.uid()::text = "userId");

-- PDF 注释策略
CREATE POLICY "Users can view all annotations" ON "PDFAnnotation"
  FOR SELECT USING (true);

CREATE POLICY "Users can create own annotations" ON "PDFAnnotation"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own annotations" ON "PDFAnnotation"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own annotations" ON "PDFAnnotation"
  FOR DELETE USING (auth.uid()::text = "userId");

-- ==================== 5. 埋点系统策略 ====================
-- PageView 表策略（允许所有操作，用于分析）
CREATE POLICY "Allow all page view operations" ON "PageView"
  FOR ALL USING (true);

-- UserEvent 表策略
CREATE POLICY "Allow all user event operations" ON "UserEvent"
  FOR ALL USING (true);

-- PerformanceMetric 表策略
CREATE POLICY "Allow all performance metric operations" ON "PerformanceMetric"
  FOR ALL USING (true);

-- ErrorLog 表策略
CREATE POLICY "Allow all error log operations" ON "ErrorLog"
  FOR ALL USING (true);

-- UserSession 表策略
CREATE POLICY "Allow all user session operations" ON "UserSession"
  FOR ALL USING (true);

-- ==================== 6. 视频系统策略 ====================
-- Video 表策略
CREATE POLICY "Users can view public videos" ON "Video"
  FOR SELECT USING ("isPublic" = true AND "isDeleted" = false);

CREATE POLICY "Users can view own videos" ON "Video"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create own videos" ON "Video"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own videos" ON "Video"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own videos" ON "Video"
  FOR DELETE USING (auth.uid()::text = "userId");

-- Danmaku 表策略
CREATE POLICY "Users can view all danmaku" ON "Danmaku"
  FOR SELECT USING (true);

CREATE POLICY "Users can create own danmaku" ON "Danmaku"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own danmaku" ON "Danmaku"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own danmaku" ON "Danmaku"
  FOR DELETE USING (auth.uid()::text = "userId");

-- DanmakuPool 表策略
CREATE POLICY "Allow all danmaku pool operations" ON "DanmakuPool"
  FOR ALL USING (true);

-- DanmakuStats 表策略
CREATE POLICY "Allow all danmaku stats operations" ON "DanmakuStats"
  FOR ALL USING (true);

-- DanmakuTimeDistribution 表策略
CREATE POLICY "Allow all danmaku time distribution operations" ON "DanmakuTimeDistribution"
  FOR ALL USING (true);

-- VideoComment 表策略
CREATE POLICY "Users can view all video comments" ON "VideoComment"
  FOR SELECT USING ("isDeleted" = false);

CREATE POLICY "Users can create own video comments" ON "VideoComment"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own video comments" ON "VideoComment"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own video comments" ON "VideoComment"
  FOR DELETE USING (auth.uid()::text = "userId");

-- VideoPlayRecord 表策略
CREATE POLICY "Users can view own play records" ON "VideoPlayRecord"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create own play records" ON "VideoPlayRecord"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own play records" ON "VideoPlayRecord"
  FOR UPDATE USING (auth.uid()::text = "userId");

-- VideoLike 表策略
CREATE POLICY "Users can view all video likes" ON "VideoLike"
  FOR SELECT USING (true);

CREATE POLICY "Users can create own video likes" ON "VideoLike"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own video likes" ON "VideoLike"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own video likes" ON "VideoLike"
  FOR DELETE USING (auth.uid()::text = "userId");

-- ==================== Prisma 内部表策略 ====================
-- _prisma_migrations 表策略（只允许 service_role 访问）
CREATE POLICY "Service role can access migrations" ON "_prisma_migrations"
  FOR ALL USING (current_setting('role', true) = 'service_role');

-- ==================== 7. 权限授予 ====================
-- 为 authenticated 角色授权
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 为 anon 角色授权（用于未登录用户访问公开内容和埋点）
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
-- 埋点系统需要写入权限
GRANT INSERT, UPDATE ON "PageView" TO anon;
GRANT INSERT, UPDATE ON "UserEvent" TO anon;
GRANT INSERT, UPDATE ON "PerformanceMetric" TO anon;
GRANT INSERT, UPDATE ON "ErrorLog" TO anon;
GRANT INSERT, UPDATE ON "UserSession" TO anon;

-- 为 service_role 角色授权（用于服务端操作）
GRANT ALL ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 特殊处理 _prisma_migrations 表的权限
GRANT ALL PRIVILEGES ON "_prisma_migrations" TO service_role;
REVOKE ALL ON "_prisma_migrations" FROM authenticated;
REVOKE ALL ON "_prisma_migrations" FROM anon;

-- ==================== 8. 设置默认权限 ====================
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;

-- ==================== 9. 特殊权限设置 ====================
-- 为埋点系统设置特殊权限
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT, UPDATE ON TABLES TO anon;

-- ==================== 10. 验证配置 ====================
-- 检查 RLS 状态
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'UserProfile', 'Post', 'Category', 'PDFAnnotation',
    'PageView', 'UserEvent', 'PerformanceMetric', 'ErrorLog', 'UserSession',
    'Video', 'Danmaku', 'DanmakuPool', 'DanmakuStats', 'DanmakuTimeDistribution',
    'VideoComment', 'VideoPlayRecord', 'VideoLike', '_prisma_migrations'
  )
ORDER BY tablename;

-- 检查策略数量
SELECT 
  schemaname, 
  tablename, 
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN (
    'UserProfile', 'Post', 'Category', 'PDFAnnotation',
    'PageView', 'UserEvent', 'PerformanceMetric', 'ErrorLog', 'UserSession',
    'Video', 'Danmaku', 'DanmakuPool', 'DanmakuStats', 'DanmakuTimeDistribution',
    'VideoComment', 'VideoPlayRecord', 'VideoLike', '_prisma_migrations'
  )
GROUP BY schemaname, tablename
ORDER BY tablename; 