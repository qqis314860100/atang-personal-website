// 测试数据库连接
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wqjytqpfpijiqmhjdmhg.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxanl0cXBmcGlqaXFtaGpkbWhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM4NjgxOSwiZXhwIjoyMDY2OTYyODE5fQ.5kuX1zOx9B_rOX3BlEYtOuRniUVETiNxF0uwyd3C8pY'

const supabase = createClient(supabaseUrl, supabaseKey)

const testConnection = async () => {
  console.log('🔍 测试数据库连接...')

  try {
    // 1. 测试ErrorLog表查询
    console.log('\n1. 查询ErrorLog表...')
    const { data: errorLogs, error } = await supabase
      .from('ErrorLog')
      .select('*')
      .limit(5)

    if (error) {
      console.log('❌ ErrorLog查询失败:', error)
    } else {
      console.log('✅ ErrorLog查询成功')
      console.log('📊 ErrorLog数量:', errorLogs.length)

      if (errorLogs.length > 0) {
        console.log('📋 最新错误日志:')
        errorLogs.forEach((log, index) => {
          console.log(
            `  ${index + 1}. ${log.error_type} - ${log.error_message}`
          )
        })
      }
    }

    // 2. 测试插入数据
    console.log('\n2. 测试插入数据...')
    const testData = {
      id: 'test-' + Date.now(),
      error_type: 'TestError',
      error_message: 'This is a test error from script',
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
      console.log('📋 插入的数据ID:', insertResult[0].id)
    }

    // 3. 再次查询验证
    console.log('\n3. 再次查询验证...')
    const { data: newErrorLogs, error: newError } = await supabase
      .from('ErrorLog')
      .select('*')
      .limit(5)

    if (newError) {
      console.log('❌ 验证查询失败:', newError)
    } else {
      console.log('✅ 验证查询成功')
      console.log('📊 最新ErrorLog数量:', newErrorLogs.length)
    }
  } catch (error) {
    console.log('❌ 测试失败:', error.message)
  }
}

testConnection()
