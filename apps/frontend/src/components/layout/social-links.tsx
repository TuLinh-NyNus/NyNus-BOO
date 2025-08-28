"use client";

import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Github
} from "lucide-react";

interface SocialLink {
  name: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  hoverColor: string;
}

const socialLinks: SocialLink[] = [
  {
    name: 'Facebook',
    url: 'https://facebook.com/nynus',
    icon: Facebook,
    color: 'hover:bg-blue-500/20 hover:text-blue-500',
    hoverColor: 'hover:border-blue-500'
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/nynus',
    icon: Instagram,
    color: 'hover:bg-pink-500/20 hover:text-pink-500',
    hoverColor: 'hover:border-pink-500'
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/@nynus',
    icon: Youtube,
    color: 'hover:bg-red-500/20 hover:text-red-500',
    hoverColor: 'hover:border-red-500'
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com/nynus',
    icon: Twitter,
    color: 'hover:bg-sky-500/20 hover:text-sky-500',
    hoverColor: 'hover:border-sky-500'
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/company/nynus',
    icon: Linkedin,
    color: 'hover:bg-blue-600/20 hover:text-blue-600',
    hoverColor: 'hover:border-blue-600'
  },
  {
    name: 'GitHub',
    url: 'https://github.com/nynus',
    icon: Github,
    color: 'hover:bg-gray-700/20 hover:text-gray-700 dark:hover:bg-gray-300/20 dark:hover:text-gray-300',
    hoverColor: 'hover:border-gray-700 dark:hover:border-gray-300'
  }
];

const SocialLinks = () => {
  const handleSocialClick = (platform: string, url: string) => {
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'social_link_click', {
        event_category: 'Footer',
        event_label: `${platform} Link`,
        value: url
      });
    }

    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex space-x-3">
      {socialLinks.map((social, index) => {
        const IconComponent = social.icon;
        return (
          <motion.div
            key={social.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              onClick={() => handleSocialClick(social.name, social.url)}
              className={`w-9 h-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground border border-transparent transition-all duration-300 ${social.color} ${social.hoverColor} focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background`}
              aria-label={`Theo dõi chúng tôi trên ${social.name}`}
              title={`Theo dõi chúng tôi trên ${social.name}`}
            >
              <IconComponent className="h-4 w-4" />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SocialLinks;
