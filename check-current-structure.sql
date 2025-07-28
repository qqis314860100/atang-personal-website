-- 检查当前 PDFAnnotation 表的结构
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'PDFAnnotation' 
AND table_schema = 'public'
ORDER BY ordinal_position; 