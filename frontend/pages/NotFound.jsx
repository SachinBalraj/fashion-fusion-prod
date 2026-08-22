import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | Fashion's Fusion</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center"
      >
        {/* Decorative elements */}
        <div className="relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="absolute -top-12 -left-16 h-32 w-32 rounded-full bg-gold/5 blur-2xl"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute -bottom-8 -right-12 h-24 w-24 rounded-full bg-gold/5 blur-2xl"
          />

          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-9xl font-bold text-gold leading-none tracking-tighter select-none"
          >
            404
          </motion.h1>
        </div>

        {/* Illustration */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 0.3 }}
          className="mt-2 mb-8"
        >
          <svg
            width="200"
            height="120"
            viewBox="0 0 200 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-muted-foreground/30"
          >
            <rect x="40" y="20" width="120" height="80" rx="8" stroke="currentColor" strokeWidth="1.5" />
            <path d="M60 50h80M60 65h60M60 80h40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="160" cy="90" r="15" stroke="currentColor" strokeWidth="1.5" />
            <path d="M165 85l-10 10M165 95l-10-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-3xl font-bold font-heading"
        >
          Page Not Found
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-2 max-w-md text-muted-foreground"
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-8"
        >
          <Link to="/">
            <Button variant="gold" size="lg" className="gap-2">
              <Home className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </>
  );
}
