'use client'

import { ThemeProvider, useTheme } from 'next-themes'

export function ThemeProviders({ children }) {
  const { systemTheme } = useTheme()
  return (
    <ThemeProvider attribute="class" defaultTheme={systemTheme} enableSystem>
      {children}
    </ThemeProvider>
  )
}
