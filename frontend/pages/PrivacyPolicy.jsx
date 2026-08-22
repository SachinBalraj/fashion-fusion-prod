import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ChevronRight, Shield } from 'lucide-react';
import { BUSINESS_INFO } from '@/src/constants/businessInfo';

const sections = [
  {
    title: 'Information We Collect',
    subsections: [
      {
        subtitle: 'Personal Information',
        list: [
          'Full Name',
          'Email Address',
          'Mobile Number',
          'Shipping & Billing Address',
          'Payment Information (processed securely through third-party payment gateways)',
          'Order History',
        ],
      },
      {
        subtitle: 'Non-Personal Information',
        list: [
          'IP Address',
          'Browser Type',
          'Device Information',
          'Operating System',
          'Website Usage Data',
          'Cookies and Similar Technologies',
        ],
      },
    ],
  },
  {
    title: 'How We Use Your Information',
    content:
      'We use your information to process and deliver your orders, verify payments and prevent fraudulent transactions, provide customer support, send order confirmations, shipping updates, and important notifications, improve our website, products, and customer experience, personalize product recommendations, send promotional emails, offers, and newsletters (only if you have opted in), and comply with legal and regulatory obligations.',
  },
  {
    title: 'Payment Security',
    content:
      'Fashion\'s Fusion does not store your complete debit card, credit card, or banking details. All payments are processed through trusted and secure third-party payment gateways using industry-standard encryption.',
  },
  {
    title: 'Cookies',
    content:
      'Our website uses cookies and similar technologies to remember your preferences, improve website functionality, analyze website traffic and performance, and deliver a better shopping experience. You can disable cookies through your browser settings; however, some website features may not function properly.',
  },
  {
    title: 'Sharing Your Information',
    content:
      'We do not sell, rent, or trade your personal information. Your information may be shared only with trusted third parties such as courier and logistics partners for order delivery, payment gateway providers for payment processing, technology and hosting providers for website operations, and government or legal authorities when required by law.',
  },
  {
    title: 'Data Security',
    content:
      'We implement appropriate technical and organizational security measures to protect your personal information from unauthorized access, misuse, alteration, or disclosure. While we strive to use commercially acceptable means to protect your data, no method of electronic transmission or storage is 100% secure.',
  },
  {
    title: 'Data Retention',
    content:
      'We retain your personal information only for as long as necessary to fulfill your orders, maintain business records, comply with legal, tax, and regulatory requirements, and resolve disputes and enforce our policies.',
  },
  {
    title: 'Your Rights',
    list: [
      'Access your personal information.',
      'Request correction of inaccurate information.',
      'Request deletion of your personal data, subject to applicable legal requirements.',
      'Withdraw consent for promotional communications at any time by using the unsubscribe option or contacting us directly.',
    ],
  },
  {
    title: 'Third-Party Links',
    content:
      'Our website may contain links to third-party websites. Fashion\'s Fusion is not responsible for the privacy practices or content of those external websites. We encourage you to review their privacy policies before sharing any personal information.',
  },
  {
    title: 'Children\'s Privacy',
    content:
      'Our website is not intended for individuals under the age of 18. We do not knowingly collect personal information from children.',
  },
  {
    title: 'Changes to This Privacy Policy',
    content:
      'Fashion\'s Fusion reserves the right to update this Privacy Policy at any time. Any changes will be posted on this page with the updated effective date. Continued use of our website after such changes constitutes your acceptance of the revised policy.',
  },
];

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — Fashion's Fusion</title>
        <meta name="description" content="Learn how Fashion's Fusion collects, uses, and protects your personal information." />
        <link rel="canonical" href="https://fashionsfusion.com/privacy-policy" />
        <meta property="og:title" content="Privacy Policy — Fashion's Fusion" />
        <meta property="og:description" content="Learn how Fashion's Fusion collects, uses, and protects your personal information." />
      </Helmet>

      {/* Hero Banner */}
      <section className="bg-primary py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-4">
            Legal
          </span>
          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            Your privacy matters to us. Learn how we collect, use, and protect your information.
          </p>
        </motion.div>
      </section>

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1.5 py-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="transition-colors hover:text-gold">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Privacy Policy</span>
        </nav>
      </div>

      {/* Content */}
      <section className="bg-background px-4 pb-20 md:px-6 md:pb-28">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border bg-white p-6 shadow-sm sm:p-10"
          >
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <Shield className="h-6 w-6 text-gold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Effective Date</p>
                <p className="font-heading text-sm font-bold">January 1, 2025</p>
              </div>
            </div>

            <p className="mb-8 leading-relaxed text-muted-foreground">
              At Fashion's Fusion, we value your privacy and are committed to protecting your personal
              information. This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you visit our website or purchase our products. By using our website, you
              agree to the collection and use of information in accordance with this Privacy Policy.
            </p>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={section.title}>
                  <h2 className="font-heading text-lg font-bold text-foreground">
                    {index + 1}. {section.title}
                  </h2>
                  <div className="mt-1 h-0.5 w-10 rounded-full bg-gold/40" />
                  {section.content && (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{section.content}</p>
                  )}
                  {section.subsections && (
                    <div className="mt-3 space-y-4">
                      {section.subsections.map((sub) => (
                        <div key={sub.subtitle}>
                          <h3 className="text-sm font-semibold text-foreground">{sub.subtitle}</h3>
                          <ul className="mt-2 space-y-1.5">
                            {sub.list.map((item) => (
                              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                  {section.list && (
                    <ul className="mt-3 space-y-2">
                      {section.list.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Info */}
            <div className="mt-10 rounded-xl bg-secondary/50 p-6">
              <h3 className="font-heading text-base font-bold text-foreground">Contact Us</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                If you have any questions, concerns, or requests regarding this Privacy Policy or your
                personal information, please contact us:
              </p>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p><strong className="text-foreground">{BUSINESS_INFO.name}</strong></p>
                <p>Email: <a href={`mailto:${BUSINESS_INFO.email}`} className="text-gold hover:underline">{BUSINESS_INFO.email}</a></p>
                <p>Phone: <a href={`tel:+${BUSINESS_INFO.whatsapp}`} className="text-gold hover:underline">+91-8072506446</a></p>
                <p>{BUSINESS_INFO.addressLine1}, {BUSINESS_INFO.addressLine2}</p>
              </div>
            </div>

            <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
              We are committed to protecting your privacy and ensuring a safe and secure shopping
              experience at Fashion's Fusion.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
