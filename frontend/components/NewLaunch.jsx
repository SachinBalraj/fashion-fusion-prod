import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import HomeProductCard from './HomeProductCard';
import { allProducts } from '@/services/products';

const newLaunches = allProducts.filter((p) =>
  ['newlaunch-1', 'newlaunch-2', 'newlaunch-3', 'newlaunch-4', 'newlaunch-5', 'newlaunch-6', 'newlaunch-7', 'newlaunch-8'].includes(p.id)
);

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function NewLaunch() {
  return (
    <section className="bg-muted/30 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          subtitle="New Launch"
          title="Latest Arrivals"
          gold
        />
        <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
          Explore our latest arrivals crafted with elegance, premium quality, and timeless fashion.
        </p>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {newLaunches.map((product, index) => (
            <HomeProductCard
              key={product.id}
              product={product}
              badge="New"
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
