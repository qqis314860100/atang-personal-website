import { getRequestConfig, RequestConfig } from 'next-intl/server'
import { routing } from './routing'
import { hasLocale } from 'next-intl'
import { namespaces } from './config'

const getRequest = async ({ requestLocale }: any) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  // 使用 Promise.all 并行加载所有语言包
  const messages = await Promise.all(
    namespaces.map(async (ns) => {
      try {
        const module = await import(`@/messages/${locale}/${ns}.json`)
        return [ns, module.default]
      } catch (error) {
        console.warn(
          `Failed to load translation for namespace "${ns}" and locale "${locale}"`,
          error
        )
        return [ns, {}]
      }
    })
  ).then(Object.fromEntries)

  return {
    locale,
    messages,
  } as RequestConfig
}

export default getRequestConfig(getRequest)
