-- 修复 PDFAnnotation 表的 ID 字段，使其自动生成

-- 1. 备份现有数据
CREATE TABLE IF NOT EXISTS "PDFAnnotation_backup" AS 
SELECT * FROM "PDFAnnotation";

-- 2. 删除现有表
DROP TABLE IF EXISTS "PDFAnnotation";

-- 3. 重新创建表，使用 UUID 扩展自动生成 ID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "PDFAnnotation" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
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

-- 4. 授予权限
GRANT ALL PRIVILEGES ON TABLE "PDFAnnotation" TO postgres;
GRANT ALL PRIVILEGES ON TABLE "PDFAnnotation" TO authenticated;
GRANT ALL PRIVILEGES ON TABLE "PDFAnnotation" TO anon;
GRANT ALL PRIVILEGES ON TABLE "PDFAnnotation" TO service_role;

-- 5. 启用 RLS
ALTER TABLE "PDFAnnotation" ENABLE ROW LEVEL SECURITY;

-- 6. 创建策略
CREATE POLICY "Users can view own annotations" ON "PDFAnnotation"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own annotations" ON "PDFAnnotation"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own annotations" ON "PDFAnnotation"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own annotations" ON "PDFAnnotation"
  FOR DELETE USING (auth.uid()::text = "userId");

-- 7. 恢复数据（如果有的话）
INSERT INTO "PDFAnnotation" ("id", "userId", "pdfUrl", "x", "y", "text", "page", "timestamp", "createdAt", "updatedAt")
SELECT "id", "userId", "pdfUrl", "x", "y", "text", "page", "timestamp", "createdAt", "updatedAt"
FROM "PDFAnnotation_backup";

-- 8. 删除备份表
DROP TABLE "PDFAnnotation_backup";

-- 9. 验证
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'PDFAnnotation' 
AND table_schema = 'public'
ORDER BY ordinal_position; 