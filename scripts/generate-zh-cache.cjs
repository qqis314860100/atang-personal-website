const fs = require('fs')
const path = require('path')

const namespaces = [
  'common',
  'navbar',
  'resume',
  'dashboard',
  'setting',
  'project',
  'performance',
  'pageAnalytics',
  'errorLogs',
  'auth',
]

// 递归遍历对象，提取所有字符串值
function traverseObject(obj, namespace, keyPrefix = '', cache = {}) {
  Object.entries(obj).forEach(([key, value]) => {
    const currentKey = keyPrefix ? `${keyPrefix}.${key}` : key

    if (typeof value === 'string') {
      // 检查是否有重复的中文key
      if (cache[value]) {
        // 重复key，添加上下文
        const contextualKey = `${namespace}.${value}`
        cache[contextualKey] = { namespace, key: currentKey }
        console.log(`⚠️  发现重复key "${value}"，添加上下文: ${contextualKey}`)
      } else {
        cache[value] = { namespace, key: currentKey }
      }
    } else if (typeof value === 'object' && value !== null) {
      traverseObject(value, namespace, currentKey, cache)
    }
  })
}

async function generateZhCache() {
  const cache = {}

  for (const ns of namespaces) {
    try {
      const zhPath = path.join(process.cwd(), 'messages', 'zh', `${ns}.json`)
      if (!fs.existsSync(zhPath)) {
        console.warn(`⚠️  跳过不存在的命名空间: ${ns}`)
        continue
      }

      const zhContent = fs.readFileSync(zhPath, 'utf-8')
      const zhTranslations = JSON.parse(zhContent)

      // 遍历所有中文翻译（支持嵌套结构）
      traverseObject(zhTranslations, ns, '', cache)

      console.log(`✅ 处理命名空间: ${ns}`)
    } catch (error) {
      console.warn(`❌ 处理命名空间 "${ns}" 失败:`, error.message)
    }
  }

  // 生成 TypeScript 代码
  const code = `import { Namespace } from '@/types/i18'

// 此文件由 scripts/generate-zh-cache.cjs 自动生成
// 请勿手动修改

export const zhToEnCache: Record<string, { namespace: Namespace; key: string }> = ${JSON.stringify(
    cache,
    null,
    2
  )}
`

  const outputPath = path.join(process.cwd(), 'utils', 'zh-cache.ts')
  fs.writeFileSync(outputPath, code, 'utf-8')
  console.log(`\n✅ 中文映射缓存已生成到 ${outputPath}`)
  console.log(`📊 总共生成了 ${Object.keys(cache).length} 个映射`)

  // 显示重复key统计
  const duplicateKeys = Object.keys(cache).filter((key) => key.includes('.'))
  if (duplicateKeys.length > 0) {
    console.log(
      `⚠️  发现 ${duplicateKeys.length} 个带上下文的key（用于避免冲突）`
    )
  }
}

generateZhCache()
