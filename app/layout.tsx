import type { Viewport } from "next"
import { Caveat } from "next/font/google"

import "./globals.css"

// Lets the browser paint the page dark before the stylesheet arrives (no white flash on load).
export const viewport: Viewport = { colorScheme: "dark" }

const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`scroll-smooth antialiased ${hand.variable}`}>
      <body>{children}</body>
    </html>
  )
}
