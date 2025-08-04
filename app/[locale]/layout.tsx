import siteMetadata from '@/data/siteMetadata'
import { Metadata } from 'next'
import { ClientTopLoader } from '@/components/client-toploader'
import { ClientToaster } from '@/components/client-toaster'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import Header from '@/components/Header'
import { ThemeProvider } from '@/components/provider/ThemeProvider'
import '../globals.css'
import SessionProvider from '@/components/provider/SessionProvider'
import { QueryProvider } from '@/components/provider/QueryProvider'
import { UserStatePreloader } from '@/components/provider/UserStatePreloader'
import { ErrorBoundary } from '@/components/ErrorBoundary'

import { cn } from '@/utils/utils'
import { fontSans } from '@/utils/fonts'

interface RootLayoutProps extends React.PropsWithChildren {
  params: {
    locale: string
  }
}

export async function generateStaticParams() {
  return siteMetadata.languages.map((locale: string) => {
    return { locale }
  })
}

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: siteMetadata.locale,
    type: 'website',
  },
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': `${siteMetadata.siteUrl}/feed.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const paramsData = await Promise.resolve(params)
  const { locale } = paramsData
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  return (
    <html
      lang={locale}
      className="touch-pan-x touch-pan-y"
      suppressHydrationWarning
    >
      <body
        className={cn(
          'h-screen bg-gray-100 antialiased font-sans',
          fontSans.variable
        )}
      >
        <NextIntlClientProvider>
          <ErrorBoundary>
            <QueryProvider>
              <SessionProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  <UserStatePreloader>
                    {/* 主面板容器 */}
                    <ClientTopLoader />
                    <ClientToaster />
                    {/* 内容区域 - Header 和主体融合 */}
                    <div className="h-full flex flex-col">
                      <Header />
                      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
                        {children}
                      </main>
                    </div>
                  </UserStatePreloader>
                </ThemeProvider>
              </SessionProvider>
            </QueryProvider>
          </ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
