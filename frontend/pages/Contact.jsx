import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, MapPin, Clock } from 'lucide-react';
import { BUSINESS_INFO } from '@/src/constants/businessInfo';

const WHATSAPP_URL = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(`Hello ${BUSINESS_INFO.name},%0A%0AI%20visited%20your%20website%20and%20I%27m%20interested%20in%20your%20products.%20Could%20you%20please%20provide%20more%20information%3F`)}`;

function WhatsAppIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const contactInfo = [
  { isWhatsApp: true, icon: WhatsAppIcon, title: 'WhatsApp Us', content: BUSINESS_INFO.phone, detail: 'Monday – Saturday, 9:00 AM – 7:00 PM', href: WHATSAPP_URL },
  { icon: Mail, title: 'Email Us', content: BUSINESS_INFO.email, detail: 'We typically reply within 24 hours.', href: `mailto:${BUSINESS_INFO.email}` },
  { icon: MapPin, title: 'Visit Us', content: `${BUSINESS_INFO.name}\n${BUSINESS_INFO.addressLine1}\n${BUSINESS_INFO.addressLine2}`, detail: '' },
  { icon: Clock, title: 'Business Hours', content: 'Monday – Saturday', detail: '9:00 AM – 7:00 PM' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('Please enter your full name.'); return; }
    if (!form.email) { toast.error('Please enter your email address.'); return; }
    if (!validateEmail(form.email)) { toast.error('Please enter a valid email address.'); return; }
    if (!form.subject) { toast.error('Please enter a subject.'); return; }
    if (!form.message) { toast.error('Please enter your message.'); return; }

    const message = `
Hello Fashion's Fusion,

I would like to contact you.

Name: ${form.name}

Email: ${form.email}

Subject: ${form.subject}

Message:
${form.message}

Thank you.
`;

    setSending(true);
    toast.success('Redirecting to WhatsApp...');
    window.open(`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
    timerRef.current = setTimeout(() => {
      setSending(false);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us — Fashion's Fusion</title>
      </Helmet>

      <section className="bg-primary py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-4">
            Get in Touch
          </span>
          <h1 className="font-heading text-4xl font-bold text-white md:text-6xl lg:text-7xl">
            We'd Love to Hear From You
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Have a question about our collections, stitching services, or wholesale orders? We're here to help.
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
              <h2 className="font-heading text-3xl font-bold">Contact Information</h2>
              <p className="mt-3 text-muted-foreground">Reach out to us through any of these channels.</p>
              <div className="mt-8 space-y-6">
                {contactInfo.map((item) => {
                  const Icon = item.icon;
                  const isAddress = item.icon === MapPin;
                  const isWhatsApp = item.isWhatsApp;

                  if (isWhatsApp) {
                    return (
                      <a
                        key={item.title}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Chat with Fashion's Fusion on WhatsApp"
                        className="group flex items-start gap-4 rounded-xl p-4 transition-all duration-300 hover:bg-green-50 hover:shadow-md cursor-pointer"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/10 transition-colors duration-300 group-hover:bg-[#25D366]/10">
                          <Icon className="h-5 w-5 text-gold transition-colors duration-300 group-hover:text-[#25D366]" />
                        </div>
                        <div>
                          <h3 className="font-heading text-sm font-bold">{item.title}</h3>
                          <p className="text-sm text-foreground transition-colors duration-300 group-hover:text-[#25D366]">
                            {item.content}
                          </p>
                          {item.detail && <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>}
                        </div>
                      </a>
                    );
                  }

                  return (
                    <div key={item.title} className="flex items-start gap-4 rounded-xl p-4 transition-all duration-300 hover:bg-muted/50 hover:shadow-md">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                        <Icon className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <h3 className="font-heading text-sm font-bold">{item.title}</h3>
                        {item.href ? (
                          <a href={item.href} className="text-sm text-foreground hover:text-gold transition-colors">
                            {item.content}
                          </a>
                        ) : isAddress ? (
                          <p className="text-sm text-foreground whitespace-pre-line">{item.content}</p>
                        ) : (
                          <p className="text-sm text-foreground">{item.content}</p>
                        )}
                        {item.detail && <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>}
                        {item.title === 'Business Hours' && (
                          <p className="text-xs text-muted-foreground mt-0.5">Sunday — Closed</p>
                        )}
                      </div>
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
                <h3 className="font-heading text-xl font-bold">Send Us a Message</h3>
                <p className="mt-1 text-sm text-muted-foreground">We typically respond within 24 hours.</p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-name">Full Name</Label>
                      <Input id="contact-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Email</Label>
                      <Input id="contact-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Your email" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contact-subject">Subject</Label>
                    <Input id="contact-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" />
                  </div>
                  <div>
                    <Label htmlFor="contact-message">Message</Label>
                    <textarea
                      id="contact-message"
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us more about your enquiry..."
                      className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <Button type="submit" variant="gold" size="lg" className="w-full" disabled={sending}>
                    {sending ? 'Sending...' : 'Send Message'}
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