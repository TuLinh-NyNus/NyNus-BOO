export interface SocialLink {
  name: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  hoverColor: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

export interface NewsletterResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    subscribedAt?: string;
    status?: string;
  };
}

export interface FooterLink {
  name: string;
  url: string;
  description?: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface ContactInfo {
  type: 'email' | 'phone' | 'address';
  label: string;
  value: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface FooterAnalyticsEvent {
  event_category: string;
  event_label: string;
  value?: string | number;
}

export interface FooterConfig {
  companyName: string;
  description: string;
  socialLinks: SocialLink[];
  languages: Language[];
  sections: FooterSection[];
  contactInfo: ContactInfo[];
  newsletter: {
    title: string;
    description: string;
    placeholder: string;
    buttonText: string;
  };
}























