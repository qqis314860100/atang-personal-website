// 数据库连接测试脚本
const { createClient } = require('@supabase/supabase-js')

// 从环境变量获取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase配置')
  console.log('请确保设置了以下环境变量:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- NEXT_PUBLIC_SUPABASE_SERVICE_ROLE')
  process.exit(1)
}

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseConnection() {
  console.log('🔌 测试数据库连接...')

  try {
    // 测试连接
    const { data, error } = await supabase
      .from('page_views')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ 数据库连接失败:', error.message)
      return false
    }

    console.log('✅ 数据库连接成功')
    return true
  } catch (error) {
    console.error('❌ 连接测试失败:', error.message)
    return false
  }
}

async function testTables() {
  console.log('\n📊 测试数据表...')

  const tables = [
    'page_views',
    'user_events',
    'user_sessions',
    'performance_metrics',
    'error_logs',
  ]

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1)

      if (error) {
        console.log(`❌ 表 ${table} 不存在或无法访问:`, error.message)
      } else {
        console.log(`✅ 表 ${table} 正常`)
      }
    } catch (error) {
      console.log(`❌ 表 ${table} 测试失败:`, error.message)
    }
  }
}

async function insertTestData() {
  console.log('\n📝 插入测试数据...')

  try {
    // 插入页面浏览记录
    const { data: pageViewData, error: pageViewError } = await supabase
      .from('page_views')
      .insert({
        page: '/test',
        session_id: 'test-session-' + Date.now(),
        user_agent: 'Test User Agent',
        ip_address: '127.0.0.1',
        device_type: 'desktop',
        browser: 'Test Browser',
        os: 'Test OS',
        language: 'zh-CN',
      })
      .select()

    if (pageViewError) {
      console.error('❌ 插入页面浏览记录失败:', pageViewError.message)
    } else {
      console.log('✅ 页面浏览记录插入成功')
    }

    // 插入用户事件
    const { data: eventData, error: eventError } = await supabase
      .from('user_events')
      .insert({
        event_type: 'click',
        event_name: '测试点击',
        page: '/test',
        session_id: 'test-session-' + Date.now(),
        properties: { test: true },
      })
      .select()

    if (eventError) {
      console.error('❌ 插入用户事件失败:', eventError.message)
    } else {
      console.log('✅ 用户事件插入成功')
    }
  } catch (error) {
    console.error('❌ 插入测试数据失败:', error.message)
  }
}

async function queryTestData() {
  console.log('\n🔍 查询测试数据...')

  try {
    // 查询页面浏览统计
    const { data: pageViews, error: pageViewsError } = await supabase
      .from('page_views')
      .select('*')
      .limit(5)

    if (pageViewsError) {
      console.error('❌ 查询页面浏览失败:', pageViewsError.message)
    } else {
      console.log(`✅ 查询到 ${pageViews.length} 条页面浏览记录`)
    }

    // 查询用户事件统计
    const { data: events, error: eventsError } = await supabase
      .from('user_events')
      .select('*')
      .limit(5)

    if (eventsError) {
      console.error('❌ 查询用户事件失败:', eventsError.message)
    } else {
      console.log(`✅ 查询到 ${events.length} 条用户事件记录`)
    }
  } catch (error) {
    console.error('❌ 查询测试数据失败:', error.message)
  }
}

async function main() {
  console.log('🚀 开始数据库测试...\n')

  // 测试连接
  const connected = await testDatabaseConnection()
  if (!connected) {
    console.log('\n❌ 数据库连接失败，请检查配置')
    process.exit(1)
  }

  // 测试表
  await testTables()

  // 插入测试数据
  await insertTestData()

  // 查询测试数据
  await queryTestData()

  console.log('\n✅ 数据库测试完成')
}

// 运行测试
main().catch(console.error)
