import './globals.css'
import { DM_Sans, Rajdhani, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { OrgProvider } from '@/components/providers/OrgProvider'
import { MigrationProvider } from '@/components/providers/MigrationProvider'
import { AppLayout } from '@/components/layout/AppLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ChatWidget } from '@/components/ai/ChatWidget'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans'
})

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-mono'
})

export const metadata = {
  title: 'DriverOS',
  description: 'Turn your North Star into weekly wins',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${rajdhani.variable} ${jetbrainsMono.variable} font-sans`}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            themes={['light', 'dark', 'system', 'midnight-racing', 'sunrise', 'sunrise-dark']}
          >
            <AuthProvider>
              <OrgProvider>
                <MigrationProvider>
                  <AppLayout>
                    {children}
                    <ChatWidget />
                  </AppLayout>
                </MigrationProvider>
              </OrgProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
