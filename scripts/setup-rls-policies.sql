-- ========================================
-- Supabase RLS 策略配置脚本
-- 适用于 Next.js + Supabase 项目
-- ========================================

-- 1. 启用所有表的 Row Level Security
ALTER TABLE "UserProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PDFAnnotation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AnalyticsEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PageView" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Video" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VideoComment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VideoPlayRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VideoLike" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Danmaku" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DanmakuPool" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DanmakuStats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DanmakuTimeDistribution" ENABLE ROW LEVEL SECURITY;

-- 2. 为用户表创建策略
-- UserProfile 表策略
CREATE POLICY "Users can view own profile" ON "UserProfile"
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON "UserProfile"
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own profile" ON "UserProfile"
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- 允许管理员查看所有用户资料
CREATE POLICY "Admins can view all profiles" ON "UserProfile"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "UserProfile" 
      WHERE id = auth.uid()::text AND "isAdmin" = true
    )
  );

-- 3. 为文章表创建策略
-- Post 表策略
CREATE POLICY "Users can view all posts" ON "Post"
  FOR SELECT USING (true);

CREATE POLICY "Users can create own posts" ON "Post"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own posts" ON "Post"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own posts" ON "Post"
  FOR DELETE USING (auth.uid()::text = "userId");

-- 4. 为分类表创建策略
-- Category 表策略
CREATE POLICY "Users can view all categories" ON "Category"
  FOR SELECT USING (true);

CREATE POLICY "Users can create own categories" ON "Category"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own categories" ON "Category"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own categories" ON "Category"
  FOR DELETE USING (auth.uid()::text = "userId");

-- 5. 为PDF注释表创建策略
-- PDFAnnotation 表策略
CREATE POLICY "Users can view own annotations" ON "PDFAnnotation"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create own annotations" ON "PDFAnnotation"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own annotations" ON "PDFAnnotation"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own annotations" ON "PDFAnnotation"
  FOR DELETE USING (auth.uid()::text = "userId");

-- 6. 为视频表创建策略
-- Video 表策略
CREATE POLICY "Users can view public videos" ON "Video"
  FOR SELECT USING ("isPublic" = true OR auth.uid()::text = "userId");

CREATE POLICY "Users can create own videos" ON "Video"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own videos" ON "Video"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own videos" ON "Video"
  FOR DELETE USING (auth.uid()::text = "userId");

-- 7. 为视频评论表创建策略
-- VideoComment 表策略
CREATE POLICY "Users can view all comments" ON "VideoComment"
  FOR SELECT USING (true);

CREATE POLICY "Users can create own comments" ON "VideoComment"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own comments" ON "VideoComment"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own comments" ON "VideoComment"
  FOR DELETE USING (auth.uid()::text = "userId");

-- 8. 为视频播放记录表创建策略
-- VideoPlayRecord 表策略
CREATE POLICY "Users can view own play records" ON "VideoPlayRecord"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create own play records" ON "VideoPlayRecord"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own play records" ON "VideoPlayRecord"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own play records" ON "VideoPlayRecord"
  FOR DELETE USING (auth.uid()::text = "userId");

-- 9. 为视频点赞表创建策略
-- VideoLike 表策略
CREATE POLICY "Users can view all likes" ON "VideoLike"
  FOR SELECT USING (true);

CREATE POLICY "Users can create own likes" ON "VideoLike"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own likes" ON "VideoLike"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own likes" ON "VideoLike"
  FOR DELETE USING (auth.uid()::text = "userId");

-- 10. 为弹幕表创建策略
-- Danmaku 表策略
CREATE POLICY "Users can view all danmaku" ON "Danmaku"
  FOR SELECT USING (true);

CREATE POLICY "Users can create own danmaku" ON "Danmaku"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own danmaku" ON "Danmaku"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own danmaku" ON "Danmaku"
  FOR DELETE USING (auth.uid()::text = "userId");

-- 11. 为弹幕池表创建策略
-- DanmakuPool 表策略
CREATE POLICY "Users can view all danmaku pools" ON "DanmakuPool"
  FOR SELECT USING (true);

CREATE POLICY "Users can create danmaku pools" ON "DanmakuPool"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update danmaku pools" ON "DanmakuPool"
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete danmaku pools" ON "DanmakuPool"
  FOR DELETE USING (true);

-- 12. 为弹幕统计表创建策略
-- DanmakuStats 表策略
CREATE POLICY "Users can view all danmaku stats" ON "DanmakuStats"
  FOR SELECT USING (true);

CREATE POLICY "Users can create danmaku stats" ON "DanmakuStats"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update danmaku stats" ON "DanmakuStats"
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete danmaku stats" ON "DanmakuStats"
  FOR DELETE USING (true);

-- 13. 为弹幕时间分布表创建策略
-- DanmakuTimeDistribution 表策略
CREATE POLICY "Users can view all danmaku time distributions" ON "DanmakuTimeDistribution"
  FOR SELECT USING (true);

CREATE POLICY "Users can create danmaku time distributions" ON "DanmakuTimeDistribution"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update danmaku time distributions" ON "DanmakuTimeDistribution"
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete danmaku time distributions" ON "DanmakuTimeDistribution"
  FOR DELETE USING (true);

-- 14. 为分析事件表创建策略
-- AnalyticsEvent 表策略
CREATE POLICY "Users can view own analytics events" ON "AnalyticsEvent"
  FOR SELECT USING (auth.uid()::text = "userId" OR "userId" IS NULL);

CREATE POLICY "Users can create analytics events" ON "AnalyticsEvent"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own analytics events" ON "AnalyticsEvent"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own analytics events" ON "AnalyticsEvent"
  FOR DELETE USING (auth.uid()::text = "userId");

-- 15. 为页面访问表创建策略
-- PageView 表策略
CREATE POLICY "Users can view own page views" ON "PageView"
  FOR SELECT USING (auth.uid()::text = "userId" OR "userId" IS NULL);

CREATE POLICY "Users can create page views" ON "PageView"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own page views" ON "PageView"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own page views" ON "PageView"
  FOR DELETE USING (auth.uid()::text = "userId");

-- 16. 为所有角色授予必要的权限
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

-- 17. 设置默认权限（为将来创建的表）
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;

-- 18. 创建必要的索引以提高性能
CREATE INDEX IF NOT EXISTS "UserProfile_id_idx" ON "UserProfile" ("id");
CREATE INDEX IF NOT EXISTS "UserProfile_email_idx" ON "UserProfile" ("email");
CREATE INDEX IF NOT EXISTS "UserProfile_username_idx" ON "UserProfile" ("username");

CREATE INDEX IF NOT EXISTS "Post_userId_idx" ON "Post" ("userId");
CREATE INDEX IF NOT EXISTS "Post_categoryId_idx" ON "Post" ("categoryId");
CREATE INDEX IF NOT EXISTS "Post_createdAt_idx" ON "Post" ("createdAt");

CREATE INDEX IF NOT EXISTS "Category_userId_idx" ON "Category" ("userId");

CREATE INDEX IF NOT EXISTS "PDFAnnotation_userId_idx" ON "PDFAnnotation" ("userId");
CREATE INDEX IF NOT EXISTS "PDFAnnotation_pdfUrl_idx" ON "PDFAnnotation" ("pdfUrl");

CREATE INDEX IF NOT EXISTS "Video_userId_idx" ON "Video" ("userId");
CREATE INDEX IF NOT EXISTS "Video_isPublic_idx" ON "Video" ("isPublic");
CREATE INDEX IF NOT EXISTS "Video_category_idx" ON "Video" ("category");

CREATE INDEX IF NOT EXISTS "VideoComment_userId_idx" ON "VideoComment" ("userId");
CREATE INDEX IF NOT EXISTS "VideoComment_videoId_idx" ON "VideoComment" ("videoId");

CREATE INDEX IF NOT EXISTS "VideoPlayRecord_userId_idx" ON "VideoPlayRecord" ("userId");
CREATE INDEX IF NOT EXISTS "VideoPlayRecord_videoId_idx" ON "VideoPlayRecord" ("videoId");

CREATE INDEX IF NOT EXISTS "VideoLike_userId_idx" ON "VideoLike" ("userId");
CREATE INDEX IF NOT EXISTS "VideoLike_videoId_idx" ON "VideoLike" ("videoId");

CREATE INDEX IF NOT EXISTS "Danmaku_userId_idx" ON "Danmaku" ("userId");
CREATE INDEX IF NOT EXISTS "Danmaku_videoId_idx" ON "Danmaku" ("videoId");
CREATE INDEX IF NOT EXISTS "Danmaku_timeMs_idx" ON "Danmaku" ("timeMs");

-- 19. 验证配置
-- 检查 RLS 是否启用
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 检查策略是否创建
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname; 