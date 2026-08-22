import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { BUSINESS_INFO } from '@/src/constants/businessInfo';

const sections = [
  {
    title: 'Return Eligibility',
    content:
      'You may request a return if the product is returned within 7 days of the delivery date, the item is unused, unwashed, unworn, and in its original condition, all original tags, labels, invoices, and packaging are intact, and the product is not listed under the non-returnable category.',
    note: 'Fashion\'s Fusion reserves the right to reject returns that do not meet these conditions.',
  },
  {
    title: 'Exchange Policy',
    content:
      'We offer exchanges in the following cases: incorrect size received, wrong product delivered, and product received is damaged or defective. Exchange requests must be initiated within 7 days of receiving the order. Exchanges are subject to stock availability.',
  },
  {
    title: 'Non-Returnable Items',
    list: [
      'Products purchased during clearance or final sale.',
      'Gift cards or promotional items.',
      'Customized or personalized products.',
      'Innerwear or hygiene-sensitive products (if applicable).',
      'Products returned without original tags or packaging.',
    ],
  },
  {
    title: 'Refund Process',
    content:
      'Once your returned item is received and inspected, you will receive an email or SMS confirming the status of your refund. Approved refunds will be processed to the original payment method within 5–7 business days. For Cash on Delivery (COD) orders, refunds will be processed via bank transfer or UPI after verification of your account details.',
    note: 'Please note that the time taken for the refund to reflect in your account may vary depending on your bank or payment provider.',
  },
  {
    title: 'Order Cancellation',
    content:
      'Orders can be cancelled only before they are dispatched from our warehouse. Once an order has been shipped, it cannot be cancelled. You may request a return after delivery if it meets the return eligibility criteria.',
  },
  {
    title: 'Damaged or Incorrect Products',
    content:
      'If you receive a damaged, defective, or incorrect item, contact our customer support within 48 hours of delivery. Share your order number along with clear photos or videos of the product and packaging. After verification, we will arrange a replacement or process a refund at no additional cost.',
  },
  {
    title: 'Return Shipping',
    content:
      "If the return is due to our error (wrong, damaged, or defective product), Fashion's Fusion will bear the return shipping cost. For returns due to customer preference (such as size or style change), return shipping charges may apply, depending on our return policy.",
  },
  {
    title: 'Late or Missing Refunds',
    content:
      'If you have not received your refund after the stated processing period, first check your bank account or payment method, then contact your bank or payment provider, as processing times may vary. If the issue persists, contact our customer support for assistance.',
  },
];

export default function RefundReturnPolicy() {
  return (
    <>
      <Helmet>
        <title>Refund & Return Policy — Fashion's Fusion</title>
        <meta name="description" content="Read the Refund & Return Policy for Fashion's Fusion products. Learn about return eligibility, refund process, and exchange policies." />
        <link rel="canonical" href="https://fashionsfusion.com/refund-return-policy" />
        <meta property="og:title" content="Refund & Return Policy — Fashion's Fusion" />
        <meta property="og:description" content="Read the Refund & Return Policy for Fashion's Fusion products. Learn about return eligibility, refund process, and exchange policies." />
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
            Refund & Return Policy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            We strive to provide high-quality clothing. If you're not completely satisfied, we're here to help.
          </p>
        </motion.div>
      </section>

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1.5 py-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="transition-colors hover:text-gold">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Refund & Return Policy</span>
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
                <RotateCcw className="h-6 w-6 text-gold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Effective Date</p>
                <p className="font-heading text-sm font-bold">January 1, 2025</p>
              </div>
            </div>

            <p className="mb-8 leading-relaxed text-muted-foreground">
              At Fashion's Fusion, we strive to provide high-quality clothing and an exceptional shopping
              experience. If you're not completely satisfied with your purchase, we're here to help.
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
                  {section.note && (
                    <p className="mt-2 text-sm italic text-muted-foreground/80">{section.note}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Info */}
            <div className="mt-10 rounded-xl bg-secondary/50 p-6">
              <h3 className="font-heading text-base font-bold text-foreground">Contact Us</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                For any return, exchange, or refund-related queries, please contact us:
              </p>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p><strong className="text-foreground">{BUSINESS_INFO.name}</strong></p>
                <p>Email: <a href={`mailto:${BUSINESS_INFO.email}`} className="text-gold hover:underline">{BUSINESS_INFO.email}</a></p>
                <p>Phone: <a href={`tel:+${BUSINESS_INFO.whatsapp}`} className="text-gold hover:underline">+91-8072506446</a></p>
                <p>{BUSINESS_INFO.addressLine1}, {BUSINESS_INFO.addressLine2}</p>
              </div>
            </div>

            <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
              We appreciate your trust in Fashion's Fusion and are committed to ensuring a smooth and
              hassle-free shopping experience.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
