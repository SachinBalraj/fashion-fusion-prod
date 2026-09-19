import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import HomeProductCard from './HomeProductCard';
import { fetchCatalog } from '@/services/products';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function NewLaunch() {
  const { data } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: () => fetchCatalog({ isNewArrival: true, limit: 8 }),
  });

  const newLaunches = data?.products || [];

  if (newLaunches.length === 0) return null;

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