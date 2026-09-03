import type { Metadata, Viewport } from "next"
import { Caveat } from "next/font/google"

import "./globals.css"

// Lets the browser paint the page dark before the stylesheet arrives (no white flash on load).
export const viewport: Viewport = { colorScheme: "dark" }

export const metadata: Metadata = {
  title: "Kairo — Listen to what your AI agent writes",
  description:
    "Kairo reads any selected text aloud on your Mac from one shortcut, and summarizes, translates or humanizes it on your own OpenAI key. Free to read, pay once for Pro.",
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
      <body>{children}</body>
    </html>
  )
}
