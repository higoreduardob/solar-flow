import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'

import { auth } from '@/auth'

import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from '@/providers/query-provider'
import { ThemeProvider } from '@/providers/theme-provider'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Solar Flow',
  description: 'Gerencie e automatize suas obras',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <SessionProvider session={session}>
      <html lang="pt-BR" suppressHydrationWarning>
        <body className={inter.className}>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Toaster />
              {children}
            </ThemeProvider>
          </QueryProvider>
        </body>
      </html>
    </SessionProvider>
  )
}
