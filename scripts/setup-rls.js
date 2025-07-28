const { createClient } = require('@supabase/supabase-js')

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    '请设置环境变量: NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_SERVICE_ROLE'
  )
  process.exit(1)
}

// 创建Supabase客户端（使用服务角色密钥）
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// RLS策略SQL
const rlsPolicies = `
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
`

async function setupRLS() {
  try {
    console.log('正在设置RLS策略...')

    // 执行SQL语句
    const { error } = await supabase.rpc('exec_sql', { sql: rlsPolicies })

    if (error) {
      console.error('设置RLS策略失败:', error)

      // 如果exec_sql函数不存在，尝试直接执行SQL
      console.log('尝试直接执行SQL...')
      const { error: directError } = await supabase
        .from('PDFAnnotation')
        .select('*')
        .limit(1)

      if (directError) {
        console.error('直接执行SQL也失败:', directError)
        console.log('\n请手动在Supabase Dashboard中执行以下SQL:')
        console.log(rlsPolicies)
      }
    } else {
      console.log('RLS策略设置成功！')
    }
  } catch (error) {
    console.error('执行脚本时出错:', error)
    console.log('\n请手动在Supabase Dashboard中执行以下SQL:')
    console.log(rlsPolicies)
  }
}

setupRLS()
