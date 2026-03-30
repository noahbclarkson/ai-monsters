import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SpacetimeDBProvider } from '../lib/spacetimedb'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Monsters - Card Game',
  description: 'A 2D card game where every card is AI-generated and unique',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SpacetimeDBProvider>{children}</SpacetimeDBProvider>
      </body>
    </html>
  )
}