import { motion } from 'framer-motion';
import { Star, ShieldCheck } from 'lucide-react';
import SectionHeading from './SectionHeading';

const testimonials = [
  { name: 'Priya Sharma', avatar: null, rating: 5, text: 'The silk kurti I ordered is absolutely gorgeous! The fabric quality is outstanding and the stitching is flawless. Received so many compliments at the family gathering.', verified: true, purchaseItem: 'Silk Kurti' },
  { name: 'Ananya Gupta', avatar: null, rating: 5, text: 'I ordered a custom-stitched dress and it fits like a dream. The team understood exactly what I wanted. Exceptional craftsmanship and attention to detail.', verified: true, purchaseItem: 'Custom Stitched Dress' },
  { name: 'Riya Patel', avatar: null, rating: 5, text: 'The premium shawl collection is breathtaking. So soft, elegant, and the embroidery work is exquisite. Perfect for festive occasions.', verified: true, purchaseItem: 'Embroidered Shawl' },
  { name: 'Neha Verma', avatar: null, rating: 5, text: 'Finally found a brand that truly understands women\'s fashion. The kurtis are comfortable yet stylish, perfect for both office and festive wear. Will definitely order again!', verified: true, purchaseItem: 'Cotton Kurti Set' },
  { name: 'Kavita Reddy', avatar: null, rating: 5, text: 'The hair accessories collection is amazing! Such unique designs and premium quality. My daughter loves them too. Fast delivery and beautiful packaging!', verified: true, purchaseItem: 'Hair Accessories Set' },
  { name: 'Meera Joshi', avatar: null, rating: 5, text: 'Ordered bulk kurtis for my boutique and the wholesale experience was seamless. Premium quality at great prices. My customers are in love with the collection!', verified: true, purchaseItem: 'Wholesale Kurtis Order' },
];

export default function Testimonials() {
  return (
    <section className="bg-background px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading subtitle="Reviews" title="What Our Customers Say" gold />
        <div className="mt-4 flex gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex w-80 flex-shrink-0 gap-4 rounded-2xl border bg-white p-6 shadow-sm lg:w-96"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gold/10 font-heading text-lg font-bold text-gold">
                {item.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-heading text-sm font-bold text-primary">{item.name}</h4>
                  {item.verified && (
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="mt-1 flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < item.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm italic leading-relaxed text-muted-foreground">
                  &ldquo;{item.text}&rdquo;
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Purchased: {item.purchaseItem}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
