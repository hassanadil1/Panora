import { type Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: "Panora - Real Estate & Virtual Tours",
  description: "Find your dream property or get immersive 360° virtual tours.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} font-outfit`}>
        <body className="antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
