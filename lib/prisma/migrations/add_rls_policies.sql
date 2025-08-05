-- 启用PDFAnnotation表的Row Level Security
ALTER TABLE "PDFAnnotation" ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的注释
CREATE POLICY "Users can view own annotations" ON "PDFAnnotation"
  FOR SELECT USING (auth.uid()::text = "userId");

-- 创建策略：用户只能插入自己的注释
CREATE POLICY "Users can insert own annotations" ON "PDFAnnotation"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

-- 创建策略：用户只能更新自己的注释
CREATE POLICY "Users can update own annotations" ON "PDFAnnotation"
  FOR UPDATE USING (auth.uid()::text = "userId");

-- 创建策略：用户只能删除自己的注释
CREATE POLICY "Users can delete own annotations" ON "PDFAnnotation"
  FOR DELETE USING (auth.uid()::text = "userId");

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS "PDFAnnotation_userId_idx" ON "PDFAnnotation" ("userId");
CREATE INDEX IF NOT EXISTS "PDFAnnotation_pdfUrl_idx" ON "PDFAnnotation" ("pdfUrl");
CREATE INDEX IF NOT EXISTS "PDFAnnotation_userId_pdfUrl_idx" ON "PDFAnnotation" ("userId", "pdfUrl"); 