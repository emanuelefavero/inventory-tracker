import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { metadata as appMetadata } from '@/config/metadata'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  ...appMetadata,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang='en' suppressHydrationWarning>
        <body className='bg-background font-sans text-foreground antialiased'>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <Main>{children}</Main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
