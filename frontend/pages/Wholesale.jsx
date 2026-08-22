import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Package, Building2, Truck, BadgePercent, ShieldCheck, Users } from 'lucide-react';

const benefits = [
  { icon: Package, title: 'Bulk Orders', desc: 'Premium kurtis, shawls, and accessories at wholesale prices.' },
  { icon: Building2, title: 'For Boutiques & Resellers', desc: 'Exclusive collections to grow your business.' },
  { icon: Truck, title: 'Pan-India Delivery', desc: 'Reliable bulk shipping to any location in India.' },
  { icon: BadgePercent, title: 'Special Pricing', desc: 'Tiered discounts based on order volume.' },
  { icon: ShieldCheck, title: 'Quality Assurance', desc: 'Every piece inspected before bulk dispatch.' },
  { icon: Users, title: 'Dedicated Support', desc: 'Personal account manager for all wholesale clients.' },
];

export default function Wholesale() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', business: '', message: '' });
  const [sending, setSending] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error('Please fill in your contact details');
      return;
    }
    setSending(true);
    timerRef.current = setTimeout(() => {
      setSending(false);
      toast.success('Thank you! Our wholesale team will contact you shortly.');
      setForm({ name: '', email: '', phone: '', business: '', message: '' });
    }, 1500);
  };

  return (
    <>
      <Helmet>
        <title>Wholesale — Fashion's Fusion</title>
      </Helmet>

      <section className="bg-primary py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-4">
            Bulk & Wholesale
          </span>
          <h1 className="font-heading text-4xl font-bold text-white md:text-6xl lg:text-7xl">
            Wholesale Orders
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Premium women's fashion collections for boutiques, resellers, events, and corporate gifting — backed by 75+ years of manufacturing excellence.
          </p>
        </motion.div>
      </section>

      <section className="bg-background px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-3xl font-bold">Why Partner With Us?</h2>
              <p className="mt-3 text-muted-foreground">Join 500+ boutiques and resellers who trust Fashion's Fusion for their inventory needs.</p>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {benefits.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div key={b.title} className="rounded-xl border bg-white p-5 shadow-sm">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10">
                        <Icon className="h-5 w-5 text-gold" />
                      </div>
                      <h3 className="mt-3 font-heading text-base font-bold">{b.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="rounded-2xl border bg-white p-8 shadow-sm">
                <h3 className="font-heading text-xl font-bold">Request Wholesale Pricing</h3>
                <p className="mt-1 text-sm text-muted-foreground">Fill in your details and our team will share our wholesale catalog and pricing.</p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="ws-name">Full Name</Label>
                    <Input id="ws-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ws-email">Email</Label>
                      <Input id="ws-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Your email" />
                    </div>
                    <div>
                      <Label htmlFor="ws-phone">Phone</Label>
                      <Input id="ws-phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ws-business">Business Name</Label>
                    <Input id="ws-business" value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} placeholder="Your boutique / business name" />
                  </div>
                  <div>
                    <Label htmlFor="ws-message">Requirements</Label>
                    <textarea
                      id="ws-message"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your requirements — quantity, products, timeline..."
                      className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <Button type="submit" variant="gold" size="lg" className="w-full" disabled={sending}>
                    {sending ? 'Sending...' : 'Get Wholesale Pricing'}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}