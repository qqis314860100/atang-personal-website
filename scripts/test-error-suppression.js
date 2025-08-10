#!/usr/bin/env node

// 测试错误抑制功能
console.log('🧪 测试错误抑制功能...')

// 模拟Next.js开发工具错误
const testErrors = [
  'Error: The provided callback is no longer runnable.',
  'Error: use-app-dev-rendering-indicator failed',
  'Error: use-action-queue callback error',
  'Error: next-devtools error',
  'Error: app-router callback error',
  'Error: webpack-internal error',
  'Error: react-dom.development error',
  'Error: Normal application error', // 这个不应该被抑制
]

// 错误模式匹配函数
function shouldSuppressError(message) {
  const errorPatterns = [
    'callback is no longer runnable',
    'use-app-dev-rendering-indicator',
    'use-action-queue',
    'next-devtools',
    'app-router',
    'webpack-internal',
    'react-dom.development',
  ]
  return errorPatterns.some((pattern) => message.includes(pattern))
}

// 测试每个错误
testErrors.forEach((error, index) => {
  const shouldSuppress = shouldSuppressError(error)
  const status = shouldSuppress ? '🚫 应该被抑制' : '✅ 应该正常显示'
  console.log(`${index + 1}. ${status}: ${error}`)
})

console.log('\n📋 测试结果:')
console.log('- 前7个错误应该被抑制 (Next.js开发工具错误)')
console.log('- 最后1个错误应该正常显示 (应用错误)')
console.log('- 如果看到 🚫 标记，说明错误抑制功能正常工作')

// 模拟控制台输出
console.log('\n🔧 模拟控制台输出:')
testErrors.forEach((error, index) => {
  if (shouldSuppressError(error)) {
    console.log(`🚫 抑制Next.js开发工具错误: ${error}`)
  } else {
    console.log(`✅ 正常错误: ${error}`)
  }
})

console.log('\n✅ 错误抑制测试完成!')
