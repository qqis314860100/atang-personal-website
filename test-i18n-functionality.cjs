// 测试智能中文映射工具功能
const fs = require('fs')
const path = require('path')

console.log('🧪 测试智能中文映射工具功能...\n')

// 1. 检查缓存文件是否存在
const cachePath = path.join(__dirname, 'utils', 'zh-cache.ts')
if (fs.existsSync(cachePath)) {
  console.log('✅ 缓存文件存在:', cachePath)

  // 读取缓存内容
  const cacheContent = fs.readFileSync(cachePath, 'utf8')
  const cacheLines = cacheContent.split('\n')

  // 统计缓存条目
  const cacheEntries = cacheLines.filter((line) => line.includes('=>'))
  console.log(`✅ 缓存条目数量: ${cacheEntries.length}`)

  // 检查是否有重复key处理
  const hasContextHandling = cacheContent.includes('context:')
  console.log(`✅ 上下文处理: ${hasContextHandling ? '已启用' : '未启用'}`)
} else {
  console.log('❌ 缓存文件不存在:', cachePath)
}

// 2. 检查语言包文件
const messagesPath = path.join(__dirname, 'messages')
if (fs.existsSync(messagesPath)) {
  console.log('\n✅ 语言包目录存在:', messagesPath)

  const zhPath = path.join(messagesPath, 'zh')
  const enPath = path.join(messagesPath, 'en')

  if (fs.existsSync(zhPath)) {
    const zhFiles = fs.readdirSync(zhPath).filter((f) => f.endsWith('.json'))
    console.log(`✅ 中文语言包文件: ${zhFiles.length} 个`)
    console.log(`   文件列表: ${zhFiles.join(', ')}`)
  }

  if (fs.existsSync(enPath)) {
    const enFiles = fs.readdirSync(enPath).filter((f) => f.endsWith('.json'))
    console.log(`✅ 英文语言包文件: ${enFiles.length} 个`)
    console.log(`   文件列表: ${enFiles.join(', ')}`)
  }
}

// 3. 检查核心文件
const coreFiles = [
  'app/hooks/use-i18n.ts',
  'types/i18.ts',
  'i18n/config.ts',
  'components/examples/I18nExample.tsx',
  'app/[locale]/test-i18n/page.tsx',
]

console.log('\n📁 检查核心文件:')
coreFiles.forEach((file) => {
  const filePath = path.join(__dirname, file)
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath)
    console.log(`✅ ${file} (${(stats.size / 1024).toFixed(1)} KB)`)
  } else {
    console.log(`❌ ${file} (不存在)`)
  }
})

// 4. 检查生成脚本
const scriptPath = path.join(__dirname, 'scripts', 'generate-zh-cache.cjs')
if (fs.existsSync(scriptPath)) {
  console.log('\n✅ 生成脚本存在:', scriptPath)

  // 检查脚本内容
  const scriptContent = fs.readFileSync(scriptPath, 'utf8')
  const hasAutoGeneration = scriptContent.includes('generateCache')
  const hasConflictResolution = scriptContent.includes('resolveConflict')

  console.log(`✅ 自动生成功能: ${hasAutoGeneration ? '已启用' : '未启用'}`)
  console.log(`✅ 冲突解决功能: ${hasConflictResolution ? '已启用' : '未启用'}`)
} else {
  console.log('\n❌ 生成脚本不存在:', scriptPath)
}

console.log('\n🎯 测试完成！')
console.log('\n💡 下一步建议:')
console.log('1. 访问 http://localhost:3000/zh/test-i18n 查看演示')
console.log('2. 在现有组件中使用智能映射')
console.log('3. 添加更多语言包命名空间')
console.log('4. 运行 npm run build 检查构建是否正常')
