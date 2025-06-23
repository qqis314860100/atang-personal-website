import '@/app/globals.css'
import siteMetadata from '@/data/siteMetadata'
import ThemeSwitch from '@/components/ThemeSwitch'
import { dir } from 'i18next'
import { CookieProviders } from './providers'
import LangSwitch from '@/app/components/LangeSwitch'

export async function generateStaticParams() {
  return siteMetadata.languages.map((lng) => {
    return { lng }
  })
}

export default function RootLayout({ children, params }) {
  const { lng } = params
  return (
    <html lang={lng} dir={dir(lng)} suppressHydrationWarning>
      <body>
        <CookieProviders>
          <header className="flex justify-end">
            <ThemeSwitch />
            <LangSwitch />
          </header>
          {children}
        </CookieProviders>
      </body>
    </html>
  )
}
