import { namespaces } from '@/i18n/config'
import { Translations } from '@/types/i18'
import { useTranslations } from 'next-intl'
import { zhToEnCache } from '@/utils/zh-cache'

export function useI18n() {
  const result = namespaces.reduce((acc, ns) => {
    const trans = useTranslations(ns)
    acc[ns] = (
      zhKey: string,
      options?: {
        context?: string
        fallback?: string
        params?: Record<string, any>
      }
    ) => {
      const { context, fallback, params } = options || {}

      // 智能查找逻辑
      let mapping = null

      // 1. 优先查找当前命名空间
      if (zhToEnCache[zhKey] && zhToEnCache[zhKey].namespace === ns) {
        mapping = zhToEnCache[zhKey]
      }

      // 2. 查找带上下文的key
      if (!mapping && context) {
        const contextKey = `${context}.${zhKey}`
        if (zhToEnCache[contextKey]) {
          mapping = zhToEnCache[contextKey]
        }
      }

      // 3. 查找任何匹配的key
      if (!mapping) {
        mapping = zhToEnCache[zhKey]
      }

      if (mapping) {
        try {
          // 支持嵌套键和参数
          return trans(mapping.key, params)
        } catch (error) {
          console.warn(
            `[i18n] 翻译键 "${mapping.key}" 在命名空间 "${ns}" 中未找到`
          )
          return fallback || zhKey
        }
      }

      console.warn(`[i18n] 未找到中文key "${zhKey}" 的映射`)
      return fallback || zhKey
    }
    return acc
  }, {} as Translations)

  return result
}
