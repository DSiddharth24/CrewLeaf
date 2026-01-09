import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FestPilot | Seamless Event Management for College Clubs',
  description: 'Manage events, registrations, payments, and certificates for your college fest with ease.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} selection:bg-purple-500/30`}>
        {children}
      </body>
    </html>
  )
}
