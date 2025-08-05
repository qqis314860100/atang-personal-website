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
import { PerformanceMonitor } from '@/components/performance-monitor'
import { RoutePrefetch } from '@/components/route-prefetch'

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
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // 验证语言环境
  if (!hasLocale(routing.locales, locale)) notFound()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <NextIntlClientProvider locale={locale}>
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
                    {/* 开发环境性能监控 */}
                    <PerformanceMonitor
                      enabled={process.env.NODE_ENV === 'development'}
                    />
                    {/* 路由预取优化 */}
                    <RoutePrefetch>
                      <></>
                    </RoutePrefetch>
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
