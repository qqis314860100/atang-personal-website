import { useTranslations } from 'next-intl'
import { Namespace } from '@/types/i18'
import { namespaces } from '@/i18n/config'

// 开发环境才导入缓存
const zhToEnCache =
  process.env.NODE_ENV === 'development'
    ? require('./zh-cache').zhToEnCache
    : {}

/**
 * 使用中文 key 的翻译函数
 * @example
 * const t = useZhTranslations()
 *
 * // 直接使用中文，构建时会自动转换为英文 key
 * t('用户列表')  // => userList
 * t('编辑')    // => edit
 */
export function useZhTranslations() {
  const tMap = namespaces.reduce((acc, ns) => {
    acc[ns] = useTranslations(ns)
    return acc
  }, {} as Record<Namespace, ReturnType<typeof useTranslations>>)

  return function t(zhKey: string) {
    const mapping = zhToEnCache[zhKey]
    if (!mapping) {
      console.warn(`[i18n] 未找到中文key "${zhKey}" 的映射`)
      return zhKey
    }

    return tMap[mapping.namespace as Namespace](mapping.key)
  }
}

// 类型定义
type ZhTranslations = {
  (zhKey: string): string // 仅开发环境支持
  (enKey: string, namespace: Namespace): string // 推荐用法
}

// 使用示例：
/*
import { useZhTranslations } from '@/utils/i18n-zh'

export default function MyComponent() {
  const t = useZhTranslations()
  
  if (process.env.NODE_ENV === 'development') {
    return (
      <div>
        <h1>{t('附件管理')}</h1>
        <button>{t('编辑')}</button>
      </div>
    )
  }

  return (
    <div>
      <h1>{t('attachmentManagement', 'resume')}</h1>
      <button>{t('edit', 'resume')}</button>
    </div>
  )
}
*/
