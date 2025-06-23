'use client'

import { CookiesProvider } from 'react-cookie'
import { ThemeProviders } from '@/app/theme.providers'

export function CookieProviders({ children }) {
  return (
    <CookiesProvider>
      <ThemeProviders>{children}</ThemeProviders>
    </CookiesProvider>
  )
}
