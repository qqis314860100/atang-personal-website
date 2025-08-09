// 生成页面浏览数据
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
    '/en/profile',
  ]

  const devices = ['Desktop', 'Mobile', 'Tablet']
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge']
  const operatingSystems = ['Windows', 'macOS', 'Linux', 'iOS', 'Android']

  // 生成50条页面浏览记录
  const pageViews = []
  for (let i = 0; i < 50; i++) {
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
      startTime.getTime() + Math.floor(Math.random() * 300000) + 30000
    ) // 30秒到5分钟
    const duration = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    ) // 秒数

    const pageView = {
      id: `page_${Date.now()}_${i}`,
      page: page,
      user_id: `user_${Math.floor(Math.random() * 1000) + 1}`,
      session_id: `session_${Math.floor(Math.random() * 10000) + 1}`,
      user_agent: `Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) ${browser}/120.0.0.0`,
      ip_address: `192.168.1.${Math.floor(Math.random() * 255) + 1}`,
      referrer:
        Math.random() > 0.5 ? `https://google.com/search?q=example` : null,
      device_type: device,
      browser: browser,
      operating_system: os,
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

    const { data, error } = await supabase
      .from('PageView')
      .insert(pageViews)
      .select()

    if (error) {
      console.log('❌ 批量插入失败:', error.message)

      // 尝试逐个插入
      console.log('🔄 尝试逐个插入...')
      let successCount = 0
      for (const pageView of pageViews) {
        try {
          const { error: singleError } = await supabase
            .from('PageView')
            .insert(pageView)

          if (singleError) {
            console.log(
              `❌ 插入失败: ${pageView.page} - ${singleError.message}`
            )
          } else {
            successCount++
            console.log(
              `✅ 成功插入: ${pageView.page} - 用户: ${pageView.user_id} - 时长: ${pageView.duration}秒`
            )
          }
        } catch (err) {
          console.log(`❌ 插入异常: ${pageView.page} - ${err.message}`)
        }

        // 小延迟
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      console.log(`\n📈 插入统计: ${successCount}/${pageViews.length} 条成功`)
    } else {
      console.log(`✅ 批量插入成功! 共插入 ${data.length} 条页面浏览记录`)

      // 显示插入的数据统计
      const pageStats = {}
      data.forEach((view) => {
        pageStats[view.page] = (pageStats[view.page] || 0) + 1
      })

      console.log('\n📈 页面访问分布:')
      Object.entries(pageStats).forEach(([page, count]) => {
        console.log(`  ${page}: ${count} 次`)
      })

      console.log('\n📋 部分页面浏览记录预览:')
      data.slice(0, 5).forEach((view, index) => {
        console.log(
          `  ${index + 1}. ${view.page} - 设备: ${view.device_type} - 时长: ${
            view.duration
          }秒`
        )
      })
    }

    // 验证数据
    console.log('\n🔍 验证插入的数据...')
    const { data: allViews, error: queryError } = await supabase
      .from('PageView')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10)

    if (queryError) {
      console.log('❌ 查询验证失败:', queryError.message)
    } else {
      console.log(`✅ 数据库中共有 ${allViews.length} 条最新页面浏览记录`)

      if (allViews.length > 0) {
        console.log('\n📋 最新页面浏览记录:')
        allViews.forEach((view, index) => {
          console.log(
            `  ${index + 1}. ${view.page} - ${view.device_type} - ${
              view.duration
            }秒`
          )
        })
      }
    }
  } catch (error) {
    console.log('❌ 操作失败:', error.message)
  }

  console.log('\n🎉 页面浏览数据生成完成!')
  console.log('💡 现在可以访问 Dashboard 查看:')
  console.log('   📊 热门页面热力图数据')
  console.log('   📱 设备分布数据')
  console.log('   ⏱️ 页面停留时间数据')
}

generatePageViews().catch(console.error)
