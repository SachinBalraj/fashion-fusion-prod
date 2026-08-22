import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ChevronRight, Mail, Phone, MapPin, Clock, ExternalLink } from 'lucide-react';
import { BUSINESS_INFO } from '@/src/constants/businessInfo';

const contactDetails = [
  {
    icon: Mail,
    title: 'Email',
    value: BUSINESS_INFO.email,
    href: `mailto:${BUSINESS_INFO.email}`,
  },
  {
    icon: Phone,
    title: 'Phone',
    value: BUSINESS_INFO.phone,
    href: `tel:+${BUSINESS_INFO.whatsapp}`,
  },
  {
    icon: MapPin,
    title: 'Business Address',
    value: `${BUSINESS_INFO.addressLine1}, ${BUSINESS_INFO.addressLine2}`,
    href: null,
  },
  {
    icon: Clock,
    title: 'Business Hours',
    value: 'Monday – Saturday, 9:00 AM – 7:00 PM',
    sub: 'Sunday — Closed',
    href: null,
  },
];

export default function ContactUs() {
  return (
    <>
      <Helmet>
        <title>Contact Us — Fashion's Fusion</title>
        <meta name="description" content="Get in touch with Fashion's Fusion. Reach us via email, phone, or visit our store in Salem, Tamil Nadu." />
        <link rel="canonical" href="https://fashionsfusion.com/contact-us" />
        <meta property="og:title" content="Contact Us — Fashion's Fusion" />
        <meta property="og:description" content="Get in touch with Fashion's Fusion. Reach us via email, phone, or visit our store in Salem, Tamil Nadu." />
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
            Support
          </span>
          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            Have a question about our collections, stitching services, or wholesale orders? We're here to help.
          </p>
        </motion.div>
      </section>

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1.5 py-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="transition-colors hover:text-gold">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Contact Us</span>
        </nav>
      </div>

      {/* Content */}
      <section className="bg-background px-4 pb-20 md:px-6 md:pb-28">
        <div className="mx-auto max-w-4xl space-y-8">

          {/* Contact Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border bg-white p-6 shadow-sm sm:p-10"
          >
            <h2 className="font-heading text-xl font-bold text-foreground">Get in Touch</h2>
            <div className="mt-1 h-0.5 w-10 rounded-full bg-gold/40" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {contactDetails.map((item) => (
                <div key={item.title} className="flex items-start gap-4 rounded-xl bg-secondary/50 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                    <item.icon className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-foreground">{item.title}</h3>
                    {item.href ? (
                      <a href={item.href} className="mt-1 block text-sm text-muted-foreground transition-colors hover:text-gold">
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">{item.value}</p>
                    )}
                    {item.sub && <p className="mt-0.5 text-xs text-muted-foreground">{item.sub}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Map Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-2xl border bg-white p-6 shadow-sm sm:p-10"
          >
            <h2 className="font-heading text-xl font-bold text-foreground">Find Us</h2>
            <div className="mt-1 h-0.5 w-10 rounded-full bg-gold/40" />
            <div className="mt-6 overflow-hidden rounded-xl border bg-secondary/30">
              <iframe
                title="Fashion's Fusion Location"
                src="https://www.google.com/maps?q=Ellampillai,+Salem,+Tamil+Nadu+637502&output=embed"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              {BUSINESS_INFO.addressLine1}, {BUSINESS_INFO.addressLine2}
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl border bg-white p-6 shadow-sm sm:p-10"
          >
            <h2 className="font-heading text-xl font-bold text-foreground">Helpful Links</h2>
            <div className="mt-1 h-0.5 w-10 rounded-full bg-gold/40" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Link to="/terms-and-conditions" className="group flex items-center gap-3 rounded-xl bg-secondary/50 p-4 transition-colors hover:bg-gold/10">
                <ExternalLink className="h-4 w-4 shrink-0 text-gold" />
                <span className="text-sm font-medium text-foreground transition-colors group-hover:text-gold">Terms & Conditions</span>
              </Link>
              <Link to="/privacy-policy" className="group flex items-center gap-3 rounded-xl bg-secondary/50 p-4 transition-colors hover:bg-gold/10">
                <ExternalLink className="h-4 w-4 shrink-0 text-gold" />
                <span className="text-sm font-medium text-foreground transition-colors group-hover:text-gold">Privacy Policy</span>
              </Link>
              <Link to="/refund-return-policy" className="group flex items-center gap-3 rounded-xl bg-secondary/50 p-4 transition-colors hover:bg-gold/10">
                <ExternalLink className="h-4 w-4 shrink-0 text-gold" />
                <span className="text-sm font-medium text-foreground transition-colors group-hover:text-gold">Refund & Return Policy</span>
              </Link>
              <Link to="/pincode-availability" className="group flex items-center gap-3 rounded-xl bg-secondary/50 p-4 transition-colors hover:bg-gold/10">
                <ExternalLink className="h-4 w-4 shrink-0 text-gold" />
                <span className="text-sm font-medium text-foreground transition-colors group-hover:text-gold">Pincode Availability</span>
              </Link>
            </div>
          </motion.div>

        </div>
      </section>
    </>
  );
}
