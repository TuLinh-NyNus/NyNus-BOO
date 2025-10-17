import { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact - Contact NyNus",
  description: "Contact NyNus team for support, consultation or feedback about our smart math learning platform.",
  keywords: [
    "contact",
    "support",
    "consultation",
    "NyNus",
    "help",
    "customer service",
    "technical support",
    "contact form"
  ],
  openGraph: {
    title: "Contact - Contact NyNus",
    description: "Contact NyNus team for support and consultation",
    type: "website",
    siteName: "NyNus",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Contact - Contact NyNus",
    description: "Contact NyNus team for support and consultation",
  },
  alternates: {
    canonical: "/contact",
  },
};

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "support@nynus.edu.vn",
    description: "Send us an email",
    link: "mailto:support@nynus.edu.vn"
  },
  {
    icon: Phone,
    title: "Hotline",
    value: "1900-xxxx",
    description: "Call our support line",
    link: "tel:1900-xxxx"
  },
  {
    icon: MapPin,
    title: "Address",
    value: "Hanoi, Vietnam",
    description: "Head office",
    link: "#"
  },
  {
    icon: Clock,
    title: "Working Hours",
    value: "8:00 AM - 6:00 PM",
    description: "Monday - Friday",
    link: "#"
  }
];

const departments = [
  {
    name: "Technical Support",
    email: "tech@nynus.edu.vn",
    description: "Support for technical issues, accounts, payments"
  },
  {
    name: "Course Consultation",
    email: "courses@nynus.edu.vn",
    description: "Consultation about courses and learning paths"
  },
  {
    name: "Business Partnership",
    email: "business@nynus.edu.vn",
    description: "Partners, collaboration, investment"
  },
  {
    name: "Careers",
    email: "careers@nynus.edu.vn",
    description: "Career opportunities at NyNus"
  }
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Contact{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Us
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We are always ready to listen and support you. Contact us 
              for consultation, support or feedback.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <div key={index} className="text-center p-6 border border-border rounded-xl bg-card hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">{info.title}</h3>
                <a
                  href={info.link}
                  className="text-primary hover:underline font-medium block mb-1"
                >
                  {info.value}
                </a>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </div>
            ))}
          </div>

          {/* Departments */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              Contact{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Departments
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {departments.map((dept, index) => (
                <div key={index} className="p-6 border border-border rounded-xl bg-card hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-card-foreground mb-2">{dept.name}</h3>
                      <a
                        href={`mailto:${dept.email}`}
                        className="text-primary hover:underline font-medium block mb-2"
                      >
                        {dept.email}
                      </a>
                      <p className="text-sm text-muted-foreground">{dept.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <div className="p-8 border border-border rounded-xl bg-card shadow-lg">
              <h2 className="text-2xl font-bold text-center mb-8">
                Send us a{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Message
                </span>
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-card-foreground mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="What is this about?"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-card-foreground mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Your message..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Need quick{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                answers?
              </span>
            </h2>
            <p className="text-muted-foreground mb-6">
              Check out our FAQ section for common questions and answers
            </p>
            <a
              href="/faq"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              Visit FAQ
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

