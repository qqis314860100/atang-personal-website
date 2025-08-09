export type Locale = 'zh' | 'en'

export type Namespace =
  | 'common'
  | 'navbar'
  | 'resume'
  | 'dashboard'
  | 'setting'
  | 'project'
  | 'performance'
  | 'pageAnalytics'
  | 'errorLogs'
  | 'auth'

export interface TranslationOptions {
  context?: string
  fallback?: string
  params?: Record<string, any>
}

export type Translations = Record<
  Namespace,
  (zhKey: string, options?: TranslationOptions) => string
>

export type TranslationFunction = (
  key: string,
  namespace?: Namespace,
  options?: TranslationOptions
) => string

export interface I18nHook {
  (defaultNamespace?: Namespace): TranslationFunction
}
