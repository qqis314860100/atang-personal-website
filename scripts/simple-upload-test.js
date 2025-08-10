// 简单的上传测试
console.log('🧪 开始简单上传测试...')

// 检查环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('环境变量:')
console.log('URL:', supabaseUrl ? '已设置' : '未设置')
console.log('KEY:', supabaseKey ? '已设置' : '未设置')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少环境变量')
  process.exit(1)
}

console.log('✅ 环境变量检查通过')

// 模拟文件上传
const mockFile = {
  name: 'test.mp4',
  size: 1024 * 1024, // 1MB
  type: 'video/mp4',
}

console.log('📁 模拟文件:', mockFile)

// 模拟上传过程
console.log('📤 开始模拟上传...')
setTimeout(() => {
  console.log('✅ 模拟上传完成')
  console.log('🎉 测试完成')
}, 2000)
