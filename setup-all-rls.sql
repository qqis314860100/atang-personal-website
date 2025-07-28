-- 设置所有表的 RLS 策略

-- 1. 确保 uuid-ossp 扩展存在
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== UserProfile 表 =====
ALTER TABLE "UserProfile" ENABLE ROW LEVEL SECURITY;

-- 用户只能查看和修改自己的资料
CREATE POLICY "Users can view own profile" ON "UserProfile"
  FOR SELECT USING (auth.uid()::text = "id");

CREATE POLICY "Users can insert own profile" ON "UserProfile"
  FOR INSERT WITH CHECK (auth.uid()::text = "id");

CREATE POLICY "Users can update own profile" ON "UserProfile"
  FOR UPDATE USING (auth.uid()::text = "id");

-- ===== Post 表 =====
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;

-- 用户可以查看所有文章
CREATE POLICY "Users can view all posts" ON "Post"
  FOR SELECT USING (true);

-- 用户只能创建、修改、删除自己的文章
CREATE POLICY "Users can insert own posts" ON "Post"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own posts" ON "Post"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own posts" ON "Post"
  FOR DELETE USING (auth.uid()::text = "userId");

-- ===== Category 表 =====
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;

-- 所有用户都可以查看分类
CREATE POLICY "Users can view categories" ON "Category"
  FOR SELECT USING (true);

-- ===== PDFAnnotation 表 =====
ALTER TABLE "PDFAnnotation" ENABLE ROW LEVEL SECURITY;

-- 修复 ID 默认值
ALTER TABLE "PDFAnnotation" 
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- 用户只能访问自己的注释
CREATE POLICY "Users can view own annotations" ON "PDFAnnotation"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own annotations" ON "PDFAnnotation"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own annotations" ON "PDFAnnotation"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own annotations" ON "PDFAnnotation"
  FOR DELETE USING (auth.uid()::text = "userId");

-- ===== 授予权限 =====
-- 为所有表授予权限
GRANT ALL PRIVILEGES ON TABLE "UserProfile" TO postgres, authenticated, anon, service_role;
GRANT ALL PRIVILEGES ON TABLE "Post" TO postgres, authenticated, anon, service_role;
GRANT ALL PRIVILEGES ON TABLE "Category" TO postgres, authenticated, anon, service_role;
GRANT ALL PRIVILEGES ON TABLE "PDFAnnotation" TO postgres, authenticated, anon, service_role;

-- ===== 验证 =====
-- 检查所有表的 RLS 状态
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 检查策略
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