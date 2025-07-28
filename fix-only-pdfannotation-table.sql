-- 只修复 PDFAnnotation 表，不影响其他表

-- 1. 确保 uuid-ossp 扩展存在
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 备份 PDFAnnotation 表数据（如果有的话）
CREATE TABLE IF NOT EXISTS "PDFAnnotation_backup" AS 
SELECT * FROM "PDFAnnotation";

-- 3. 删除 PDFAnnotation 表
DROP TABLE IF EXISTS "PDFAnnotation";

-- 4. 重新创建 PDFAnnotation 表
CREATE TABLE "PDFAnnotation" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "text" TEXT NOT NULL,
    "page" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PDFAnnotation_pkey" PRIMARY KEY ("id")
);

-- 5. 创建索引
CREATE INDEX "PDFAnnotation_pdfUrl_idx" ON "PDFAnnotation"("pdfUrl");
CREATE INDEX "PDFAnnotation_userId_idx" ON "PDFAnnotation"("userId");
CREATE INDEX "PDFAnnotation_userId_pdfUrl_idx" ON "PDFAnnotation"("userId", "pdfUrl");

-- 6. 授予权限
GRANT ALL PRIVILEGES ON TABLE "PDFAnnotation" TO postgres;
GRANT ALL PRIVILEGES ON TABLE "PDFAnnotation" TO authenticated;
GRANT ALL PRIVILEGES ON TABLE "PDFAnnotation" TO anon;
GRANT ALL PRIVILEGES ON TABLE "PDFAnnotation" TO service_role;

-- 7. 启用 RLS
ALTER TABLE "PDFAnnotation" ENABLE ROW LEVEL SECURITY;

-- 8. 创建策略
CREATE POLICY "Users can view own annotations" ON "PDFAnnotation"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own annotations" ON "PDFAnnotation"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own annotations" ON "PDFAnnotation"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own annotations" ON "PDFAnnotation"
  FOR DELETE USING (auth.uid()::text = "userId");

-- 9. 恢复数据（如果有的话）
INSERT INTO "PDFAnnotation" ("id", "userId", "pdfUrl", "x", "y", "text", "page", "timestamp", "createdAt", "updatedAt")
SELECT "id", "userId", "pdfUrl", "x", "y", "text", "page", "timestamp", "createdAt", "updatedAt"
FROM "PDFAnnotation_backup";

-- 10. 删除备份表
DROP TABLE "PDFAnnotation_backup";

-- 11. 验证
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'PDFAnnotation' 
AND table_schema = 'public'
ORDER BY ordinal_position; 