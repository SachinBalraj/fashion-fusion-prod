import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText } from 'lucide-react';
import { BUSINESS_INFO } from '@/src/constants/businessInfo';

const sections = [
  {
    title: 'General',
    content:
      'Fashion\'s Fusion reserves the right to update, modify, or replace these Terms & Conditions at any time without prior notice. Continued use of our website after changes are posted constitutes your acceptance of the revised terms.',
  },
  {
    title: 'Eligibility',
    content:
      'You must be at least 18 years old or have the consent of a parent or legal guardian to make purchases from our website. By placing an order, you confirm that all information provided is accurate and complete.',
  },
  {
    title: 'Products & Pricing',
    content:
      'We make every effort to display product colors, images, and descriptions accurately. However, actual colors may vary slightly due to different screen settings. All prices are displayed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise. Prices and product availability are subject to change without prior notice.',
  },
  {
    title: 'Orders',
    content:
      'Orders are confirmed only after successful payment and order verification. We reserve the right to refuse or cancel any order due to stock unavailability, pricing errors, suspected fraudulent activity, or any other valid reason. If an order is cancelled after payment, the applicable refund will be processed to the original payment method.',
  },
  {
    title: 'Payments',
    content:
      'We accept secure payments through trusted payment gateways. Fashion\'s Fusion does not store your complete debit/credit card information. In case of payment failure, please verify with your bank before attempting another transaction.',
  },
  {
    title: 'Shipping & Delivery',
    content:
      'Orders are generally processed within 1–3 business days. Delivery timelines vary depending on the destination and courier partner. Delays due to weather conditions, natural disasters, public holidays, or courier issues are beyond our control.',
  },
  {
    title: 'Returns, Exchanges & Refunds',
    content:
      'Returns and exchanges are subject to our Refund & Return Policy. Products must be unused, unwashed, and returned with original tags and packaging. Fashion\'s Fusion reserves the right to reject returns that do not meet our return policy requirements.',
  },
  {
    title: 'Intellectual Property',
    content:
      'All content on this website, including logos, images, graphics, product designs, text, videos, and other materials, is the exclusive property of Fashion\'s Fusion and is protected by applicable intellectual property laws. Unauthorized reproduction, copying, or distribution is strictly prohibited.',
  },
  {
    title: 'User Conduct',
    list: [
      'Use the website for unlawful purposes.',
      'Attempt to gain unauthorized access to our systems.',
      'Upload malicious software or harmful content.',
      'Interfere with the operation or security of the website.',
    ],
    prefix: 'You agree not to:',
  },
  {
    title: 'Limitation of Liability',
    content:
      'Fashion\'s Fusion shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our website or products. Our maximum liability shall not exceed the amount paid for the purchased product.',
  },
  {
    title: 'Privacy',
    content:
      'Your personal information is handled in accordance with our Privacy Policy. By using our website, you consent to the collection and use of your information as described in our Privacy Policy.',
  },
  {
    title: 'Governing Law',
    content:
      'These Terms & Conditions shall be governed by and interpreted in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts having jurisdiction over our registered place of business.',
  },
  {
    title: 'Force Majeure',
    content:
      'Fashion\'s Fusion shall not be held responsible for delays or failure to perform obligations due to events beyond our reasonable control, including natural disasters, strikes, government actions, pandemics, or transportation disruptions.',
  },
];

export default function TermsAndConditions() {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions — Fashion's Fusion</title>
        <meta name="description" content="Read the Terms & Conditions governing your use of Fashion's Fusion website and purchase of products." />
        <link rel="canonical" href="https://fashionsfusion.com/terms-and-conditions" />
        <meta property="og:title" content="Terms & Conditions — Fashion's Fusion" />
        <meta property="og:description" content="Read the Terms & Conditions governing your use of Fashion's Fusion website and purchase of products." />
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
            Terms & Conditions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            Please read these terms carefully before using our website or placing an order.
          </p>
        </motion.div>
      </section>

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1.5 py-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="transition-colors hover:text-gold">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Terms & Conditions</span>
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
                <FileText className="h-6 w-6 text-gold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Effective Date</p>
                <p className="font-heading text-sm font-bold">January 1, 2025</p>
              </div>
            </div>

            <p className="mb-8 leading-relaxed text-muted-foreground">
              Welcome to Fashion's Fusion. These Terms & Conditions govern your use of our website and the
              purchase of products from us. By accessing our website or placing an order, you agree to comply
              with these terms.
            </p>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={section.title}>
                  <h2 className="font-heading text-lg font-bold text-foreground">
                    {index + 1}. {section.title}
                  </h2>
                  <div className="mt-1 h-0.5 w-10 rounded-full bg-gold/40" />
                  {section.prefix && (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{section.prefix}</p>
                  )}
                  {section.content && (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{section.content}</p>
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
                If you have any questions regarding these Terms & Conditions, please contact us:
              </p>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p><strong className="text-foreground">{BUSINESS_INFO.name}</strong></p>
                <p>Email: <a href={`mailto:${BUSINESS_INFO.email}`} className="text-gold hover:underline">{BUSINESS_INFO.email}</a></p>
                <p>Phone: <a href={`tel:+${BUSINESS_INFO.whatsapp}`} className="text-gold hover:underline">+91-8072506446</a></p>
                <p>{BUSINESS_INFO.addressLine1}, {BUSINESS_INFO.addressLine2}</p>
              </div>
            </div>

            <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
              Thank you for shopping with Fashion's Fusion. We appreciate your trust and look forward to
              serving you with the latest fashion trends.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
