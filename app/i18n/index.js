import { createInstance } from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next/initReactI18next'
import siteMetadata from '@/data/siteMetadata'

const { fallbackLanguage, languages } = siteMetadata

/**
 * @param {string} [lng]
 * @param {string | string[]} [ns]
 * @returns {Promise<import('i18next').i18n>}
 */
const initI18next = async (lng = fallbackLanguage, ns = 'basic') => {
  const i18nInstance = createInstance()
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend((language, namespace) =>
        import(`./locales/${language}/${namespace}.json`)
      )
    )
    .init({
      // debug: true,
      supportedLngs: languages,
      fallbackLng: fallbackLanguage,
      lng,
      fallbackNS: 'basic',
      defaultNS: 'basic',
      ns,
    })
  return i18nInstance
}

/**
 * @param {string} lng
 * @param {string | string[]} [ns]
 * @param {{keyPrefix?: string}} [options]
 * @returns {Promise<{t: import('i18next').TFunction, i18n: import('i18next').i18n}>}
 */
export async function useTranslation(lng, ns = 'basic', options = {}) {
  const i18nextInstance = await initI18next(lng, ns)
  return {
    t: i18nextInstance.getFixedT(
      lng,
      Array.isArray(ns) ? ns[0] : ns,
      options.keyPrefix
    ),
    i18n: i18nextInstance,
  }
}
