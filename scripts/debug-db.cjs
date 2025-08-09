const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ 缺少Supabase配置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const debugDatabase = async () => {
  console.log('🔍 详细调试数据库...')

  try {
    // 1. 检查ErrorLog表
    console.log('\n1. 检查ErrorLog表...')
    const { data: errorLogs, error: errorLogsError } = await supabase
      .from('ErrorLog')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10)

    if (errorLogsError) {
      console.log('❌ ErrorLog查询失败:', errorLogsError)
    } else {
      console.log('✅ ErrorLog查询成功')
      console.log('📊 ErrorLog数量:', errorLogs.length)

      if (errorLogs.length > 0) {
        console.log('📋 最新错误日志:')
        errorLogs.forEach((log, index) => {
          console.log(
            `  ${index + 1}. ${log.error_type} - ${log.error_message}`
          )
          console.log(`     页面: ${log.page}, 时间: ${log.timestamp}`)
        })
      }
    }

    // 2. 检查UserSession表
    console.log('\n2. 检查UserSession表...')
    const { data: sessions, error: sessionsError } = await supabase
      .from('UserSession')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(5)

    if (sessionsError) {
      console.log('❌ UserSession查询失败:', sessionsError)
    } else {
      console.log('✅ UserSession查询成功')
      console.log('📊 UserSession数量:', sessions.length)
    }

    // 3. 检查PageView表
    console.log('\n3. 检查PageView表...')
    const { data: pageViews, error: pageViewsError } = await supabase
      .from('PageView')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5)

    if (pageViewsError) {
      console.log('❌ PageView查询失败:', pageViewsError)
    } else {
      console.log('✅ PageView查询成功')
      console.log('📊 PageView数量:', pageViews.length)
    }

    // 4. 测试Dashboard API
    console.log('\n4. 测试Dashboard API...')
    const response = await fetch(
      'http://localhost:3001/api/analytics/dashboard?timeRange=1d'
    )

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Dashboard API成功')
      console.log('📊 错误日志数量:', data.data.errorLogs?.length || 0)
      console.log('📊 页面访问数:', data.data.pageViews || 0)
    } else {
      console.log('❌ Dashboard API失败:', await response.text())
    }
  } catch (error) {
    console.log('❌ 调试失败:', error.message)
  }
}

debugDatabase()
