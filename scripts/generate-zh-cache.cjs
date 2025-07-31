const fs = require('fs')
const path = require('path')

const namespaces = ['common', 'navbar', 'resume', 'dashboard', 'setting']

async function generateZhCache() {
  const cache = {}

  for (const ns of namespaces) {
    try {
      const zhPath = path.join(process.cwd(), 'messages', 'zh', `${ns}.json`)
      const zhContent = fs.readFileSync(zhPath, 'utf-8')
      const zhTranslations = JSON.parse(zhContent)

      // 遍历所有中文翻译
      Object.entries(zhTranslations).forEach(([key, value]) => {
        // 只处理字符串类型的值
        if (typeof value === 'string') {
          cache[value] = { namespace: ns, key }
        }
      })
    } catch (error) {
      console.warn(`Failed to process namespace "${ns}"`, error)
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
  console.log(`✅ 中文映射缓存已生成到 ${outputPath}`)
}

generateZhCache()
