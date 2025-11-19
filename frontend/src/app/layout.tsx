import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { VerifyEmailBanner } from '@/components/auth/VerifyEmailBanner'
import { ToastProvider } from '@/components/providers/toast-provider'
import { ErrorBoundary } from '@/components/ui/error-boundary'

export const metadata: Metadata = {
  title: 'ClubCompass - Discover Your Perfect Club at BMSCE',
  description: 'Navigate through 60+ clubs at BMS College of Engineering. Find clubs that match your interests through our smart recommendation system.',
  keywords: ['BMSCE', 'clubs', 'college', 'extracurricular', 'BMS College of Engineering'],
  authors: [{ name: 'ClubCompass Team' }],
  openGraph: {
    title: 'ClubCompass - BMSCE Club Discovery',
    description: 'Discover and join clubs at BMS College of Engineering',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <ErrorBoundary>
          <VerifyEmailBanner />
          <div className="min-h-screen relative flex flex-col">
            <Header />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <Footer />
          </div>
          <ToastProvider />
        </ErrorBoundary>
      </body>
    </html>
  )
}
