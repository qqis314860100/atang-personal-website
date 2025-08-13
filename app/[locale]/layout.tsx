import ChatRoomTrigger from '@/app/components/ai-agent'
import Header from '@/app/components/Nav/Header'
import { AnalyticsProvider } from '@/app/components/providers/AnalyticsProvider'
import { AuthListener } from '@/app/components/providers/AuthListener'
import { LoadingProvider } from '@/app/components/providers/LoadingProvider'
import { QueryProvider } from '@/app/components/providers/QueryProvider'
import { RealTimeProvider } from '@/app/components/providers/RealTimeProvider'
import SessionProvider from '@/app/components/providers/SessionProvider'
import { ThemeProvider } from '@/app/components/providers/ThemeProvider'
import { UserStatePreloader } from '@/app/components/providers/UserStatePreloader'
import { ClientToaster } from '@/components/client-toaster'
import { ClientTopLoader } from '@/components/client-toploader'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { GlobalErrorHandler } from '@/components/GlobalErrorHandler'
import { RoutePrefetch } from '@/components/route-prefetch'
import { GlobalStatusBar } from '@/components/ui/global-status-bar'
import HotReload from '@/components/HotReload'
import siteMetadata from '@/data/siteMetadata'
import { routing } from '@/i18n/routing'
import { Metadata } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import '../globals.css'

import MainWrapper from '@/app/components/layout/MainWrapper'
import { cn } from '@/lib/utils'
import { fontSans } from '@/utils/fonts'
import Picture from './picture'

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
          <GlobalErrorHandler />
          <ErrorBoundary>
            <QueryProvider>
              <RealTimeProvider>
                <SessionProvider>
                  <AuthListener />
                  <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                  >
                    <LoadingProvider>
                      <AnalyticsProvider>
                        <UserStatePreloader>
                          {/* 全局状态栏 */}
                          <GlobalStatusBar />

                          {/* 主面板容器 */}
                          <ClientTopLoader />
                          <ClientToaster />
                          <Picture />

                          {/* 内容区域 - Header 和主体融合 */}
                          <div className="relative h-full flex flex-col">
                            {/* 登录页不显示 Header：由登录页自身决定全屏 */}
                            <Header />
                            <MainWrapper>{children}</MainWrapper>
                          </div>

                          <RoutePrefetch>
                            <></>
                          </RoutePrefetch>
                        </UserStatePreloader>
                        <ChatRoomTrigger />
                        <HotReload />
                      </AnalyticsProvider>
                    </LoadingProvider>
                  </ThemeProvider>
                </SessionProvider>
              </RealTimeProvider>
            </QueryProvider>
          </ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
