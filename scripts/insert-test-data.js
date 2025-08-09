import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wqjytqpfpijiqmhjdmhg.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxanl0cXBmcGlqaXFtaGpkbWhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM4NjgxOSwiZXhwIjoyMDY2OTYyODE5fQ.5kuX1zOx9B_rOX3BlEYtOuRniUVETiNxF0uwyd3C8pY'

const supabase = createClient(supabaseUrl, supabaseKey)

const insertTestData = async () => {
  console.log('🧪 插入测试错误日志数据...')

  const errorTypes = [
    'TypeError',
    'ReferenceError',
    'SyntaxError',
    'NetworkError',
    'ValidationError',
  ]
  const pages = [
    '/zh/dashboard',
    '/zh/blog',
    '/zh/about',
    '/zh/contact',
    '/zh/profile',
  ]
  const severities = ['high', 'medium', 'low']

  for (let i = 0; i < 15; i++) {
    const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)]
    const page = pages[Math.floor(Math.random() * pages.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]

    const testData = {
      id: `test-${Date.now()}-${i}`,
      error_type: errorType,
      error_message: `Test ${errorType} message ${i + 1}`,
      stack_trace: `at test${i} (test.js:${
        i + 1
      }:1)\nat process (main.js:10:5)`,
      page: page,
      user_id: `user_${Math.floor(Math.random() * 1000) + 1}`,
      session_id: `session_${Math.floor(Math.random() * 10000) + 1}`,
      user_agent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ip_address: `192.168.1.${Math.floor(Math.random() * 255) + 1}`,
      severity: severity,
      timestamp: new Date().toISOString(),
    }

    try {
      const { data, error } = await supabase
        .from('ErrorLog')
        .insert(testData)
        .select()

      if (error) {
        console.log(`❌ 插入失败 ${i + 1}:`, error.message)
      } else {
        console.log(
          `✅ 插入成功 ${i + 1}: ${errorType} - ${page} - ${severity}`
        )
      }
    } catch (error) {
      console.log(`❌ 错误 ${i + 1}:`, error.message)
    }

    // 等待一小段时间
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.log('\n🎉 测试数据插入完成!')
  console.log('💡 现在可以访问 http://localhost:3001/zh/dashboard 查看错误日志')
}

insertTestData().catch(console.error)
