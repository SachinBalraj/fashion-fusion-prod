import { motion } from 'framer-motion';
import { Award, ShieldCheck, Scissors, Package, HeadphonesIcon, Leaf, Star, Truck } from 'lucide-react';
import SectionHeading from './SectionHeading';

const reasons = [
  { icon: Award, title: '75+ Years of Heritage', description: 'Generations of craftsmanship in raw silk manufacturing passed down through decades of dedication.' },
  { icon: ShieldCheck, title: 'Premium Quality Fabrics', description: 'Carefully selected silk, cotton, georgette, and linen — uncompromising quality in every women\'s garment.' },
  { icon: Leaf, title: 'Elegant & Timeless Designs', description: 'Collections designed exclusively for women, blending traditional heritage with contemporary trends.' },
  { icon: Scissors, title: 'Customized Stitching', description: 'Tailored dress stitching services designed to your exact measurements and preferences.' },
  { icon: Package, title: 'Bulk & Wholesale Solutions', description: 'Specialized orders for boutiques, resellers, events, institutions, and corporate needs.' },
  { icon: Star, title: 'Affordable Luxury', description: 'Premium fashion accessible to all without compromising on quality or trust.' },
  { icon: HeadphonesIcon, title: 'Trusted Customer Support', description: 'Personalized service because every customer is part of our journey.' },
  { icon: Truck, title: 'Reliable Nationwide Delivery', description: 'Every order carefully packed with love and attention.' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function WhyChooseUs() {
  return (
    <section className="bg-muted/30 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading subtitle="Why Us" title="Why Choose Fashion's Fusion" gold />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {reasons.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                  <Icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold text-primary">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
