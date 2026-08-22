import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import HomeProductCard from './HomeProductCard';
import { allProducts } from '@/services/products';

const bestSellerIds = ['shw-01', 'shw-02', 'mat-01', 'mat-02', 'kur-01', 'mat-03'];

const bestSellers = bestSellerIds
  .map((id) => allProducts.find((p) => p.id === id))
  .filter(Boolean);

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function BestSellers() {
  return (
    <section className="bg-background px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          subtitle="Best Sellers"
          title="Most Loved by Customers"
          gold
        />
        <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
          Discover our most loved products, handpicked by customers for their quality, style, and craftsmanship.
        </p>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {bestSellers.map((product, index) => (
            <HomeProductCard
              key={product.id}
              product={product}
              badge="Best Seller"
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
