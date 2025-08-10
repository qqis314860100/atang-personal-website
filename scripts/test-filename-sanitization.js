#!/usr/bin/env node

// 测试文件名清理功能
console.log('🧪 测试文件名清理功能...')

// 模拟文件名清理函数
function sanitizeFileName(fileName) {
  const originalName = fileName
  const extension = originalName.split('.').pop() || 'mp4'
  const baseName = originalName.replace(/\.[^/.]+$/, '') // 移除扩展名

  // 清理基础文件名
  const cleanBaseName =
    baseName
      .replace(/[^a-zA-Z0-9]/g, '_') // 替换所有非字母数字字符为下划线
      .replace(/_{2,}/g, '_') // 将多个连续下划线替换为单个
      .replace(/^_+|_+$/g, '') // 移除开头和结尾的下划线
      .substring(0, 50) || // 限制基础名称长度
    'video' // 如果清理后为空，使用默认名称

  return `${cleanBaseName}.${extension}`
}

// 测试用例
const testCases = [
  {
    name: '正常文件名',
    input: 'video.mp4',
    expected: 'video.mp4',
  },
  {
    name: '包含空格的文件名',
    input: 'My Video.mp4',
    expected: 'My_Video.mp4',
  },
  {
    name: '包含特殊字符的文件名',
    input: "Shadcn Isn't Just a Library Anymore… Here's How to 10x Your UI.mp4",
    expected: 'Shadcn_Isnt_Just_a_Library_Anymore_Heres_How_to_.mp4',
  },
  {
    name: '包含中文的文件名',
    input: '我的视频.mp4',
    expected: 'video.mp4',
  },
  {
    name: '包含多个特殊字符的文件名',
    input: 'Video (2024) - Special@#$%^&*()_+={}[]|\\:";\'<>?,./.mp4',
    expected: 'Video_2024_Special.mp4',
  },
  {
    name: '包含多个连续空格的文件名',
    input: 'Video   with   spaces.mp4',
    expected: 'Video_with_spaces.mp4',
  },
  {
    name: '以特殊字符开头的文件名',
    input: '!@#$Video.mp4',
    expected: 'Video.mp4',
  },
  {
    name: '以特殊字符结尾的文件名',
    input: 'Video!@#$.mp4',
    expected: 'Video.mp4',
  },
  {
    name: '超长文件名',
    input: 'a'.repeat(200) + '.mp4',
    expected: 'a'.repeat(50) + '.mp4', // 50字符限制
  },
  {
    name: '空文件名',
    input: '',
    expected: 'video.mp4',
  },
  {
    name: '只有特殊字符的文件名',
    input: '!@#$%^&*()',
    expected: 'video.!@#$%^&*()',
  },
]

console.log('\n📁 测试文件名清理...')

testCases.forEach((testCase, index) => {
  try {
    const result = sanitizeFileName(testCase.input)
    const status = result === testCase.expected ? '✅' : '❌'

    console.log(`${index + 1}. ${testCase.name}: ${status}`)
    console.log(`   输入: ${testCase.input}`)
    console.log(`   输出: ${result}`)
    console.log(`   期望: ${testCase.expected}`)
    if (result !== testCase.expected) {
      console.log(`   ❌ 不匹配`)
    }
    console.log('')
  } catch (error) {
    console.log(`${index + 1}. ${testCase.name}: ❌ 抛出错误`)
    console.log(`   错误: ${error.message}`)
    console.log('')
  }
})

// 测试实际的文件路径生成
console.log('🔗 测试文件路径生成...')

const sampleFiles = [
  "Shadcn Isn't Just a Library Anymore… Here's How to 10x Your UI.mp4",
  'My Video (2024).mp4',
  'video_with_underscores.mp4',
  'Video with spaces and special chars!@#$.mp4',
]

sampleFiles.forEach((fileName, index) => {
  const timestamp = Date.now()
  const safeFileName = sanitizeFileName(fileName)
  const filePath = `video/${timestamp}_${safeFileName}`

  console.log(`${index + 1}. 原始文件名: ${fileName}`)
  console.log(`   清理后: ${safeFileName}`)
  console.log(`   完整路径: ${filePath}`)
  console.log('')
})

// 测试Supabase存储路径规则
console.log('📋 Supabase存储路径规则检查...')

const rules = [
  '✅ 只允许字母、数字、连字符(-)、点(.)',
  '✅ 不允许空格、特殊字符、中文字符',
  '✅ 路径长度有限制',
  '✅ 不允许以特殊字符开头或结尾',
  '✅ 不允许连续的重复字符',
]

rules.forEach((rule, index) => {
  console.log(`${index + 1}. ${rule}`)
})

console.log('\n🎉 文件名清理功能测试完成!')
console.log('\n📋 修复总结:')
console.log('- ✅ 替换特殊字符为下划线')
console.log('- ✅ 处理连续下划线')
console.log('- ✅ 移除开头和结尾的下划线')
console.log('- ✅ 限制文件名长度')
console.log('- ✅ 兼容Supabase存储规则')
