/**
 * SEO Optimization Utility
 * 
 * Provides comprehensive SEO optimization tools for the NyNus application
 * including meta tags, structured data, and performance optimizations
 */

import { Metadata } from 'next';

import logger from './logger';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'course' | 'exam';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  locale?: string;
  alternateLocales?: string[];
}

interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

class SEOOptimizer {
  private readonly baseUrl: string;
  private readonly siteName: string;
  private readonly defaultImage: string;
  private readonly defaultLocale: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nynus.edu.vn';
    this.siteName = 'NyNus - Nền tảng học tập trực tuyến';
    this.defaultImage = `${this.baseUrl}/images/og-default.jpg`;
    this.defaultLocale = 'vi_VN';
  }

  /**
   * Generate comprehensive metadata for Next.js pages
   */
  generateMetadata(config: SEOConfig): Metadata {
    const {
      title,
      description,
      keywords = [],
      image = this.defaultImage,
      url = this.baseUrl,
      type = 'website',
      author,
      publishedTime,
      modifiedTime,
      locale = this.defaultLocale,
      alternateLocales = []
    } = config;

    const fullTitle = title.includes(this.siteName) ? title : `${title} | ${this.siteName}`;
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    const fullImage = image.startsWith('http') ? image : `${this.baseUrl}${image}`;

    const metadata: Metadata = {
      title: fullTitle,
      description,
      keywords: keywords.join(', '),
      
      // Open Graph
      openGraph: {
        title: fullTitle,
        description,
        url: fullUrl,
        siteName: this.siteName,
        images: [
          {
            url: fullImage,
            width: 1200,
            height: 630,
            alt: title
          }
        ],
        locale,
        type: type === 'article' ? 'article' : 'website',
        ...(publishedTime && { publishedTime }),
        ...(modifiedTime && { modifiedTime }),
        ...(author && type === 'article' && { authors: [author] })
      },

      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: fullTitle,
        description,
        images: [fullImage],
        creator: author ? `@${author}` : '@nynus_edu'
      },

      // Additional meta tags
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1
        }
      },

      // Alternate languages
      ...(alternateLocales.length > 0 && {
        alternates: {
          languages: alternateLocales.reduce((acc, locale) => {
            acc[locale] = `${fullUrl}?lang=${locale}`;
            return acc;
          }, {} as Record<string, string>)
        }
      }),

      // Verification
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
        yandex: process.env.YANDEX_VERIFICATION,
        yahoo: process.env.YAHOO_VERIFICATION
      }
    };

    logger.info(`🔍 Generated SEO metadata for: ${title}`);
    return metadata;
  }

  /**
   * Generate structured data for courses
   */
  generateCourseStructuredData(course: {
    id: string;
    title: string;
    description: string;
    instructor: string;
    price?: number;
    duration?: string;
    level?: string;
    rating?: number;
    reviewCount?: number;
    image?: string;
    url?: string;
  }): StructuredData {
    const structuredData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: course.title,
      description: course.description,
      provider: {
        '@type': 'Organization',
        name: this.siteName,
        url: this.baseUrl
      },
      instructor: {
        '@type': 'Person',
        name: course.instructor
      },
      ...(course.price && {
        offers: {
          '@type': 'Offer',
          price: course.price,
          priceCurrency: 'VND',
          availability: 'https://schema.org/InStock'
        }
      }),
      ...(course.duration && { timeRequired: course.duration }),
      ...(course.level && { educationalLevel: course.level }),
      ...(course.rating && course.reviewCount && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: course.rating,
          reviewCount: course.reviewCount,
          bestRating: 5,
          worstRating: 1
        }
      }),
      ...(course.image && { image: course.image }),
      ...(course.url && { url: course.url })
    };

    return structuredData;
  }

  /**
   * Generate structured data for articles/blog posts
   */
  generateArticleStructuredData(article: {
    title: string;
    description: string;
    author: string;
    publishedTime: string;
    modifiedTime?: string;
    image?: string;
    url?: string;
    section?: string;
    tags?: string[];
  }): StructuredData {
    const structuredData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      author: {
        '@type': 'Person',
        name: article.author
      },
      publisher: {
        '@type': 'Organization',
        name: this.siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${this.baseUrl}/images/logo.png`
        }
      },
      datePublished: article.publishedTime,
      ...(article.modifiedTime && { dateModified: article.modifiedTime }),
      ...(article.image && {
        image: {
          '@type': 'ImageObject',
          url: article.image
        }
      }),
      ...(article.url && { url: article.url }),
      ...(article.section && { articleSection: article.section }),
      ...(article.tags && { keywords: article.tags.join(', ') })
    };

    return structuredData;
  }

  /**
   * Generate breadcrumb structured data
   */
  generateBreadcrumbStructuredData(items: BreadcrumbItem[]): StructuredData {
    const structuredData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url.startsWith('http') ? item.url : `${this.baseUrl}${item.url}`
      }))
    };

    return structuredData;
  }

  /**
   * Generate FAQ structured data
   */
  generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>): StructuredData {
    const structuredData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };

    return structuredData;
  }

  /**
   * Generate organization structured data
   */
  generateOrganizationStructuredData(): StructuredData {
    const structuredData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: this.siteName,
      url: this.baseUrl,
      logo: `${this.baseUrl}/images/logo.png`,
      description: 'Nền tảng học tập trực tuyến hàng đầu Việt Nam',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'VN',
        addressLocality: 'Hà Nội'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+84-xxx-xxx-xxx',
        contactType: 'customer service',
        availableLanguage: ['Vietnamese', 'English']
      },
      sameAs: [
        'https://facebook.com/nynus',
        'https://twitter.com/nynus_edu',
        'https://linkedin.com/company/nynus'
      ]
    };

    return structuredData;
  }

  /**
   * Generate website structured data
   */
  generateWebsiteStructuredData(): StructuredData {
    const structuredData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.siteName,
      url: this.baseUrl,
      description: 'Nền tảng học tập trực tuyến với các khóa học chất lượng cao',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${this.baseUrl}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      },
      publisher: {
        '@type': 'Organization',
        name: this.siteName,
        logo: `${this.baseUrl}/images/logo.png`
      }
    };

    return structuredData;
  }

  /**
   * Inject structured data into page
   */
  injectStructuredData(data: StructuredData | StructuredData[]): string {
    const jsonLd = Array.isArray(data) ? data : [data];
    
    return jsonLd.map(item => 
      `<script type="application/ld+json">${JSON.stringify(item, null, 2)}</script>`
    ).join('\n');
  }

  /**
   * Generate sitemap entry
   */
  generateSitemapEntry(url: string, Options: {
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
  } = {}): string {
    const {
      lastmod = new Date().toISOString(),
      changefreq = 'weekly',
      priority = 0.5
    } = options;

    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

    return `
  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }

  /**
   * Validate SEO configuration
   */
  validateSEOConfig(config: SEOConfig): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Title validation
    if (!config.title) {
      errors.push('Title is required');
    } else if (config.title.length > 60) {
      warnings.push('Title is longer than 60 characters');
    } else if (config.title.length < 30) {
      warnings.push('Title is shorter than 30 characters');
    }

    // Description validation
    if (!config.description) {
      errors.push('Description is required');
    } else if (config.description.length > 160) {
      warnings.push('Description is longer than 160 characters');
    } else if (config.description.length < 120) {
      warnings.push('Description is shorter than 120 characters');
    }

    // Keywords validation
    if (config.keywords && config.keywords.length > 10) {
      warnings.push('Too many keywords (>10)');
    }

    // Image validation
    if (config.image && !config.image.startsWith('http') && !config.image.startsWith('/')) {
      warnings.push('Image URL should be absolute or start with /');
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }
}

// Export singleton instance
export const seoOptimizer = new SEOOptimizer();

export default seoOptimizer;
