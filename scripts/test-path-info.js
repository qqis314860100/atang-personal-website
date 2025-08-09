// 测试路径信息功能
const { parsePagePath } = require('../lib/analytics/page-mapping')

console.log('🧪 测试路径信息功能...')

// 测试用例
const testPaths = [
  '/',
  '/zh',
  '/en',
  '/dashboard',
  '/zh/dashboard',
  '/en/dashboard',
  '/blog',
  '/zh/blog',
  '/en/blog',
  '/zh/blog/123',
  '/en/blog/456',
  '/analytics',
  '/zh/analytics',
  '/en/analytics',
  '/profile',
  '/zh/profile',
  '/en/profile',
  '/settings',
  '/zh/settings',
  '/en/settings',
  '/about',
  '/zh/about',
  '/en/about',
  '/contact',
  '/zh/contact',
  '/en/contact',
  '/zh/blog/123?utm_source=google',
  '/en/blog/456?ref=social&campaign=summer',
  '/unknown-page',
  '/zh/unknown-page',
  '/en/unknown-page',
]

console.log('\n📋 路径信息分析测试结果:')
console.log('='.repeat(100))

testPaths.forEach((path) => {
  const result = parsePagePath(path)
  console.log(`\n路径: ${path}`)
  console.log(`  映射名称: ${result.name}`)
  console.log(`  分类: ${result.category}`)
  console.log(`  原始路径: ${result.originalPath}`)
  console.log(`  路径分析:`)
  console.log(`    段数: ${result.pathAnalysis.segments.length}`)
  console.log(`    深度: ${result.pathAnalysis.depth}`)
  console.log(`    语言: ${result.pathAnalysis.locale}`)
  console.log(`    分类: ${result.pathAnalysis.category}`)
  console.log(`    子路径: [${result.pathAnalysis.subPaths.join(', ')}]`)
  console.log(`    查询参数: ${result.pathAnalysis.queryParams.length} 个`)
  console.log(`    是否动态: ${result.pathAnalysis.isDynamic}`)
  console.log(`    有查询参数: ${result.pathAnalysis.hasQueryParams}`)
})

console.log('\n✅ 路径信息测试完成！')
