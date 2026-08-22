import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductSearch from '@/components/ProductSearch';
import ProductFilter from '@/components/ProductFilter';
import ProductGrid from '@/components/ProductGrid';
import LoadMore from '@/components/LoadMore';
import { allProducts } from '@/services/products';

const ITEMS_PER_LOAD = 12;
const ITEMS_PER_LOAD_MORE = 8;

const CATEGORY_SLUG_MAP = {
  'material': 'Material',
  'ready-made-kurtis': 'Ready-Made Kurtis',
  'premium-shawls': 'Premium Shawls',
  'hair-accessories': 'Hair Accessories',
  'sarees': 'Sarees',
  'festive-wear': 'Festive Wear',
  'cord-sets': 'Cord Sets',
  'assam-silk-shawl': 'Assam Silk Shawl',
  'raw-silk-fabric': 'Raw Silk Fabric',
  'kurthi': 'Kurthi',
  'cord-set': 'Cord Set',
  'kurti-set': 'Kurti Set',
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');

  const [activeCategory, setActiveCategory] = useState(
    urlCategory ? CATEGORY_SLUG_MAP[urlCategory] || null : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && CATEGORY_SLUG_MAP[hash]) {
      setSearchParams({ category: hash }, { replace: true });
    }
  }, []);

  useEffect(() => {
    if (urlCategory) {
      const navbar = document.querySelector('nav');
      const navbarHeight = navbar?.offsetHeight || 80;
      const section = document.getElementById(urlCategory) || document.getElementById('products-section');
      if (section) {
        const top = section.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  }, [urlCategory]);

  useEffect(() => {
    const mapped = urlCategory ? CATEGORY_SLUG_MAP[urlCategory] || null : null;
    setActiveCategory(mapped);
    setVisibleCount(ITEMS_PER_LOAD);
  }, [urlCategory]);

  const filteredProducts = useMemo(() => {
    let result = activeCategory
      ? allProducts.filter((p) => p.category === activeCategory)
      : [...allProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    ['Material', 'Ready-Made Kurtis', 'Premium Shawls', 'Hair Accessories', 'Sarees', 'Festive Wear', 'Cord Sets'].forEach((cat) => {
      counts[cat] = allProducts.filter((p) => p.category === cat).length;
    });
    return counts;
  }, []);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setVisibleCount(ITEMS_PER_LOAD);
    const slug = cat
      ? Object.entries(CATEGORY_SLUG_MAP).find(([, v]) => v === cat)?.[0]
      : null;
    if (slug) {
      setSearchParams({ category: slug }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setVisibleCount(ITEMS_PER_LOAD);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setVisibleCount(ITEMS_PER_LOAD);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_LOAD_MORE);
  };

  return (
    <>
      <Helmet>
        <title>Our Products — Fashion's Fusion</title>
      </Helmet>

      <section className="bg-[#FAF8F5] pt-16 pb-8 md:pt-20 md:pb-10">
        <div className="mx-auto max-w-7xl px-4 md:px-6 text-center">
          <h1 className="font-['Poppins'] text-4xl font-extrabold text-[#111111] md:text-5xl">
            Products
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-[#6B7280] md:text-lg">
            Discover our premium collections including Materials, Premium Shawls, Ready-Made Kurtis, Hair Accessories, Sarees, Festive Wear, and Cord Sets.
          </p>
        </div>
      </section>

      <section className="bg-[#FAF8F5] px-4 py-0 md:px-6 md:py-0">
        <div className="mx-auto max-w-7xl">
          <ProductFilter
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            counts={categoryCounts}
          />

          <div className="mt-6 flex justify-center">
            <ProductSearch
              value={searchQuery}
              onChange={handleSearch}
              onClear={handleClearSearch}
            />
          </div>
        </div>
      </section>

      <section id={urlCategory || 'products-section'} className="bg-[#FAF8F5] px-4 pb-20 md:px-6 md:pb-28">
        <div className="mx-auto max-w-7xl">
          <ProductGrid
            products={filteredProducts}
            visibleCount={visibleCount}
            emptyMessage={activeCategory === 'Festive Wear' ? 'No Festive Wear products available right now.' : activeCategory === 'Cord Sets' ? 'No Cord Set products available right now.' : undefined}
          />
          <LoadMore
            onClick={handleLoadMore}
            visibleCount={visibleCount}
            totalCount={filteredProducts.length}
          />
        </div>
      </section>
    </>
  );
}
