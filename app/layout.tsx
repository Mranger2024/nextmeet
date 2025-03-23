import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "./globals.css";
import { Toaster } from 'react-hot-toast'
import { Suspense } from 'react'
import { SettingsProvider } from '@/contexts/SettingsContext'
import ClientLayout from '@/components/ClientLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "NextMeet - Video Chat App",
  description: "Real-time video chat application for seamless communication",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body className={inter.className}>
        <SettingsProvider>
          <ClientLayout>
            <Suspense fallback={null}>
              <main>{children}</main>
            </Suspense>
          </ClientLayout>
        </SettingsProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }} 
        />
      </body>
    </html>
  )
}
