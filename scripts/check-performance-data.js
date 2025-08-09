// 检查性能数据脚本
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// 从环境变量获取 Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少 Supabase 环境变量')
  console.log('请设置:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkPerformanceData() {
  console.log('🔍 检查性能数据...')

  try {
    // 1. 检查表是否存在
    console.log('\n1. 检查表结构...')
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%performance%')

    if (tableError) {
      console.error('❌ 查询表信息失败:', tableError)
      return
    }

    console.log('📋 找到的表:', tables?.map((t) => t.table_name) || [])

    // 2. 检查 PerformanceMetric 表结构
    console.log('\n2. 检查 PerformanceMetric 表结构...')
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'PerformanceMetric')
      .order('ordinal_position')

    if (columnError) {
      console.error('❌ 查询列信息失败:', columnError)
      return
    }

    console.log('📊 表结构:')
    columns?.forEach((col) => {
      console.log(
        `  - ${col.column_name}: ${col.data_type} (${
          col.is_nullable === 'YES' ? 'nullable' : 'not null'
        })`
      )
    })

    // 3. 检查数据量
    console.log('\n3. 检查数据量...')
    const { count, error: countError } = await supabase
      .from('PerformanceMetric')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ 查询数据量失败:', countError)
      return
    }

    console.log(`📈 当前数据量: ${count} 条记录`)

    // 4. 如果没有数据，插入测试数据
    if (count === 0) {
      console.log('\n4. 插入测试数据...')
      const testData = [
        {
          id: crypto.randomUUID(),
          page: '/dashboard',
          session_id: 'test-session-1',
          user_id: null,
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1小时前
          load_time: 1200,
          dom_content_loaded: 800,
          first_contentful_paint: 1100,
          largest_contentful_paint: 1800,
          cumulative_layout_shift: 0.05,
          first_input_delay: 150,
          time_to_first_byte: 600,
        },
        {
          id: crypto.randomUUID(),
          page: '/blog',
          session_id: 'test-session-1',
          user_id: null,
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30分钟前
          load_time: 2100,
          dom_content_loaded: 1500,
          first_contentful_paint: 1800,
          largest_contentful_paint: 2500,
          cumulative_layout_shift: 0.12,
          first_input_delay: 200,
          time_to_first_byte: 800,
        },
        {
          id: crypto.randomUUID(),
          page: '/dashboard',
          session_id: 'test-session-2',
          user_id: null,
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15分钟前
          load_time: 900,
          dom_content_loaded: 600,
          first_contentful_paint: 800,
          largest_contentful_paint: 1200,
          cumulative_layout_shift: 0.03,
          first_input_delay: 100,
          time_to_first_byte: 400,
        },
      ]

      const { data: insertResult, error: insertError } = await supabase
        .from('PerformanceMetric')
        .insert(testData)
        .select()

      if (insertError) {
        console.error('❌ 插入测试数据失败:', insertError)
        return
      }

      console.log('✅ 成功插入测试数据:', insertResult?.length, '条记录')
    }

    // 5. 验证数据
    console.log('\n5. 验证数据...')
    const { data: recentData, error: recentError } = await supabase
      .from('PerformanceMetric')
      .select(
        'page, first_contentful_paint, largest_contentful_paint, cumulative_layout_shift, first_input_delay, time_to_first_byte, timestamp'
      )
      .order('timestamp', { ascending: false })
      .limit(5)

    if (recentError) {
      console.error('❌ 查询最近数据失败:', recentError)
      return
    }

    console.log('📊 最近的数据:')
    recentData?.forEach((row, index) => {
      console.log(
        `  ${index + 1}. ${row.page}: FCP=${row.first_contentful_paint}, LCP=${
          row.largest_contentful_paint
        }, CLS=${row.cumulative_layout_shift}`
      )
    })

    console.log('\n✅ 检查完成！')
  } catch (error) {
    console.error('❌ 检查过程中出错:', error)
  }
}

// 运行检查
checkPerformanceData()
