'use client'

import { ThemeProvider } from 'next-themes'
import { CookiesProvider } from 'react-cookie'

interface ThemeProvidersProps extends React.PropsWithChildren {}

export function ThemeProviders({ children }: ThemeProvidersProps) {
  return (
    <CookiesProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </CookiesProvider>
  )
}
