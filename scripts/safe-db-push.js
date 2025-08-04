#!/usr/bin/env node

import { execSync } from 'child_process'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log('🚨 数据库操作安全检查')
console.log('========================')

// 检查是否有 --force-reset 参数
const args = process.argv.slice(2)
const hasForceReset = args.includes('--force-reset')
console.log('args===========================', args)
if (hasForceReset) {
  console.log('❌ 检测到 --force-reset 参数')
  console.log('⚠️  此操作将删除所有数据！')
  console.log('')

  rl.question('请输入 "DELETE ALL DATA" 来确认删除所有数据: ', (answer) => {
    if (answer === 'DELETE ALL DATA') {
      console.log('🔄 执行数据库重置...')
      try {
        execSync('npx prisma db push --force-reset', { stdio: 'inherit' })
        console.log('✅ 数据库重置完成')
      } catch (error) {
        console.error('❌ 数据库重置失败:', error.message)
      }
    } else {
      console.log('❌ 操作已取消')
    }
    rl.close()
  })
} else {
  console.log('✅ 执行安全的数据库推送...')
  try {
    execSync('npx prisma db push', { stdio: 'inherit' })
    console.log('✅ 数据库推送完成')
  } catch (error) {
    console.error('❌ 数据库推送失败:', error.message)
  }
  rl.close()
}
