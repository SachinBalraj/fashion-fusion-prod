import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SectionHeading from './SectionHeading';
import kurti from '@assets/images/kurti.jpg';
import material from '@assets/images/material.jpg';
import shawl from '@assets/images/shawl.jpg';
import hair from '@assets/images/hair.jpg';

const categories = [
  { name: 'Ready-Made Kurtis', path: '/products?category=ready-made-kurtis', image: kurti, alt: 'Ready-Made Kurtis', desc: 'Elegant handcrafted kurtis for everyday and festive wear.' },
  { name: 'Material', path: '/products?category=material', image: material, alt: 'Material', desc: 'Premium fabrics for custom tailoring and ethnic wear.' },
  { name: 'Premium Shawls', path: '/products?category=premium-shawls', image: shawl, alt: 'Premium Shawls', desc: 'Luxury shawls crafted with timeless elegance.' },
  { name: 'Hair Accessories', path: '/products?category=hair-accessories', image: hair, alt: 'Hair Accessories', desc: 'Stylish accessories to complete your look.' },
  { name: 'Sarees', path: '/products?category=sarees', image: '/images/saree.jpeg', alt: 'Sarees', desc: 'Traditional and contemporary sarees for every occasion.' },
  { name: 'Festive Wear', path: '/products?category=festive-wear', image: '/images/readymadekurthi5.jpeg', alt: 'Festive Wear', desc: 'Exclusive festive collections with premium craftsmanship.' },
  { name: 'Cord Sets', path: '/products?category=cord-sets', image: '/images/readymadekurthi11.jpeg', alt: 'Cord Sets', desc: 'Modern coordinated outfits for effortless style.' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function CategorySection() {
  return (
    <section className="bg-background px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading subtitle="Collections" title="Shop by Category" gold />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {categories.map((cat) => (
            <motion.div key={cat.name} variants={itemVariants}>
              <Link
                to={cat.path}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.alt}
                    width="600"
                    height="450"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-heading text-xl font-bold text-primary">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {cat.desc}
                  </p>
                  <div className="mt-auto pt-4">
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary transition-all duration-300 group-hover:border-[#C9A227] group-hover:bg-[#C9A227] group-hover:text-white">
                      Explore
                      <span className="text-lg leading-none">&rarr;</span>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
