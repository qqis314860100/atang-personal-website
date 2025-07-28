-- 分步设置 RLS 策略（如果权限不足，可以分步执行）

-- 步骤1：确保 uuid-ossp 扩展存在
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 步骤2：设置 UserProfile 表
ALTER TABLE "UserProfile" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON "UserProfile"
  FOR SELECT USING (auth.uid()::text = "id");

CREATE POLICY "Users can insert own profile" ON "UserProfile"
  FOR INSERT WITH CHECK (auth.uid()::text = "id");

CREATE POLICY "Users can update own profile" ON "UserProfile"
  FOR UPDATE USING (auth.uid()::text = "id");

-- 步骤3：设置 Post 表
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all posts" ON "Post"
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own posts" ON "Post"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own posts" ON "Post"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own posts" ON "Post"
  FOR DELETE USING (auth.uid()::text = "userId");

-- 步骤4：设置 Category 表
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view categories" ON "Category"
  FOR SELECT USING (true);

-- 步骤5：设置 PDFAnnotation 表
ALTER TABLE "PDFAnnotation" ENABLE ROW LEVEL SECURITY;

-- 修复 ID 默认值
ALTER TABLE "PDFAnnotation" 
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

CREATE POLICY "Users can view own annotations" ON "PDFAnnotation"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own annotations" ON "PDFAnnotation"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own annotations" ON "PDFAnnotation"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own annotations" ON "PDFAnnotation"
  FOR DELETE USING (auth.uid()::text = "userId");

-- 步骤6：验证设置
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename; 