import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'HireReady',
  description: 'Personalized career planning platform for university students',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-900 text-slate-100">
        <Navbar />
        {children}
      </body>
    </html>
  )
}





