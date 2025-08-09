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

    // 读取SQL文件
    const sqlFile = path.join(__dirname, 'fix-analytics-permissions.sql')
    const sql = fs.readFileSync(sqlFile, 'utf8')

    // 分割SQL语句并逐个执行
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    for (const statement of statements) {
      console.log(`执行: ${statement.substring(0, 50)}...`)

      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement,
      })

      if (error) {
        console.error(`❌ 执行失败: ${error.message}`)
        // 继续执行其他语句
      } else {
        console.log('✅ 执行成功')
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
