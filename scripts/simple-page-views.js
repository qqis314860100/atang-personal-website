// 生成简化的页面浏览数据
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wqjytqpfpijiqmhjdmhg.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxanl0cXBmcGlqaXFtaGpkbWhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM4NjgxOSwiZXhwIjoyMDY2OTYyODE5fQ.5kuX1zOx9B_rOX3BlEYtOuRniUVETiNxF0uwyd3C8pY'

const supabase = createClient(supabaseUrl, supabaseKey)

const generatePageViews = async () => {
  console.log('🧪 生成页面浏览数据...')

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
    '/en/contact',
  ]

  const devices = ['Desktop', 'Mobile', 'Tablet']
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge']
  const operatingSystems = ['Windows', 'macOS', 'Linux', 'iOS', 'Android']

  // 生成30条页面浏览记录
  const pageViews = []
  for (let i = 0; i < 30; i++) {
    const page = pages[Math.floor(Math.random() * pages.length)]
    const device = devices[Math.floor(Math.random() * devices.length)]
    const browser = browsers[Math.floor(Math.random() * browsers.length)]
    const os =
      operatingSystems[Math.floor(Math.random() * operatingSystems.length)]

    // 生成过去7天内的随机时间
    const randomTime = new Date(
      Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
    )
    const startTime = randomTime
    const endTime = new Date(
      startTime.getTime() + Math.floor(Math.random() * 300000) + 10000
    ) // 10秒到5分钟
    const duration = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    ) // 秒数

    const pageView = {
      id: `page_${Date.now()}_${i}`,
      page: page,
      user_id: `user_${Math.floor(Math.random() * 500) + 1}`,
      session_id: `session_${Math.floor(Math.random() * 5000) + 1}`,
      user_agent: `Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) ${browser}/120.0.0.0`,
      ip_address: `192.168.1.${Math.floor(Math.random() * 255) + 1}`,
      referrer: Math.random() > 0.7 ? `https://google.com/search` : null,
      device_type: device,
      browser: browser,
      os: os, // 使用正确的字段名
      screen_resolution: '1920x1080',
      timestamp: startTime.toISOString(),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration: duration,
    }

    pageViews.push(pageView)
  }

  try {
    console.log(`📊 准备插入 ${pageViews.length} 条页面浏览记录...`)

    // 分批插入，每次10条
    const batchSize = 10
    let totalSuccess = 0

    for (let i = 0; i < pageViews.length; i += batchSize) {
      const batch = pageViews.slice(i, i + batchSize)

      try {
        const { data, error } = await supabase
          .from('PageView')
          .insert(batch)
          .select()

        if (error) {
          console.log(
            `❌ 批次 ${Math.floor(i / batchSize) + 1} 插入失败:`,
            error.message
          )
        } else {
          totalSuccess += data.length
          console.log(
            `✅ 批次 ${Math.floor(i / batchSize) + 1} 插入成功: ${
              data.length
            } 条记录`
          )
        }
      } catch (err) {
        console.log(
          `❌ 批次 ${Math.floor(i / batchSize) + 1} 异常:`,
          err.message
        )
      }

      // 小延迟
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    console.log(`\n📈 总计插入成功: ${totalSuccess}/${pageViews.length} 条记录`)

    // 验证数据
    console.log('\n🔍 验证插入的数据...')
    const { data: allViews, error: queryError } = await supabase
      .from('PageView')
      .select('page, device_type, duration, browser, os')
      .order('timestamp', { ascending: false })
      .limit(15)

    if (queryError) {
      console.log('❌ 查询验证失败:', queryError.message)
    } else {
      console.log(`✅ 数据库中共有 ${allViews.length} 条最新页面浏览记录`)

      if (allViews.length > 0) {
        console.log('\n📋 最新页面浏览记录:')
        allViews.forEach((view, index) => {
          console.log(
            `  ${index + 1}. ${view.page} - ${view.device_type} - ${
              view.browser
            } - ${view.duration}秒`
          )
        })

        // 统计页面访问分布
        const pageStats = {}
        allViews.forEach((view) => {
          pageStats[view.page] = (pageStats[view.page] || 0) + 1
        })

        console.log('\n📈 页面访问分布（最新15条）:')
        Object.entries(pageStats).forEach(([page, count]) => {
          console.log(`  ${page}: ${count} 次`)
        })
      }
    }
  } catch (error) {
    console.log('❌ 操作失败:', error.message)
  }

  console.log('\n🎉 页面浏览数据生成完成!')
  console.log('💡 现在可以访问 Dashboard 查看:')
  console.log('   📊 热门页面热力图数据')
  console.log('   📱 设备分布热力图数据')
  console.log('   ⏱️ 页面停留时间统计')
  console.log('   🌍 用户行为分析')
}

generatePageViews().catch(console.error)
