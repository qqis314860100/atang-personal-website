import siteMetadata from '@/data/siteMetadata'
import { ThemeProviders } from '@/app/theme.providers'
import Header from '@/components/Header'
import { Metadata } from 'next'
import Footer from '@/components/Footer'
import NextTopLoader from 'nextjs-toploader'
import { Toaster } from 'react-hot-toast'
import { Inter } from 'next/font/google'
import FlyonuiScript from '@/components/FlyonuiScript'

import '../globals.css'
const inter = Inter({ subsets: ['latin'] })

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

  return (
    <html
      lang={locale}
      className="touch-pan-x touch-pan-y"
      suppressHydrationWarning
    >
      <body className={inter.className}>
        <ThemeProviders>
          <NextTopLoader showSpinner={false} color="#fff" />
          <Toaster />
          <Header locale={locale} />
          <main className="mb-auto">{children}</main>
          <Footer />
          <FlyonuiScript />
        </ThemeProviders>
      </body>
    </html>
  )
}
