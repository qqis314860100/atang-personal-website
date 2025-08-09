// 直接向Supabase插入错误日志数据
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wqjytqpfpijiqmhjdmhg.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxanl0cXBmcGlqaXFtaGpkbWhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM4NjgxOSwiZXhwIjoyMDY2OTYyODE5fQ.5kuX1zOx9B_rOX3BlEYtOuRniUVETiNxF0uwyd3C8pY'

const supabase = createClient(supabaseUrl, supabaseKey)

const generateErrorData = async () => {
  console.log('🧪 直接插入错误日志数据到Supabase...')

  const errorTypes = [
    'TypeError',
    'ReferenceError',
    'SyntaxError',
    'NetworkError',
    'ValidationError',
    'RangeError',
    'EvalError',
    'URIError',
    'PermissionError',
    'TimeoutError',
  ]

  const pages = [
    '/zh/dashboard',
    '/zh/blog',
    '/zh/about',
    '/zh/contact',
    '/zh/profile',
    '/zh/settings',
    '/zh/admin',
    '/zh/users',
    '/zh/analytics',
    '/zh/reports',
    '/zh/login',
    '/zh/register',
    '/en/dashboard',
    '/en/blog',
    '/en/about',
  ]

  // 中文严重程度
  const severities = ['高', '中', '低', '严重', '警告']

  // 中文错误消息
  const errorMessages = {
    TypeError: "无法读取未定义对象的属性 'length'",
    ReferenceError: '变量未定义',
    SyntaxError: "意外的标记 '}'",
    NetworkError: '网络请求失败',
    ValidationError: '输入格式无效',
    RangeError: '超出最大调用堆栈大小',
    EvalError: '无效的 eval() 调用',
    URIError: '无效的 URI',
    PermissionError: '权限不足',
    TimeoutError: '请求超时',
  }

  // 生成25条错误日志
  const errorLogs = []
  for (let i = 0; i < 25; i++) {
    const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)]
    const page = pages[Math.floor(Math.random() * pages.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const count = Math.floor(Math.random() * 10) + 1

    // 生成过去7天内的随机时间
    const randomTime = new Date(
      Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
    )

    const errorLog = {
      id: `error_${Date.now()}_${i}`,
      error_type: errorType,
      error_message: errorMessages[errorType] || `${errorType}错误`,
      stack_trace: `at processData (app.js:${
        Math.floor(Math.random() * 100) + 1
      }:${
        Math.floor(Math.random() * 50) + 1
      })\nat renderComponent (component.js:${
        Math.floor(Math.random() * 50) + 1
      }:${Math.floor(Math.random() * 30) + 1})\nat handleClick (handler.js:${
        Math.floor(Math.random() * 25) + 1
      }:${Math.floor(Math.random() * 15) + 1})`,
      page: page,
      user_id: `user_${Math.floor(Math.random() * 1000) + 1}`,
      session_id: `session_${Math.floor(Math.random() * 10000) + 1}`,
      user_agent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ip_address: `192.168.1.${Math.floor(Math.random() * 255) + 1}`,
      severity: severity,
      timestamp: randomTime.toISOString(),
      source: 'frontend',
      trace_id: `trace_${Math.random().toString(36).substr(2, 9)}`,
      count: count,
      last_occurrence: randomTime.toISOString(),
    }

    errorLogs.push(errorLog)
  }

  try {
    console.log(`📊 准备插入 ${errorLogs.length} 条错误日志...`)

    const { data, error } = await supabase
      .from('ErrorLog')
      .insert(errorLogs)
      .select()

    if (error) {
      console.log('❌ 批量插入失败:', error.message)

      // 尝试逐个插入
      console.log('🔄 尝试逐个插入...')
      let successCount = 0
      for (const errorLog of errorLogs) {
        try {
          const { error: singleError } = await supabase
            .from('ErrorLog')
            .insert(errorLog)

          if (singleError) {
            console.log(
              `❌ 插入失败: ${errorLog.error_type} - ${singleError.message}`
            )
          } else {
            successCount++
            console.log(
              `✅ 成功插入: ${errorLog.error_type} - ${errorLog.page} - 严重程度: ${errorLog.severity}`
            )
          }
        } catch (err) {
          console.log(`❌ 插入异常: ${errorLog.error_type} - ${err.message}`)
        }

        // 小延迟
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      console.log(`\n📈 插入统计: ${successCount}/${errorLogs.length} 条成功`)
    } else {
      console.log(`✅ 批量插入成功! 共插入 ${data.length} 条错误日志`)

      // 显示插入的数据统计
      const severityStats = {}
      data.forEach((error) => {
        severityStats[error.severity] = (severityStats[error.severity] || 0) + 1
      })

      console.log('\n📈 严重程度分布:')
      Object.entries(severityStats).forEach(([severity, count]) => {
        console.log(`  ${severity}: ${count} 条`)
      })

      console.log('\n📋 部分错误日志预览:')
      data.slice(0, 5).forEach((error, index) => {
        console.log(
          `  ${index + 1}. ${error.error_type} - 严重程度: ${
            error.severity
          } - 页面: ${error.page}`
        )
      })
    }

    // 验证数据
    console.log('\n🔍 验证插入的数据...')
    const { data: allErrors, error: queryError } = await supabase
      .from('ErrorLog')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10)

    if (queryError) {
      console.log('❌ 查询验证失败:', queryError.message)
    } else {
      console.log(`✅ 数据库中共有 ${allErrors.length} 条最新错误日志`)

      if (allErrors.length > 0) {
        console.log('\n📋 最新错误日志:')
        allErrors.forEach((error, index) => {
          console.log(
            `  ${index + 1}. ${error.error_type} - ${error.severity} - ${
              error.page
            }`
          )
        })
      }
    }
  } catch (error) {
    console.log('❌ 操作失败:', error.message)
  }

  console.log('\n🎉 错误日志数据生成完成!')
  console.log('💡 现在可以访问 Dashboard 查看:')
  console.log('   ✨ 丰富的错误日志数据（中文严重程度）')
  console.log('   🔍 点击展开查看详情功能')
  console.log('   🔎 搜索和过滤功能')
  console.log('   📊 排序功能')
  console.log('   🌡️ 热力图视图切换')
}

generateErrorData().catch(console.error)
