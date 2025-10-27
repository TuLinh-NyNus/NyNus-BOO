/**
 * Google Analytics 4 Script Component
 * Injects GA4 tracking scripts into the page
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-26
 */

import Script from 'next/script';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';

// ===== MAIN COMPONENT =====

/**
 * GA4 Script Component
 * Loads Google Analytics 4 tracking scripts
 * Should be placed in root layout
 * 
 * @example
 * ```tsx
 * // In app/layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <head>
 *         <GA4Script />
 *       </head>
 *       <body>{children}</body>
 *     </html>
 *   );
 * }
 * ```
 */
export function GA4Script() {
  // Don't load if no measurement ID
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      {/* Google Analytics gtag.js Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      
      {/* Google Analytics Configuration */}
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Initialize with consent mode
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'wait_for_update': 500
            });
            
            // Configure GA4
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              cookie_flags: 'SameSite=None;Secure',
              anonymize_ip: true,
              send_page_view: false // We'll handle pageviews manually
            });
            
            // Expose gtag globally
            window.gtag = gtag;
          `,
        }}
      />
    </>
  );
}

// ===== EXPORTS =====
export default GA4Script;

