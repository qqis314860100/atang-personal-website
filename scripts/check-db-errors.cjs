// 直接查询数据库中的错误日志
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ 缺少Supabase配置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const checkDBErrors = async () => {
  console.log('🔍 直接查询数据库中的错误日志...')

  try {
    // 查询ErrorLog表
    const { data: errorLogs, error } = await supabase
      .from('ErrorLog')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20)

    if (error) {
      console.log('❌ 查询失败:', error)
      return
    }

    console.log('✅ 查询成功')
    console.log('📊 错误日志总数:', errorLogs.length)

    if (errorLogs.length > 0) {
      console.log('\n📋 错误日志详情:')
      errorLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ID: ${log.id}`)
        console.log(`     类型: ${log.error_type}`)
        console.log(`     消息: ${log.error_message}`)
        console.log(`     页面: ${log.page}`)
        console.log(`     严重程度: ${log.severity}`)
        console.log(`     时间: ${log.timestamp}`)
        console.log('')
      })
    } else {
      console.log('📭 没有找到错误日志数据')
    }

    // 检查表结构
    console.log('\n🔍 检查表结构...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('ErrorLog')
      .select('*')
      .limit(1)

    if (tableError) {
      console.log('❌ 表结构检查失败:', tableError)
    } else {
      console.log('✅ 表结构正常')
      if (tableInfo && tableInfo.length > 0) {
        console.log('📋 字段列表:', Object.keys(tableInfo[0]))
      }
    }
  } catch (error) {
    console.log('❌ 检查失败:', error.message)
  }
}

checkDBErrors()
