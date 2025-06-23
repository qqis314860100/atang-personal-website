'use client'

import { useEffect, useState } from 'react'

import i18next from 'i18next'
import {
  initReactI18next,
  useTranslation as useTranslationReact,
} from 'react-i18next'
import { useCookies } from 'react-cookie'
import resourcesToBackend from 'i18next-resources-to-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import siteMetadata from '@/data/siteMetadata'

const { fallbackLanguage: defaultLocale, languages: locales } = siteMetadata
export const cookieName = 'i18next'

const runsOnServerSide = typeof window === 'undefined'

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend((language, namespace) =>
      import(`./locales/${language}/${namespace}.json`)
    )
  )
  .init({
    supportedLngs: locales,
    fallbackLng: defaultLocale,
    lng: defaultLocale,
    fallbackNS: 'basic',
    defaultNS: 'basic',
    ns: 'basic',
    lng: undefined,
    detection: {
      order: ['path', 'htmlTag', 'cookie', 'navigator'],
    },
    preload: runsOnServerSide ? locales : [],
  })

export function useTranslation(lng, ns, options) {
  const [cookies, setCookie] = useCookies([cookieName])
  const ret = useTranslationReact(ns, options)
  const { i18n } = ret
  const [activeLng, setActiveLng] = useState(i18n.resolvedLanguage)
  if (runsOnServerSide && lng && i18n.resolvedLanguage !== lng) {
    i18n.changeLanguage(lng)
    return ret
  }
  useEffect(() => {
    if (activeLng === i18n.resolvedLanguage) return
    setActiveLng(i18n.resolvedLanguage)
  }, [activeLng, i18n.resolvedLanguage])

  useEffect(() => {
    if (!lng || i18n.resolvedLanguage === lng) return
    i18n.changeLanguage(lng)
  }, [lng, i18n])

  useEffect(() => {
    if (cookies.i18next === lng) return
    setCookie(cookieName, lng, { path: '/' })
  }, [lng, cookies.i18next])

  return ret
}
