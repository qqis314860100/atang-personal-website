-- 修复重置后的 PDFAnnotation 表

-- 1. 确保 uuid-ossp 扩展存在
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 修改 PDFAnnotation 表的 id 字段默认值
ALTER TABLE "PDFAnnotation" 
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- 3. 授予权限
GRANT ALL PRIVILEGES ON TABLE "PDFAnnotation" TO postgres;
GRANT ALL PRIVILEGES ON TABLE "PDFAnnotation" TO authenticated;
GRANT ALL PRIVILEGES ON TABLE "PDFAnnotation" TO anon;
GRANT ALL PRIVILEGES ON TABLE "PDFAnnotation" TO service_role;

-- 4. 启用 RLS
ALTER TABLE "PDFAnnotation" ENABLE ROW LEVEL SECURITY;

-- 5. 创建策略
CREATE POLICY "Users can view own annotations" ON "PDFAnnotation"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own annotations" ON "PDFAnnotation"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own annotations" ON "PDFAnnotation"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own annotations" ON "PDFAnnotation"
  FOR DELETE USING (auth.uid()::text = "userId");

-- 6. 验证修复结果
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'PDFAnnotation' 
AND table_schema = 'public'
AND column_name = 'id';

-- 7. 测试插入
INSERT INTO "PDFAnnotation" (
    "userId", 
    "pdfUrl", 
    "x", 
    "y", 
    "text", 
    "page"
) VALUES (
    'test-user-id',
    'test.pdf',
    100.0,
    200.0,
    'Test annotation',
    1
) RETURNING "id";

-- 8. 清理测试数据
DELETE FROM "PDFAnnotation" WHERE "userId" = 'test-user-id'; 