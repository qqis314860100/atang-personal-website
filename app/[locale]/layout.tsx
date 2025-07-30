import siteMetadata from '@/data/siteMetadata'
import { Metadata } from 'next'
import Footer from '@/components/Footer'
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
import { UserStateDebugger } from '@/components/debug/UserStateDebugger'
import { UserStatePreloader } from '@/components/provider/UserStatePreloader'
import { cn } from '@/lib/utils'
import { fontSans } from '@/lib/fonts'

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
          'min-h-screen bg-background antialiased font-sans',
          fontSans.variable
        )}
      >
        <QueryProvider>
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <NextIntlClientProvider>
                <UserStatePreloader>
                  {/* 主内容区 */}
                  <div className="flex w-full  flex-col">
                    <Header />
                    <ClientTopLoader />
                    <ClientToaster />
                    {/* 内容区域 */}
                    <main className="flex-1  transition-all duration-200 ease-in-out">
                      <div className="py-6">{children}</div>
                    </main>

                    <Footer />
                  </div>
                  <UserStateDebugger />
                </UserStatePreloader>
              </NextIntlClientProvider>
            </ThemeProvider>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
