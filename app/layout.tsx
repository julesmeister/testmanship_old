import SupabaseProvider from './supabase-provider';
import { PropsWithChildren } from 'react';
import '@/styles/globals.css';
import { ThemeProvider } from './theme-provider';
import { Toaster } from 'sonner';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Special+Elite&family=Lobster&display=swap" rel="stylesheet" />
        <title>
          Testmanship - Elevate Your Writing with AI-Powered Feedback
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* <!--  Social tags   --> */}
        <meta
          name="keywords"
          content="writing practice, AI writing feedback, writing improvement, essay review, writing assistant, AI tutor"
        />
        <meta name="description" content="Testmanship: Your AI-powered writing companion. Practice writing with instant, personalized feedback to improve your skills." />
        {/* <!-- Schema.org markup for Google+ --> */}
        <meta itemProp="name" content="Testmanship - AI Writing Practice Platform" />
        <meta
          itemProp="description"
          content="Practice writing with AI-powered feedback. Get instant, personalized suggestions to improve your writing skills."
        />
        {/* <!-- Twitter Card data --> */}
        <meta name="twitter:card" content="product" />
        <meta
          name="twitter:title"
          content="Testmanship - AI Writing Practice Platform"
        />
        <meta
          name="twitter:description"
          content="Practice writing with AI-powered feedback. Get instant, personalized suggestions to improve your writing skills."
        />
        <meta
          name="twitter:image"
          content="Add here the link for your website SEO image"
        />
        {/* <!-- Open Graph data --> */}
        <meta
          property="og:title"
          content="Testmanship - AI Writing Practice Platform"
        />
        <meta property="og:type" content="product" />
        <meta property="og:url" content="https://testmanship.com" />
        <meta
          property="og:image"
          content="Add here the link for your website SEO image"
        />
        <meta
          property="og:description"
          content="Practice writing with AI-powered feedback. Get instant, personalized suggestions to improve your writing skills."
        />
        <meta
          property="og:site_name"
          content="Testmanship - AI Writing Practice Platform"
        />
        <link rel="canonical" href="https://testmanship" />
        <link rel="icon" href="/img/favicon.ico" />
      </head>
      <body id={'root'} className={`loading bg-background ${inter.className}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SupabaseProvider>
            <Toaster richColors closeButton position="top-right" />
            <main id="skip">{children}</main>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
