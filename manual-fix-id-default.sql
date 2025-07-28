-- 手动修复 PDFAnnotation 表的 ID 默认值

-- 1. 确保 uuid-ossp 扩展存在
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 修改 id 字段的默认值
ALTER TABLE "PDFAnnotation" 
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- 3. 验证修改
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'PDFAnnotation' 
AND table_schema = 'public'
AND column_name = 'id';

-- 4. 测试插入
INSERT INTO "PDFAnnotation" (
    "userId", 
    "pdfUrl", 
    "x", 
    "y", 
    "text", 
    "page"
) VALUES (
    'test-user-id-2',
    'test2.pdf',
    150.0,
    250.0,
    'Test annotation 2',
    2
) RETURNING "id";

-- 5. 清理测试数据
DELETE FROM "PDFAnnotation" WHERE "userId" = 'test-user-id-2'; 