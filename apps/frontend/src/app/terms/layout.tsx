import { Metadata } from 'next';
import { ReactNode } from 'react';

/**
 * Terms of Service Section Metadata
 * SEO metadata cho Terms of Service page
 */
export const metadata: Metadata = {
  title: "Terms of Service - NyNus",
  description: "Read NyNus Terms of Service. Learn about user agreements, intellectual property rights, payment terms, and privacy policies for our smart math learning platform.",
  keywords: [
    "terms of service",
    "user agreement",
    "terms and conditions",
    "NyNus terms",
    "legal",
    "privacy policy",
    "intellectual property",
    "payment terms"
  ],
  openGraph: {
    title: "Terms of Service - NyNus",
    description: "Read NyNus Terms of Service and user agreements",
    type: "website",
    siteName: "NyNus",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service - NyNus",
    description: "Read NyNus Terms of Service and user agreements",
  },
  alternates: {
    canonical: "/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Terms Layout Component
 * Layout wrapper cho Terms of Service page
 */
export default function TermsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

