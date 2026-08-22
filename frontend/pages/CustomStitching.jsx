import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Scissors, Ruler, Shirt, Clock, ShieldCheck, Star } from 'lucide-react';

const features = [
  { icon: Scissors, title: 'Custom Measurements', desc: 'Perfect fit tailored to your exact body measurements.' },
  { icon: Shirt, title: 'Any Design', desc: 'Replicate any design or create your own unique style.' },
  { icon: Ruler, title: 'Fabric Selection', desc: 'Choose from our premium fabrics — silk, cotton, georgette & more.' },
  { icon: Clock, title: 'Timely Delivery', desc: 'We respect your time with guaranteed delivery schedules.' },
  { icon: ShieldCheck, title: 'Quality Guaranteed', desc: 'Every stitch inspected for perfection before delivery.' },
  { icon: Star, title: 'Expert Craftsmanship', desc: '75+ years of tailoring expertise in every garment.' },
];

export default function CustomStitching() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', description: '' });
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
      toast.success('Thank you! We will contact you within 24 hours.');
      setForm({ name: '', email: '', phone: '', description: '' });
    }, 1500);
  };

  return (
    <>
      <Helmet>
        <title>Customized Stitching — Fashion's Fusion</title>
      </Helmet>

      <section className="bg-primary py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-4">
            Bespoke Tailoring
          </span>
          <h1 className="font-heading text-4xl font-bold text-white md:text-6xl lg:text-7xl">
            Customized Dress Stitching
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Your vision, our craftsmanship. Get premium custom-stitched kurtis, suits, and dresses tailored to your exact measurements and style preferences.
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
              <h2 className="font-heading text-3xl font-bold">Why Choose Our Stitching Service?</h2>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {features.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} className="rounded-xl border bg-white p-5 shadow-sm">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10">
                        <Icon className="h-5 w-5 text-gold" />
                      </div>
                      <h3 className="mt-3 font-heading text-base font-bold">{f.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
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
                <h3 className="font-heading text-xl font-bold">Get a Free Quote</h3>
                <p className="mt-1 text-sm text-muted-foreground">Tell us about your requirements and we'll get back to you.</p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="stitch-name">Full Name</Label>
                    <Input id="stitch-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                  </div>
                  <div>
                    <Label htmlFor="stitch-email">Email</Label>
                    <Input id="stitch-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Your email" />
                  </div>
                  <div>
                    <Label htmlFor="stitch-phone">Phone</Label>
                    <Input id="stitch-phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Your phone number" />
                  </div>
                  <div>
                    <Label htmlFor="stitch-desc">Describe Your Requirement</Label>
                    <textarea
                      id="stitch-desc"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Design, fabric preference, measurements, occasion..."
                      className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <Button type="submit" variant="gold" size="lg" className="w-full" disabled={sending}>
                    {sending ? 'Sending...' : 'Send Enquiry'}
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