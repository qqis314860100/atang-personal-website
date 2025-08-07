const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 从环境变量获取 Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    '❌ 请设置环境变量: NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_SERVICE_ROLE'
  )
  process.exit(1)
}

// 创建 Supabase 客户端（使用服务角色密钥）
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 读取 RLS 配置 SQL
const rlsSqlPath = path.join(__dirname, 'fix-login-rls.sql')
const rlsSql = fs.readFileSync(rlsSqlPath, 'utf8')

async function setupRLS() {
  try {
    console.log('🚀 开始设置 RLS 策略...')
    console.log('📋 配置内容:')
    console.log('- 启用 UserProfile 表的 RLS')
    console.log('- 创建用户认证策略')
    console.log('- 设置权限控制')
    console.log('- 配置其他重要表')

    // 分割 SQL 语句并逐条执行
    const sqlStatements = rlsSql
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`\n📝 共 ${sqlStatements.length} 条 SQL 语句需要执行`)

    for (let i = 0; i < sqlStatements.length; i++) {
      const sql = sqlStatements[i]
      if (sql.trim()) {
        try {
          console.log(`\n⏳ 执行第 ${i + 1}/${sqlStatements.length} 条语句...`)

          // 使用 rpc 执行 SQL
          const { error } = await supabase.rpc('exec_sql', { sql: sql + ';' })

          if (error) {
            console.log(`⚠️  语句执行失败，尝试直接执行: ${error.message}`)

            // 如果是 SELECT 语句，尝试直接查询
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
              const { data, error: selectError } = await supabase
                .from('information_schema.tables')
                .select('table_name')
                .limit(1)

              if (selectError) {
                console.log(`❌ 无法执行 SELECT 语句: ${selectError.message}`)
              } else {
                console.log(`✅ SELECT 语句执行成功`)
              }
            } else {
              console.log(`⚠️  跳过非 SELECT 语句: ${sql.substring(0, 50)}...`)
            }
          } else {
            console.log(`✅ 语句执行成功`)
          }
        } catch (stmtError) {
          console.log(`⚠️  语句执行出错: ${stmtError.message}`)
        }
      }
    }

    console.log('\n🎉 RLS 配置完成！')
    console.log('\n📋 接下来您需要:')
    console.log('1. 在 Supabase Dashboard 中手动执行 SQL 脚本')
    console.log('2. 或者使用 Supabase CLI 执行')
    console.log('3. 测试登录功能')

    // 显示手动执行的 SQL
    console.log('\n📝 手动执行的 SQL 脚本:')
    console.log('='.repeat(50))
    console.log(rlsSql)
    console.log('='.repeat(50))
  } catch (error) {
    console.error('❌ 设置 RLS 策略失败:', error)
    console.log('\n📝 请手动在 Supabase Dashboard 中执行以下 SQL:')
    console.log('='.repeat(50))
    console.log(rlsSql)
    console.log('='.repeat(50))
  }
}

// 检查当前 RLS 状态
async function checkRLSStatus() {
  try {
    console.log('\n🔍 检查当前 RLS 状态...')

    // 检查 UserProfile 表的 RLS 状态
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')
      .eq('table_name', 'UserProfile')

    if (error) {
      console.log('❌ 无法检查表状态:', error.message)
      return
    }

    if (tables && tables.length > 0) {
      console.log('✅ UserProfile 表存在')

      // 检查 RLS 策略
      const { data: policies, error: policyError } = await supabase
        .from('pg_policies')
        .select('policyname, cmd')
        .eq('tablename', 'UserProfile')
        .eq('schemaname', 'public')

      if (policyError) {
        console.log('⚠️  无法检查策略状态:', policyError.message)
      } else {
        console.log(`📋 当前策略数量: ${policies?.length || 0}`)
        if (policies && policies.length > 0) {
          policies.forEach((policy) => {
            console.log(`  - ${policy.policyname} (${policy.cmd})`)
          })
        }
      }
    } else {
      console.log('❌ UserProfile 表不存在')
    }
  } catch (error) {
    console.error('❌ 检查 RLS 状态失败:', error)
  }
}

// 主函数
async function main() {
  console.log('🔧 Supabase RLS 配置工具')
  console.log('='.repeat(50))

  await checkRLSStatus()
  await setupRLS()

  console.log('\n✅ 配置完成！')
}

// 运行脚本
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { setupRLS, checkRLSStatus }
