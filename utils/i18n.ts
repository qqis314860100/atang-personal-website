import { namespaces } from '@/i18n/config'
import { Namespace, Translations } from '@/types/i18'
import { useTranslations } from 'next-intl'
import { zhToEnCache } from './zh-cache'

export function useI18n() {
  // if (process.env.NODE_ENV === 'development') {
  const result = namespaces.reduce((acc, ns) => {
    const trans = useTranslations(ns)
    acc[ns] = (zhKey: string) => {
      const mapping = zhToEnCache[zhKey]
      if (!mapping) {
        console.warn(`[i18n] 未找到中文key "${zhKey}" 的映射`)
        return zhKey
      }
      return trans(mapping.key)
    }
    return acc
  }, {} as Translations)

  return result
  // } else {
  //   const trans = useTranslations(defaultNamespace)
  //   return function t(key: string, namespace?: Namespace) {
  //     if (namespace && namespace !== defaultNamespace) {
  //       return useTranslations(namespace)(key)
  //     }
  //     return trans(key)
  //   }
  // }
}
