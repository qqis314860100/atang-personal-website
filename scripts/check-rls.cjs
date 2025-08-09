const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ 缺少Supabase配置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const checkRLS = async () => {
  console.log('🔍 检查RLS策略...')

  try {
    // 使用service role key查询
    console.log('\n1. 使用service role key查询ErrorLog...')
    const { data: errorLogs, error } = await supabase
      .from('ErrorLog')
      .select('*')
      .limit(5)

    if (error) {
      console.log('❌ 查询失败:', error)
    } else {
      console.log('✅ 查询成功')
      console.log('📊 ErrorLog数量:', errorLogs.length)
    }

    // 尝试插入一条测试数据
    console.log('\n2. 尝试插入测试数据...')
    const testData = {
      id: 'test-' + Date.now(),
      error_type: 'TestError',
      error_message: 'This is a test error',
      stack_trace: 'at test (test.js:1:1)',
      page: '/zh/test',
      user_id: 'test_user',
      session_id: 'test_session',
      user_agent: 'Test Browser',
      ip_address: '127.0.0.1',
      severity: 'medium',
      timestamp: new Date().toISOString(),
    }

    const { data: insertResult, error: insertError } = await supabase
      .from('ErrorLog')
      .insert(testData)
      .select()

    if (insertError) {
      console.log('❌ 插入失败:', insertError)
    } else {
      console.log('✅ 插入成功')
      console.log('📋 插入的数据:', insertResult[0])
    }
  } catch (error) {
    console.log('❌ 检查失败:', error.message)
  }
}

checkRLS()
