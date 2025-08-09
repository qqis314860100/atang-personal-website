const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ 缺少Supabase配置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const queryDatabase = async () => {
  console.log('🔍 直接查询数据库...')

  try {
    // 查询ErrorLog表
    console.log('\n1. 查询ErrorLog表...')
    const { data: errorLogs, error } = await supabase
      .from('ErrorLog')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10)

    if (error) {
      console.log('❌ 查询失败:', error)
      return
    }

    console.log('✅ 查询成功')
    console.log('📊 ErrorLog数量:', errorLogs.length)

    if (errorLogs.length > 0) {
      console.log('\n📋 ErrorLog数据:')
      errorLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ID: ${log.id}`)
        console.log(`     类型: ${log.error_type}`)
        console.log(`     消息: ${log.error_message}`)
        console.log(`     页面: ${log.page}`)
        console.log(`     时间: ${log.timestamp}`)
        console.log('')
      })
    } else {
      console.log('📭 ErrorLog表为空')
    }

    // 查询PageView表作为对比
    console.log('\n2. 查询PageView表...')
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
  } catch (error) {
    console.log('❌ 查询失败:', error.message)
  }
}

queryDatabase()
