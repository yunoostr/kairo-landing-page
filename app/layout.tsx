import type { Metadata, Viewport } from "next"
import { Caveat } from "next/font/google"
import Script from "next/script"

import "./globals.css"

const SITE = "https://kairoagent.io"
const TITLE = "Kairo — Listen to what your AI agent writes"
const DESCRIPTION =
  "Kairo reads any selected text aloud on your Mac from one shortcut, and summarizes, translates or humanizes it on your own OpenAI key. Free to read, pay once for Pro."

// Lets the browser paint the page dark before the stylesheet arrives (no white flash on load).
export const viewport: Viewport = { colorScheme: "dark" }

// app/opengraph-image.png is picked up by Next as og:image and twitter:image.
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: "%s · Kairo" },
  description: DESCRIPTION,
  // og:title / twitter:title fall back to each page's templated title.
  openGraph: { type: "website", siteName: "Kairo", locale: "en_US" },
  twitter: { card: "summary_large_image", site: "@kairoaiagent", creator: "@kairoaiagent" },
  robots: { index: true, follow: true },
}

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Kairo",
  url: SITE,
  image: `${SITE}/opengraph-image.png`,
  description: DESCRIPTION,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "macOS",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "EUR" },
    { "@type": "Offer", name: "Pro", price: "19", priceCurrency: "EUR" },
  ],
  sameAs: ["https://x.com/kairoaiagent", "https://github.com/nathanrenard3/kairo-releases"],
}

const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`scroll-smooth antialiased ${hand.variable}`}
      // Lets Next disable smooth scrolling during route transitions.
      data-scroll-behavior="smooth"
    >
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        {/* Cookieless audience measurement. data-domains keeps localhost and previews out of the stats. */}
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="b68da5a2-6181-42fc-ac91-901ac48a604d"
          data-domains="kairoagent.io"
        />
      </body>
    </html>
  )
}
