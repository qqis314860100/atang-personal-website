import '@/app/globals.css'
import siteMetadata from '@/data/siteMetadata'
import { ThemeProviders } from '@/app/theme.providers'
import ThemeSwitch from '@/components/ThemeSwitch'
import { dir } from 'i18next'

export async function generateStaticParams() {
  return siteMetadata.languages.map((lng) => {
    return { lng }
  })
}

export default function RootLayout({ children, params }) {
  const { lng } = params
  console.log('---------------------------------------', lng, dir('zh'))
  return (
    <html lang={lng} dir={dir(lng)} suppressHydrationWarning>
      <body>
        <ThemeProviders>
          <header className="flex justify-end">
            <ThemeSwitch />
          </header>
          {children}
        </ThemeProviders>
      </body>
    </html>
  )
}
