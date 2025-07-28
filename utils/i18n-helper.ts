import { defaultNS, namespaces } from '@/i18n/config'
import type { Namespace } from '@/types/i18'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 开发环境下的翻译查找助手
export const findTranslationKey = async (
  chineseText: string
): Promise<{ namespace: Namespace; key: string }[]> => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('findTranslationKey should only be used in development')
    return []
  }

  const results: { namespace: Namespace; key: string }[] = []

  // 动态导入所有中文翻译文件
  for (const ns of namespaces) {
    try {
      const filePath = path.resolve(__dirname, `../messages/zh/${ns}.json`)
      const content = await fs.readFile(filePath, 'utf-8')
      const translations = JSON.parse(content)

      // 搜索匹配的翻译
      Object.entries(translations).forEach(([key, value]) => {
        if (value === chineseText) {
          results.push({ namespace: ns as Namespace, key })
        }
      })
    } catch (error) {
      console.warn(`Failed to load translations for namespace "${ns}"`, error)
    }
  }

  return results
}

// 在组件中添加中文注释的辅助函数
export const withChineseComment = async (
  key: string,
  namespace: Namespace = defaultNS
): Promise<string> => {
  if (process.env.NODE_ENV !== 'development') return key

  try {
    const filePath = path.resolve(__dirname, `../messages/zh/${namespace}.json`)
    const content = await fs.readFile(filePath, 'utf-8')
    const translations = JSON.parse(content)
    const chinese = translations[key] || key
    return `${key} (${chinese})`
  } catch {
    return key
  }
}

// VSCode 智能提示辅助类型
export type TranslationKeys<NS extends Namespace> = string

// 用于生成翻译键值对文档的函数
export const generateI18nDocs = async () => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('generateI18nDocs should only be used in development')
    return
  }

  const docs: Record<
    Namespace,
    Record<string, { en: string; zh: string }>
  > = {} as any

  for (const ns of namespaces) {
    docs[ns] = {}
    try {
      const zhPath = path.resolve(__dirname, `../messages/zh/${ns}.json`)
      const enPath = path.resolve(__dirname, `../messages/en/${ns}.json`)

      const [zhContent, enContent] = await Promise.all([
        fs.readFile(zhPath, 'utf-8'),
        fs.readFile(enPath, 'utf-8'),
      ])

      const zhTranslations = JSON.parse(zhContent)
      const enTranslations = JSON.parse(enContent)

      Object.keys(zhTranslations).forEach((key) => {
        docs[ns][key] = {
          zh: zhTranslations[key],
          en: enTranslations[key] || '⚠️ Missing translation',
        }
      })
    } catch (error) {
      console.warn(`Failed to generate docs for namespace "${ns}"`, error)
    }
  }

  // 生成 Markdown 文档
  let markdown = '# i18n Translation Keys\n\n'

  Object.entries(docs).forEach(([ns, translations]) => {
    markdown += `## ${ns}\n\n`
    markdown += '| Key | 中文 | English |\n'
    markdown += '|-----|------|---------|'

    Object.entries(translations).forEach(([key, { zh, en }]) => {
      markdown += `\n| \`${key}\` | ${zh} | ${en} |`
    })

    markdown += '\n\n'
  })

  return markdown
}
