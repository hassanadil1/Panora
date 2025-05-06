import { type Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConvexClientProvider } from '../../providers/convex-client-provider'

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className={`antialiased ${inter.variable} font-outfit`}>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  )
}
