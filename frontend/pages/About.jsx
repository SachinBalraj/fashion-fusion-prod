import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ChevronDown } from 'lucide-react';
import logo from '@assets/images/logo.png';

const sections = [
  {
    id: 'vision',
    number: '01',
    title: 'Our Vision',
    content:
      "At Fashion's Fusion, our vision is to become a trusted destination for fashion that celebrates individuality, confidence, and elegance. We strive to inspire people to express their unique style through trend-forward, high-quality, and affordable clothing. By blending timeless fashion with modern trends, we aim to create a shopping experience that empowers every customer to look and feel their absolute best.",
  },
  {
    id: 'mission',
    number: '02',
    title: 'Mission Statement',
    content:
      "Our mission is to inspire confidence through fashion by offering thoughtfully curated collections that blend elegance, quality, and affordability. We are dedicated to delivering exceptional products and memorable shopping experiences, helping every customer embrace their individuality and make a lasting impression with every outfit they wear.",
  },
  {
    id: 'usp',
    number: '03',
    title: 'USP \u2013 Unique Selling Proposition',
    items: [
      { icon: '\uD83D\uDC57', label: 'Trend-Driven Collections', desc: 'Stay ahead with the latest fashion inspired by global trends.' },
      { icon: '\uD83D\uDC8E', label: 'Premium Quality', desc: 'Carefully crafted apparel that offers style, comfort, and durability.' },
      { icon: '\uD83D\uDCB0', label: 'Affordable Luxury', desc: 'Fashionable designs at prices that suit every budget.' },
      { icon: '\uD83C\uDF1F', label: 'Unique & Versatile Styles', desc: 'Perfect outfits for every occasion, mood, and personality.' },
      { icon: '\u2764\uFE0F', label: 'Customer-First Experience', desc: 'Dedicated to exceptional service and complete customer satisfaction.' },
      { icon: '\uD83D\uDD04', label: 'Fresh New Arrivals', desc: 'Regularly updated collections to keep your wardrobe fashionable all year round.' },
    ],
  },
];

export default function About() {
  const [openId, setOpenId] = useState(null);

  const toggle = useCallback(
    (id) => setOpenId((prev) => (prev === id ? null : id)),
    [],
  );

  const handleKeyDown = useCallback(
    (e, id) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(id);
      }
    },
    [toggle],
  );

  return (
    <>
      <Helmet>
        <title>About Us - Fashion's Fusion</title>
      </Helmet>

      <section className="bg-[#FAF8F5] px-4 pt-[120px] pb-24 md:px-6 md:pt-[140px] md:pb-32">
        <div className="mx-auto max-w-3xl">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-12 flex justify-center md:mb-14"
          >
            <img
              src={logo}
              alt="Fashion's Fusion Logo"
              className="h-auto w-[140px] md:w-[180px] lg:w-[220px]"
            />
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            className="mb-16 text-center md:mb-20"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A227]">
              About Us
            </span>
            <h1 className="mt-6 font-heading text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl md:text-5xl lg:text-6xl">
              Discover the Story Behind Fashion&apos;s Fusion
            </h1>
            <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#C9A227]" />
            <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Fashion&apos;s Fusion is dedicated to delivering timeless fashion with modern elegance.
              We believe every individual deserves to express their unique personality through
              premium-quality, affordable, and trend-forward collections.
            </p>
          </motion.div>

          {/* Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            className="space-y-4"
          >
            {sections.map((section) => {
              const isOpen = openId === section.id;
              return (
                <div
                  key={section.id}
                  className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                    isOpen
                      ? 'border-[#C9A227]/40 bg-white shadow-lg shadow-[#C9A227]/5'
                      : 'border-border bg-white shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Trigger */}
                  <button
                    type="button"
                    onClick={() => toggle(section.id)}
                    onKeyDown={(e) => handleKeyDown(e, section.id)}
                    aria-expanded={isOpen}
                    aria-controls={`about-panel-${section.id}`}
                    className={`flex w-full items-center gap-4 px-6 py-5 text-left transition-colors duration-200 md:px-8 md:py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2 ${
                      isOpen ? 'bg-[#C9A227]/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-300 md:h-12 md:w-12 md:text-base ${
                        isOpen
                          ? 'bg-[#C9A227] text-white'
                          : 'bg-[#C9A227]/10 text-[#C9A227]'
                      }`}
                    >
                      {section.number}
                    </span>
                    <h2
                      className={`flex-1 font-heading text-base font-bold tracking-tight md:text-lg lg:text-xl ${
                        isOpen ? 'text-[#C9A227]' : 'text-primary'
                      }`}
                    >
                      {section.title}
                    </h2>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-colors duration-200 ${
                          isOpen ? 'text-[#C9A227]' : 'text-muted-foreground'
                        }`}
                      />
                    </motion.span>
                  </button>

                  {/* Panel */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`about-panel-${section.id}`}
                        role="region"
                        aria-labelledby={`about-heading-${section.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/60 px-6 pt-6 pb-7 md:px-8 md:pt-7 md:pb-8">
                          {section.content && (
                            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                              {section.content}
                            </p>
                          )}

                          {section.items && (
                            <div className="grid gap-4 sm:grid-cols-2">
                              {section.items.map((item) => (
                                <div
                                  key={item.label}
                                  className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 transition-colors duration-200 hover:border-[#C9A227]/30 hover:bg-[#C9A227]/5"
                                >
                                  <span className="mt-0.5 text-lg leading-none">{item.icon}</span>
                                  <div>
                                    <p className="text-sm font-semibold text-primary">
                                      {item.label}
                                    </p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground md:text-sm">
                                      {item.desc}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>

          {/* Closing CTA */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 text-center font-heading text-lg font-bold text-[#C9A227] md:text-xl"
          >
            Fashion&apos;s Fusion &ndash; Where Quality Meets Confidence.
          </motion.p>
        </div>
      </section>
    </>
  );
}
