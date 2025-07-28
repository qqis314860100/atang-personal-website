export type Locale = 'zh' | 'en'

export type Namespace = 'common' | 'navbar' | 'resume' | 'dashboard'

export type Translations = Record<Namespace, (zhKey: string) => string>

export type TranslationFunction = (key: string, namespace?: Namespace) => string

export interface I18nHook {
  (defaultNamespace?: Namespace): TranslationFunction
}
