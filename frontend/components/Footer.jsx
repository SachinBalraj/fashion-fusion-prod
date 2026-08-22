import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, MapPin } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaPinterestP, FaYoutube } from 'react-icons/fa';
import { BUSINESS_INFO } from '@/src/constants/businessInfo';

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Products', to: '/products' },
  { label: 'Best Sellers', to: '/products?category=best-sellers' },
  { label: 'New Launch', to: '/products?category=new-launch' },
  { label: 'Contact Us', to: '/contact' },
];

const categories = [
  { label: 'Materials', to: '/products?category=material' },
  { label: 'Premium Shawls', to: '/products?category=premium-shawls' },
  { label: 'Ready-Made Kurtis', to: '/products?category=ready-made-kurtis' },
  { label: 'Hair Accessories', to: '/products?category=hair-accessories' },
  { label: 'Sarees', to: '/products?category=sarees' },
  { label: 'Festive Wear', to: '/products?category=festive-wear' },
  { label: 'Cord Sets', to: '/products?category=cord-sets' },
];

const supportLinks = [
  { label: 'Contact Us', to: '/contact' },
  { label: 'Shipping Policy', to: '/terms-and-conditions' },
  { label: 'Refund & Return Policy', to: '/refund-return-policy' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms & Conditions', to: '/terms-and-conditions' },
  { label: 'Pincode Availability', to: '/pincode-availability' },
];

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com', icon: FaFacebookF },
  { label: 'Instagram', href: 'https://www.instagram.com/fashion.s.fusion', icon: FaInstagram },
  { label: 'Pinterest', href: 'https://pinterest.com', icon: FaPinterestP },
  { label: 'YouTube', href: 'https://youtube.com', icon: FaYoutube },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white/70">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={staggerContainer}
        className="mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8"
      >
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">

          {/* Column 1 – Brand Information */}
          <motion.div variants={fadeUp} className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block" aria-label="Fashion's Fusion Home">
              <span className="font-heading text-xl font-bold tracking-tight text-white">
                Fashion&apos;s Fusion
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              Discover timeless elegance with premium fabrics, handcrafted collections, and fashion that blends tradition with modern style. Every piece is crafted with quality, elegance, and attention to detail.
            </p>

            <div className="mt-6 space-y-3">
              <a
                href={BUSINESS_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View address on Google Maps"
                className="flex items-start gap-3 text-sm text-white/50 transition-colors duration-300 hover:text-[#C9A227]"
              >
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#C9A227]" />
                <span className="leading-relaxed">
                  {BUSINESS_INFO.addressLine1},<br />
                  {BUSINESS_INFO.addressLine2}
                </span>
              </a>
              <a
                href={`mailto:${BUSINESS_INFO.email}`}
                aria-label="Email us"
                className="flex items-center gap-3 text-sm text-white/50 transition-colors duration-300 hover:text-[#C9A227]"
              >
                <Mail className="h-4 w-4 shrink-0 text-[#C9A227]" />
                {BUSINESS_INFO.email}
              </a>
              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="flex items-center gap-3 text-sm text-white/50 transition-colors duration-300 hover:text-[#C9A227]"
              >
                <MessageCircle className="h-4 w-4 shrink-0 text-[#C9A227]" />
                {BUSINESS_INFO.phone}
              </a>
            </div>

            {/* Social Icons */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all duration-300 hover:border-[#C9A227]/40 hover:bg-[#C9A227]/10 hover:text-[#C9A227] hover:scale-110"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                );
              })}
            </div>
          </motion.div>

          {/* Column 2 – Quick Links */}
          <motion.div variants={fadeUp}>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#C9A227]">
              Quick Links
            </h4>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center text-sm text-white/50 transition-all duration-300 hover:text-[#C9A227]"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute bottom-0 left-0 h-px w-0 bg-[#C9A227] transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3 – Categories */}
          <motion.div variants={fadeUp}>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#C9A227]">
              Categories
            </h4>
            <ul className="mt-5 space-y-3">
              {categories.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center text-sm text-white/50 transition-all duration-300 hover:text-[#C9A227]"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute bottom-0 left-0 h-px w-0 bg-[#C9A227] transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4 – Customer Support */}
          <motion.div variants={fadeUp}>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#C9A227]">
              Customer Support
            </h4>
            <ul className="mt-5 space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center text-sm text-white/50 transition-all duration-300 hover:text-[#C9A227]"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute bottom-0 left-0 h-px w-0 bg-[#C9A227] transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <span className="inline-flex items-center text-sm text-white/30 cursor-default">
                  FAQ
                  <span className="ml-2 rounded-full bg-[#C9A227]/10 px-2 py-0.5 text-[10px] font-semibold text-[#C9A227]">
                    Coming Soon
                  </span>
                </span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-14 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-white/40">
              &copy; 2026 Fashion&apos;s Fusion. All Rights Reserved.
            </p>
            <div className="flex flex-col items-center gap-1.5 sm:items-end">
              <p className="text-xs text-white/40">
                Designed &amp; Developed with <span className="text-[#C9A227]">&hearts;</span> by{' '}
                <span className="font-semibold text-[#C9A227]">YesBe</span>
              </p>
              <div className="flex items-center gap-1.5 text-xs">
                {[
                  { label: 'Portfolio', href: 'https://your-portfolio.com' },
                  { label: 'LinkedIn', href: 'https://linkedin.com/in/your-profile' },
                  { label: 'GitHub', href: 'https://github.com/your-username' },
                  { label: 'Email', href: 'mailto:your-email@example.com' },
                ].map((link, i, arr) => (
                  <span key={link.label} className="flex items-center">
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/40 transition-colors duration-300 hover:text-[#C9A227]"
                    >
                      {link.label}
                    </a>
                    {i < arr.length - 1 && (
                      <span className="ml-1.5 text-white/20">|</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
