import { Caveat } from "next/font/google"

import "./globals.css"

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
