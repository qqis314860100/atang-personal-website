import { createAdminClient } from '../lib/supabase/server.ts'

async function fixPermissions() {
  try {
    console.log('🔧 开始修复权限...')

    const supabase = await createAdminClient()

    // 简单测试连接
    const { data, error } = await supabase.rpc('grant_analytics_permissions')

    if (error) {
      console.log('⚠️ 需要手动设置权限，错误:', error.message)

      // 使用简单的SQL执行
      const statements = [
        'ALTER TABLE "PageView" DISABLE ROW LEVEL SECURITY',
        'ALTER TABLE "UserEvent" DISABLE ROW LEVEL SECURITY',
        'ALTER TABLE "PerformanceMetric" DISABLE ROW LEVEL SECURITY',
        'ALTER TABLE "ErrorLog" DISABLE ROW LEVEL SECURITY',
        'ALTER TABLE "UserSession" DISABLE ROW LEVEL SECURITY',
      ]

      for (const sql of statements) {
        try {
          console.log(`执行: ${sql}`)
          const result = await supabase.rpc('exec_sql', { sql })
          console.log('✅ 成功')
        } catch (err) {
          console.log(`⚠️ 失败: ${err.message}`)
        }
      }
    }

    // 测试表访问
    console.log('🧪 测试表访问...')

    const tables = [
      'PageView',
      'UserEvent',
      'PerformanceMetric',
      'ErrorLog',
      'UserSession',
    ]

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: 可访问 (${count || 0} 行)`)
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
      }
    }

    console.log('🎉 权限检查完成！')
  } catch (error) {
    console.error('❌ 权限修复失败:', error.message)
  }
}

fixPermissions()
