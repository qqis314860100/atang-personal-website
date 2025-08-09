const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 从环境变量读取配置
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少必要的环境变量')
  console.log('请确保设置了以下环境变量：')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// 创建Supabase客户端（使用服务角色密钥）
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixAnalyticsPermissions() {
  try {
    console.log('🔧 开始修复埋点系统权限...')

    // 直接执行SQL语句
    const statements = [
      'GRANT USAGE ON SCHEMA public TO service_role',
      'GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role',
      'GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role',
      'GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role',

      'GRANT USAGE ON SCHEMA public TO authenticated',
      'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated',
      'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated',

      'GRANT USAGE ON SCHEMA public TO anon',
      'GRANT SELECT, INSERT ON "PageView" TO anon',
      'GRANT SELECT, INSERT ON "UserEvent" TO anon',
      'GRANT SELECT, INSERT ON "PerformanceMetric" TO anon',
      'GRANT SELECT, INSERT ON "ErrorLog" TO anon',
      'GRANT SELECT, INSERT ON "UserSession" TO anon',

      'ALTER TABLE "PageView" ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE "UserEvent" ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE "PerformanceMetric" ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE "ErrorLog" ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE "UserSession" ENABLE ROW LEVEL SECURITY',

      'DROP POLICY IF EXISTS "Allow all operations" ON "PageView"',
      'DROP POLICY IF EXISTS "Allow all operations" ON "UserEvent"',
      'DROP POLICY IF EXISTS "Allow all operations" ON "PerformanceMetric"',
      'DROP POLICY IF EXISTS "Allow all operations" ON "ErrorLog"',
      'DROP POLICY IF EXISTS "Allow all operations" ON "UserSession"',

      'CREATE POLICY "Allow all operations" ON "PageView" FOR ALL USING (true)',
      'CREATE POLICY "Allow all operations" ON "UserEvent" FOR ALL USING (true)',
      'CREATE POLICY "Allow all operations" ON "PerformanceMetric" FOR ALL USING (true)',
      'CREATE POLICY "Allow all operations" ON "ErrorLog" FOR ALL USING (true)',
      'CREATE POLICY "Allow all operations" ON "UserSession" FOR ALL USING (true)',
    ]

    for (const statement of statements) {
      console.log(`执行: ${statement}`)

      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement,
        })

        if (error) {
          console.error(`❌ 执行失败: ${error.message}`)
          // 继续执行其他语句
        } else {
          console.log('✅ 执行成功')
        }
      } catch (err) {
        console.error(`❌ 执行错误: ${err.message}`)
      }
    }

    console.log('🎉 权限修复完成！')

    // 测试权限
    console.log('🧪 测试权限...')
    const { data, error } = await supabase
      .from('PageView')
      .select('count', { count: 'exact', head: true })

    if (error) {
      console.error('❌ 权限测试失败:', error.message)
    } else {
      console.log('✅ 权限测试成功！')
    }
  } catch (error) {
    console.error('❌ 权限修复失败:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  fixAnalyticsPermissions()
}

module.exports = { fixAnalyticsPermissions }
