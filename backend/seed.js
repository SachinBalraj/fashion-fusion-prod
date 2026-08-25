const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./models/Category');
const Product = require('./models/Product');

const categories = [
  { name: 'Material', slug: 'material', description: 'Premium fabrics and raw materials for stitching and designer wear', order: 1 },
  { name: 'Ready-Made Kurtis', slug: 'ready-made-kurtis', description: 'Stylish ready-to-wear kurtis for every occasion', order: 2 },
  { name: 'Premium Shawls', slug: 'premium-shawls', description: 'Luxurious shawls crafted with premium materials', order: 3 },
  { name: 'Hair Accessories', slug: 'hair-accessories', description: 'Elegant hair accessories to complete your look', order: 4 },
  { name: 'Sarees', slug: 'sarees', description: 'Exquisite sarees for every occasion and celebration', order: 5 },
  { name: 'Festive Wear', slug: 'festive-wear', description: 'Stunning festive collections for celebrations and special events', order: 6 },
  { name: 'Cord Sets', slug: 'cord-sets', description: 'Trendy co-ord sets for effortless coordinated style', order: 7 },
];

const productData = [
  { name: 'Premium Raw Silk Material', categorySlug: 'material', price: 3999, originalPrice: 5599, stock: 25, description: 'Luxurious raw silk fabric with a natural texture and subtle sheen. Perfect for ethnic wear and designer outfits.', material: 'Raw Silk', gender: 'women', isFeatured: true },
  { name: 'Soft Cotton Material', categorySlug: 'material', price: 2499, originalPrice: null, stock: 40, description: 'Premium quality soft cotton fabric. Breathable, comfortable, and ideal for daily wear kurtis and suits.', material: 'Cotton', gender: 'women' },
  { name: 'Designer Linen Material', categorySlug: 'material', price: 3599, originalPrice: 4799, stock: 20, description: 'Premium linen fabric known for its breathability and natural elegance. Perfect for sustainable fashion.', material: 'Linen', gender: 'women' },
  { name: 'Floral Printed Cotton', categorySlug: 'material', price: 2599, originalPrice: null, stock: 32, description: 'Charming floral print cotton fabric. Fresh and vibrant patterns that bring life to any outfit.', material: 'Cotton', gender: 'women' },
  { name: 'Banarasi Silk Material', categorySlug: 'material', price: 7199, originalPrice: 10399, stock: 10, description: 'Authentic Banarasi silk fabric with traditional zari work. Heirloom-quality fabric for special occasions.', material: 'Silk', gender: 'women', isFeatured: true },
  { name: 'Organza Fabric', categorySlug: 'material', price: 3849, originalPrice: 4799, stock: 20, description: 'Crisp and lightweight organza fabric with a subtle shimmer. Perfect for overlay and designer pieces.', material: 'Organza', gender: 'women' },
  { name: 'Chiffon Material', categorySlug: 'material', price: 3449, originalPrice: 4399, stock: 22, description: 'Sheer and lightweight premium chiffon fabric. Elegant drape with a soft, flowing finish.', material: 'Chiffon', gender: 'women' },
  { name: 'Rayon Material', categorySlug: 'material', price: 2249, originalPrice: 2999, stock: 38, description: 'Soft and smooth rayon fabric with a beautiful drape. Affordable luxury for everyday elegance.', material: 'Rayon', gender: 'women' },
  { name: 'Tissue Silk Fabric', categorySlug: 'material', price: 5849, originalPrice: 7599, stock: 12, description: 'Luxurious tissue silk fabric with a metallic sheen. A stunning choice for festive and bridal wear.', material: 'Silk', gender: 'women', isFeatured: true },
  { name: 'Viscose Fabric', categorySlug: 'material', price: 2649, originalPrice: null, stock: 30, description: 'Premium viscose fabric with a soft hand feel. Breathable and comfortable for all-day wear.', material: 'Viscose', gender: 'women' },
  { name: 'Handloom Cotton', categorySlug: 'material', price: 3149, originalPrice: 3949, stock: 24, description: 'Authentic handloom cotton fabric. Each yard tells a story of traditional craftsmanship and heritage.', material: 'Cotton', gender: 'women' },
  { name: 'Georgette Fabric', categorySlug: 'material', price: 3249, originalPrice: 4399, stock: 35, description: 'Lightweight georgette fabric with a elegant drape. Perfect for flowing kurtis and evening wear.', material: 'Georgette', gender: 'women' },
  { name: 'Embroidered Fabric', categorySlug: 'material', price: 5249, originalPrice: 6799, stock: 18, description: 'Beautifully embroidered fabric with intricate thread work. Adds elegance to any festive ensemble.', material: 'Embroidery', gender: 'women' },
  { name: 'Kalamkari Material', categorySlug: 'material', price: 4449, originalPrice: 5599, stock: 16, description: 'Hand-painted Kalamkari fabric featuring traditional Indian artistry. Each piece is a work of art.', material: 'Cotton', gender: 'women' },
  { name: 'Jacquard Fabric', categorySlug: 'material', price: 4749, originalPrice: 5999, stock: 14, description: 'Exquisite jacquard fabric with woven patterns. Rich texture and premium look for sophisticated outfits.', material: 'Jacquard', gender: 'women' },
  { name: 'Crepe Fabric', categorySlug: 'material', price: 2999, originalPrice: null, stock: 28, description: 'High-quality crepe fabric with a textured finish. Wrinkle-resistant and ideal for office wear.', material: 'Crepe', gender: 'women' },
  { name: 'Wedding Silk Material', categorySlug: 'material', price: 7999, originalPrice: 11999, stock: 8, description: 'Luxurious wedding silk fabric with rich texture and royal finish. The ultimate choice for bridal wear.', material: 'Silk', gender: 'women', isFeatured: true },
  { name: 'Fancy Blended Fabric', categorySlug: 'material', price: 3599, originalPrice: 4399, stock: 26, description: 'Premium blended fabric combining the best of natural and synthetic fibers for durability and comfort.', material: 'Blended', gender: 'women' },
  { name: 'Premium Satin Fabric', categorySlug: 'material', price: 4249, originalPrice: 5549, stock: 18, description: 'Luxurious satin fabric with a smooth, glossy finish. Perfect for evening gowns and special occasion wear.', material: 'Satin', gender: 'women' },
  { name: 'Designer Party Fabric', categorySlug: 'material', price: 5049, originalPrice: 6649, stock: 14, description: 'Stunning designer party fabric with contemporary patterns. Make a statement at your next celebration.', material: 'Designer', gender: 'women' },
  { name: 'Cotton Kurti', categorySlug: 'ready-made-kurtis', price: 3199, originalPrice: 4399, stock: 45, description: 'Classic cotton kurti perfect for daily wear. Comfortable, breathable, and available in vibrant colors.', sizes: ['XS', 'S', 'M', 'L', 'XL'], gender: 'women' },
  { name: 'Printed Kurti', categorySlug: 'ready-made-kurtis', price: 2999, originalPrice: 3949, stock: 42, description: 'Vibrant printed kurti with beautiful patterns. Add a pop of color to your everyday wardrobe.', sizes: ['S', 'M', 'L', 'XL'], gender: 'women' },
  { name: 'Rayon Kurti', categorySlug: 'ready-made-kurtis', price: 2799, originalPrice: 3599, stock: 48, description: 'Soft rayon kurti with a smooth finish. Lightweight and comfortable for warm weather.', sizes: ['XS', 'S', 'M', 'L', 'XL'], gender: 'women' },
  { name: 'Straight Kurti', categorySlug: 'ready-made-kurtis', price: 3599, originalPrice: 4799, stock: 38, description: 'Sleek straight-cut kurti with a modern fit. Versatile styling for both casual and formal settings.', sizes: ['XS', 'S', 'M', 'L', 'XL'], gender: 'women' },
  { name: 'A-Line Kurti', categorySlug: 'ready-made-kurtis', price: 3999, originalPrice: null, stock: 32, description: 'Flattering A-line kurti that complements every body type. Effortless style with comfortable fit.', sizes: ['XS', 'S', 'M', 'L', 'XL'], gender: 'women' },
  { name: 'Anarkali Kurti', categorySlug: 'ready-made-kurtis', price: 4799, originalPrice: 6399, stock: 25, description: 'Flowing Anarkali kurti with a flattering silhouette. A timeless piece for festive celebrations.', sizes: ['S', 'M', 'L', 'XL', 'XXL'], gender: 'women', isFeatured: true },
  { name: 'Silk Kurti', categorySlug: 'ready-made-kurtis', price: 5599, originalPrice: 7199, stock: 30, description: 'Elegant silk kurti with a rich finish. Ideal for office wear and semi-formal occasions.', sizes: ['XS', 'S', 'M', 'L', 'XL'], gender: 'women', isFeatured: true },
  { name: 'Office Wear Kurti', categorySlug: 'ready-made-kurtis', price: 4449, originalPrice: 5599, stock: 28, description: 'Professional kurti designed for the modern workplace. Clean lines and sophisticated styling.', sizes: ['XS', 'S', 'M', 'L', 'XL'], gender: 'women' },
  { name: 'Party Wear Kurti', categorySlug: 'ready-made-kurtis', price: 6399, originalPrice: 8799, stock: 16, description: 'Show-stopping party wear kurti with stunning details. Make a statement at your next celebration.', sizes: ['S', 'M', 'L', 'XL', 'XXL'], gender: 'women', isFeatured: true },
  { name: 'Festive Kurti', categorySlug: 'ready-made-kurtis', price: 5249, originalPrice: 6799, stock: 22, description: 'Celebration-ready kurti with festive embellishments. Perfect for Diwali, Eid, and family gatherings.', sizes: ['XS', 'S', 'M', 'L', 'XL'], gender: 'women' },
  { name: 'Georgette Kurti', categorySlug: 'ready-made-kurtis', price: 4249, originalPrice: 5249, stock: 24, description: 'Elegant georgette kurti with a graceful drape. Flowing fabric that moves beautifully with you.', sizes: ['S', 'M', 'L', 'XL'], gender: 'women' },
  { name: 'Embroidered Kurti', categorySlug: 'ready-made-kurtis', price: 5999, originalPrice: 7999, stock: 18, description: 'Intricately embroidered kurti with delicate thread work. A masterpiece of craftsmanship.', sizes: ['S', 'M', 'L', 'XL', 'XXL'], gender: 'women', isFeatured: true },
  { name: 'Designer Kurti', categorySlug: 'ready-made-kurtis', price: 7199, originalPrice: 9999, stock: 12, description: 'Exclusive designer kurti featuring unique prints and premium finishing. Stand out from the crowd.', sizes: ['S', 'M', 'L', 'XL'], gender: 'women', isFeatured: true },
  { name: 'Casual Kurti', categorySlug: 'ready-made-kurtis', price: 2649, originalPrice: 3449, stock: 50, description: 'Relaxed casual kurti for effortless everyday style. Comfort meets fashion in this versatile piece.', sizes: ['XS', 'S', 'M', 'L', 'XL'], gender: 'women' },
  { name: 'Long Kurti', categorySlug: 'ready-made-kurtis', price: 3949, originalPrice: 4799, stock: 34, description: 'Long-length kurti offering extra coverage and a elegant silhouette. Pair with leggings or palazzos.', sizes: ['XS', 'S', 'M', 'L', 'XL'], gender: 'women' },
  { name: 'Premium Silk Shawl', categorySlug: 'premium-shawls', price: 7199, originalPrice: 10399, stock: 15, description: 'Luxurious silk shawl with a soft, lustrous finish. Lightweight yet warm, perfect for evening wear.', material: 'Silk', gender: 'women', isFeatured: true },
  { name: 'Designer Shawl', categorySlug: 'premium-shawls', price: 9599, originalPrice: 12799, stock: 10, description: 'Exclusive designer shawl featuring intricate patterns and premium craftsmanship. A true style statement.', material: 'Designer', gender: 'women', isFeatured: true },
  { name: 'Wedding Shawl', categorySlug: 'premium-shawls', price: 11999, originalPrice: 15999, stock: 8, description: 'Opulent wedding shawl with rich embroidery and embellishments. The perfect bridal accessory.', material: 'Embroidery', gender: 'women', isFeatured: true },
  { name: 'Cashmere Shawl', categorySlug: 'premium-shawls', price: 15999, originalPrice: 22399, stock: 5, description: 'Ultimate luxury cashmere shawl with buttery-soft texture. The pinnacle of elegance and warmth.', material: 'Cashmere', gender: 'women', isFeatured: true },
  { name: 'Printed Shawl', categorySlug: 'premium-shawls', price: 5599, originalPrice: 7199, stock: 22, description: 'Beautifully printed shawl with vibrant patterns. A versatile accessory that elevates any outfit.', material: 'Wool', gender: 'women' },
  { name: 'Winter Shawl', categorySlug: 'premium-shawls', price: 7599, originalPrice: 9999, stock: 18, description: 'Warm and cozy winter shawl crafted from premium blend. Stay stylish while staying warm.', material: 'Wool Blend', gender: 'women' },
  { name: 'Heart Print Medium Hair Bow', categorySlug: 'hair-accessories', price: 1, originalPrice: null, stock: 60, description: 'Charming fabric hair bow with a playful red heart print on a white base. Perfect for daily wear, parties, casual outings, and special occasions.', material: 'Premium Fabric', gender: 'women' },
  { name: 'Royal Satin XL Scrunchie', categorySlug: 'hair-accessories', price: 120, originalPrice: null, stock: 70, description: 'Luxurious oversized satin scrunchie in a rich royal purple shade. Gentle on hair, perfect for daily wear, office, parties, and festive styling.', material: 'Premium Satin', gender: 'women' },
  { name: 'Floral Sailor Bow', categorySlug: 'hair-accessories', price: 190, originalPrice: null, stock: 45, description: 'Elegant sailor bow hair clip featuring a beautiful watercolour floral print in vibrant multicolour tones. Ideal for daily wear, parties, festive wear, and special occasions.', material: 'Premium Fabric', gender: 'women' },
  { name: 'Floral Hair Tail', categorySlug: 'hair-accessories', price: 150, originalPrice: null, stock: 55, description: 'Beautiful hair tail scrunchie with a pink and white floral print on a warm brown base. Perfect for daily wear, office wear, casual outings, parties, and festive occasions.', material: 'Premium Fabric', gender: 'women' },
  { name: 'Premium Silk Saree', categorySlug: 'sarees', price: 4799, originalPrice: 6399, stock: 20, description: 'Premium silk saree with elegant traditional weaving. Perfect for weddings, festivals, and special occasions.', material: 'Silk', gender: 'women', isFeatured: true },
  { name: 'Banarasi Art Silk Saree', categorySlug: 'sarees', price: 3499, originalPrice: 4999, stock: 25, description: 'Stunning Banarasi art silk saree with intricate gold weave patterns. A timeless piece for festive celebrations.', material: 'Art Silk', gender: 'women' },
  { name: 'Georgette Printed Saree', categorySlug: 'sarees', price: 1899, originalPrice: 2799, stock: 35, description: 'Lightweight georgette saree with beautiful digital floral prints. Perfect for daily wear and office styling.', material: 'Georgette', gender: 'women' },
  { name: 'Cotton Handloom Saree', categorySlug: 'sarees', price: 2199, originalPrice: 3199, stock: 30, description: 'Authentic handloom cotton saree with traditional motifs. Breathable, comfortable, and elegantly simple.', material: 'Cotton', gender: 'women' },
  { name: 'Mustard Festive Raw Silk Kurti Set', categorySlug: 'festive-wear', price: 1299, originalPrice: null, stock: 50, description: 'Celebrate every occasion with timeless elegance in our Mustard Festive Raw Silk Kurti Set. Crafted from premium Raw Silk, this sophisticated ensemble features a rich mustard hue accented with delicate golden piping for a refined finish. The graceful straight-cut kurti is paired with matching wide-leg palazzo pants, offering the perfect balance of comfort and style. Ideal for festive celebrations, family functions, office events, and special occasions.', material: 'Raw Silk', gender: 'women', sizes: ['S', 'M', 'L', 'XL'], isFeatured: true },
  { name: 'Ruby Festive Raw Silk Kurti Set', categorySlug: 'festive-wear', price: 1299, originalPrice: null, stock: 50, description: 'Celebrate every special occasion in style with our Ruby Festive Raw Silk Kurti Set, crafted from premium Raw Silk for a luxurious and elegant finish. Designed in a rich ruby red shade with delicate golden piping, this sophisticated ensemble features a flattering A-line kurti paired with matching wide-leg palazzo pants. Blending timeless tradition with modern elegance, it is perfect for festive celebrations, weddings, family gatherings, office ethnic wear, and special occasions.', material: 'Raw Silk', gender: 'women', sizes: ['M', 'L', 'XL', 'XXL'], isFeatured: true },
  { name: 'Classic Black Cord Set', categorySlug: 'cord-sets', price: 1199, originalPrice: null, stock: 50, description: 'Step into effortless sophistication with our Classic Black Cord Set, designed for women who appreciate timeless style and everyday comfort. Featuring a rich black hue with subtle woven stripe detailing, this elegant two-piece set offers a refined and modern look. The stylish V-neck kurti paired with matching straight-fit pants creates a flattering silhouette, making it perfect for office wear, casual outings, festive gatherings, and special occasions. Crafted from premium-quality fabric, it ensures all-day comfort with a luxurious finish.', material: 'Premium Blend', gender: 'women', sizes: ['M', 'L', 'XL', 'XXL'], isFeatured: true },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fashion-fusion');
    console.log('Connected to MongoDB');

    await Category.deleteMany({});
    await Product.deleteMany({});

    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    const catMap = {};
    createdCategories.forEach((c) => { catMap[c.slug] = c._id; });

    const products = productData.map((p) => {
      const slug = p.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return {
        ...p,
        slug,
        category: catMap[p.categorySlug],
        isActive: true,
        ratings: (Math.random() * 1.5 + 3.5).toFixed(1),
        numReviews: Math.floor(Math.random() * 200) + 20,
        images: [],
        tags: [p.categorySlug.replace(/-/g, ' ')],
      };
    });
    delete products.categorySlug;

    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);

    await mongoose.disconnect();
    console.log('Seed complete');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
