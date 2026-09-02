import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter_Tight } from 'next/font/google'

import { JsonLd } from '@/components/json-ld'
import { site } from '@/lib/site'

import './globals.css'

const sans = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'Mesub — Billing layer for Solana subscriptions',
    template: '%s — Mesub',
  },
  description: site.description,
  keywords: site.keywords,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  alternates: { canonical: '/' },
  category: 'technology',
  openGraph: {
    type: 'website',
    url: site.url,
    siteName: site.name,
    title: 'Mesub — Billing layer for Solana subscriptions',
    description: site.description,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mesub_io',
    creator: '@mesub_io',
    title: 'Mesub — Billing layer for Solana subscriptions',
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fbfaf7',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body>
        {children}
        <JsonLd />
        <Analytics />
      </body>
    </html>
  )
}
