import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { AdminProvider } from '@/contexts/AdminContext'

// Google Analytics
declare global {
  interface Window {
    gtag: any;
  }
}

// Google Analytics helper functions
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

const event = ({ action, category, label, value }: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isAdminPage = router.pathname.startsWith('/admin')

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      pageview(url)
    }
    
    router.events.on('routeChangeComplete', handleRouteChange)
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  const AppContent = (
    <>
      <Head>
        {/* Google Analytics */}
        {GA_TRACKING_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_TRACKING_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
        
        {/* Google AdSense - Site Verification */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1248167744465833"
          crossOrigin="anonymous"
        />
      </Head>
      
      <Component {...pageProps} />
    </>
  )

  // Wrap admin pages with AdminProvider
  if (isAdminPage) {
    return (
      <AdminProvider>
        {AppContent}
      </AdminProvider>
    )
  }

  return AppContent
}

// Export analytics functions for use in other components
export { pageview, event }
