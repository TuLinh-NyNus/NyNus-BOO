"use client";

import { FileText, Users, Shield, AlertCircle, CheckCircle, XCircle, Scale, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const termsData = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    icon: CheckCircle,
    gradient: "from-blue-500/20 via-blue-400/10 to-indigo-500/20",
    iconColor: "text-blue-400",
    content: [
      "By accessing and using NyNus platform, you agree to be bound by these Terms of Service.",
      "• You must be at least 13 years old to use this service",
      "• If you are under 18, you must have parental consent",
      "• You agree to provide accurate and complete information",
      "• You are responsible for maintaining the security of your account",
      "If you do not agree to these terms, please do not use our service."
    ]
  },
  {
    id: "user-accounts",
    title: "2. User Accounts",
    icon: Users,
    gradient: "from-purple-500/20 via-purple-400/10 to-violet-500/20",
    iconColor: "text-purple-400",
    content: [
      "Account registration and management:",
      "• You must create an account to access certain features",
      "• You are responsible for all activities under your account",
      "• Keep your password secure and confidential",
      "• Notify us immediately of any unauthorized access",
      "• One person may only create one account",
      "• We reserve the right to suspend or terminate accounts that violate these terms"
    ]
  },
  {
    id: "acceptable-use",
    title: "3. Acceptable Use",
    icon: Shield,
    gradient: "from-emerald-500/20 via-emerald-400/10 to-teal-500/20",
    iconColor: "text-emerald-400",
    content: [
      "You agree NOT to:",
      "• Use the service for any illegal or unauthorized purpose",
      "• Violate any laws in your jurisdiction",
      "• Infringe on intellectual property rights",
      "• Upload malicious code or viruses",
      "• Harass, abuse, or harm other users",
      "• Attempt to gain unauthorized access to our systems",
      "• Share or sell your account credentials",
      "• Use automated systems to access the service without permission"
    ]
  },
  {
    id: "intellectual-property",
    title: "4. Intellectual Property",
    icon: FileText,
    gradient: "from-amber-500/20 via-amber-400/10 to-orange-500/20",
    iconColor: "text-amber-400",
    content: [
      "Content ownership and usage rights:",
      "• All content on NyNus is protected by copyright and intellectual property laws",
      "• NyNus retains all rights to platform content, design, and features",
      "• You may use our content for personal, non-commercial educational purposes only",
      "• You may not reproduce, distribute, or create derivative works without permission",
      "• User-generated content remains your property, but you grant us a license to use it",
      "• We respect intellectual property rights and expect users to do the same"
    ]
  },
  {
    id: "payment-refunds",
    title: "5. Payment and Refunds",
    icon: Scale,
    gradient: "from-pink-500/20 via-pink-400/10 to-rose-500/20",
    iconColor: "text-pink-400",
    content: [
      "Payment terms and refund policy:",
      "• All prices are displayed in Vietnamese Dong (VND)",
      "• Payment is required before accessing premium features",
      "• We accept various payment methods as displayed at checkout",
      "• Subscriptions auto-renew unless cancelled before renewal date",
      "• Refunds are available within 7 days of purchase for unused services",
      "• No refunds for partially used subscription periods",
      "• Contact support@nynus.edu.vn for refund requests"
    ]
  },
  {
    id: "termination",
    title: "6. Termination",
    icon: XCircle,
    gradient: "from-red-500/20 via-red-400/10 to-pink-500/20",
    iconColor: "text-red-400",
    content: [
      "Account termination conditions:",
      "• You may terminate your account at any time through account settings",
      "• We may suspend or terminate your account for violations of these terms",
      "• We may terminate accounts that have been inactive for extended periods",
      "• Upon termination, your right to use the service ceases immediately",
      "• We may retain certain information as required by law",
      "• Paid subscriptions are non-refundable upon termination for violations"
    ]
  },
  {
    id: "disclaimer",
    title: "7. Disclaimer of Warranties",
    icon: AlertCircle,
    gradient: "from-indigo-500/20 via-indigo-400/10 to-purple-500/20",
    iconColor: "text-indigo-400",
    content: [
      "Service is provided 'as is' without warranties:",
      "• We do not guarantee uninterrupted or error-free service",
      "• We are not responsible for third-party content or links",
      "• Educational content is for informational purposes only",
      "• We do not guarantee specific learning outcomes or exam results",
      "• You use the service at your own risk",
      "• We are not liable for any damages arising from use of the service"
    ]
  },
  {
    id: "changes",
    title: "8. Changes to Terms",
    icon: FileText,
    gradient: "from-teal-500/20 via-teal-400/10 to-cyan-500/20",
    iconColor: "text-teal-400",
    content: [
      "We reserve the right to modify these terms:",
      "• We will notify users of significant changes via email or platform notification",
      "• Continued use of the service after changes constitutes acceptance",
      "• You should review these terms periodically",
      "• Last updated: January 2025",
      "• For questions about these terms, contact us at legal@nynus.edu.vn"
    ]
  }
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 dark:bg-grid-black/10" />
        <div className="relative container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
              <Scale className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Terms of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Service
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
              Please read these terms carefully before using NyNus platform
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: January 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            {termsData.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-8 border border-border rounded-xl bg-gradient-to-br ${section.gradient} backdrop-blur-sm hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-lg bg-background/50 flex items-center justify-center flex-shrink-0`}>
                    <section.icon className={`w-6 h-6 ${section.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      {section.title}
                    </h2>
                    <div className="space-y-3">
                      {section.content.map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-muted-foreground leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-16 p-8 border border-border rounded-xl bg-card text-center"
          >
            <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">
              Questions about our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Terms?
              </span>
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              If you have any questions about these Terms of Service, please contact our legal team
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Contact Us
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/privacy"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
              >
                Privacy Policy
                <Shield className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

