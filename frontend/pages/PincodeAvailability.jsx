import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, Truck, Clock, AlertTriangle } from 'lucide-react';
import { BUSINESS_INFO } from '@/src/constants/businessInfo';

const deliveryTimelines = [
  { area: 'Metro Cities', time: '2–5 Business Days', icon: Truck },
  { area: 'Tier 2 & Tier 3 Cities', time: '3–7 Business Days', icon: Truck },
  { area: 'Remote & Rural Areas', time: '5–10 Business Days', icon: Truck },
];

export default function PincodeAvailability() {
  return (
    <>
      <Helmet>
        <title>Pincode Availability — Fashion's Fusion</title>
        <meta name="description" content="Check delivery availability for your pincode. Fashion's Fusion delivers across most serviceable pincodes in India." />
        <link rel="canonical" href="https://fashionsfusion.com/pincode-availability" />
        <meta property="og:title" content="Pincode Availability — Fashion's Fusion" />
        <meta property="og:description" content="Check delivery availability for your pincode. Fashion's Fusion delivers across most serviceable pincodes in India." />
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
            Shipping
          </span>
          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">
            Pincode Availability
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            We deliver your favorite fashion products safely and on time across India.
          </p>
        </motion.div>
      </section>

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1.5 py-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="transition-colors hover:text-gold">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Pincode Availability</span>
        </nav>
      </div>

      {/* Content */}
      <section className="bg-background px-4 pb-20 md:px-6 md:pb-28">
        <div className="mx-auto max-w-4xl space-y-8">

          {/* Delivery Coverage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border bg-white p-6 shadow-sm sm:p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <MapPin className="h-6 w-6 text-gold" />
              </div>
              <h2 className="font-heading text-xl font-bold text-foreground">Delivery Coverage</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                We currently deliver to most serviceable pincodes across India.
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                Delivery availability depends on the service coverage of our courier partners.
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                Some remote or restricted locations may have limited or no delivery service.
              </li>
            </ul>
          </motion.div>

          {/* How to Check */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-2xl border bg-white p-6 shadow-sm sm:p-10"
          >
            <h2 className="font-heading text-xl font-bold text-foreground">How to Check Pincode Availability</h2>
            <div className="mt-1 h-0.5 w-10 rounded-full bg-gold/40" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Before placing your order, you can enter your 6-digit pincode on the product page or during
              checkout. If your location is serviceable, the estimated delivery date and available shipping
              options will be displayed.
            </p>
          </motion.div>

          {/* Delivery Timelines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="rounded-2xl border bg-white p-6 shadow-sm sm:p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <Clock className="h-6 w-6 text-gold" />
              </div>
              <h2 className="font-heading text-xl font-bold text-foreground">Estimated Delivery Time</h2>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">Delivery timelines may vary depending on your location:</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {deliveryTimelines.map((item) => (
                <div key={item.area} className="rounded-xl bg-secondary/50 p-5 text-center">
                  <item.icon className="mx-auto h-8 w-8 text-gold" />
                  <h3 className="mt-3 font-heading text-sm font-bold text-foreground">{item.area}</h3>
                  <p className="mt-1 text-sm font-semibold text-gold">{item.time}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs italic text-muted-foreground/80">
              Please note that delivery times are estimates and may vary due to weather conditions, public
              holidays, courier delays, or other unforeseen circumstances.
            </p>
          </motion.div>

          {/* Shipping Charges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl border bg-white p-6 shadow-sm sm:p-10"
          >
            <h2 className="font-heading text-xl font-bold text-foreground">Shipping Charges</h2>
            <div className="mt-1 h-0.5 w-10 rounded-full bg-gold/40" />
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                Shipping charges, if applicable, will be displayed during checkout before payment.
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                We may offer Free Shipping on eligible orders as part of promotional offers or based on a minimum order value.
              </li>
            </ul>
          </motion.div>

          {/* Non-Serviceable */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="rounded-2xl border bg-white p-6 shadow-sm sm:p-10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <AlertTriangle className="h-6 w-6 text-gold" />
              </div>
              <h2 className="font-heading text-xl font-bold text-foreground">Non-Serviceable Pincodes</h2>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">If your pincode is currently not serviceable:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                You may not be able to place an order online.
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                We continuously expand our delivery network and encourage you to check again in the future.
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                You may also contact our customer support team for assistance.
              </li>
            </ul>
          </motion.div>

          {/* Other Policies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-2xl border bg-white p-6 shadow-sm sm:p-10"
          >
            <h2 className="font-heading text-xl font-bold text-foreground">Additional Information</h2>
            <div className="mt-1 h-0.5 w-10 rounded-full bg-gold/40" />
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">Incorrect Pincode</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Customers are responsible for entering the correct delivery pincode and address while
                  placing an order. Fashion's Fusion will not be responsible for delays or failed deliveries
                  due to incorrect or incomplete address details provided by the customer.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">Order Tracking</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Once your order is shipped, you will receive a tracking ID via SMS and/or email. You can
                  use the tracking link to monitor your shipment until it is delivered.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">Delivery Attempts</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Our courier partners will typically make 2–3 delivery attempts. If the delivery cannot be
                  completed due to customer unavailability or an incorrect address, the order may be returned
                  to our warehouse.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="rounded-2xl border bg-white p-6 shadow-sm sm:p-10"
          >
            <h3 className="font-heading text-base font-bold text-foreground">Contact Us</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              If you have any questions regarding pincode availability or shipping, please contact us:
            </p>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p><strong className="text-foreground">{BUSINESS_INFO.name}</strong></p>
              <p>Email: <a href={`mailto:${BUSINESS_INFO.email}`} className="text-gold hover:underline">{BUSINESS_INFO.email}</a></p>
              <p>Phone: <a href={`tel:+${BUSINESS_INFO.whatsapp}`} className="text-gold hover:underline">+91-8072506446</a></p>
              <p>{BUSINESS_INFO.addressLine1}, {BUSINESS_INFO.addressLine2}</p>
            </div>
            <p className="mt-6 text-sm font-medium text-muted-foreground">
              Thank you for choosing Fashion's Fusion. We are dedicated to delivering the latest fashion
              to your doorstep with reliable and efficient shipping services.
            </p>
          </motion.div>

        </div>
      </section>
    </>
  );
}
