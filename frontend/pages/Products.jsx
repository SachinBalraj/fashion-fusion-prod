import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import ProductSearch from '@/components/ProductSearch';
import ProductFilter from '@/components/ProductFilter';
import ProductGrid from '@/components/ProductGrid';
import LoadMore from '@/components/LoadMore';
import { fetchCatalog, fetchCategoriesWithCounts } from '@/services/products';

const ITEMS_PER_LOAD = 12;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');

  const [searchQuery, setSearchQuery] = useState('');

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-with-counts'],
    queryFn: fetchCategoriesWithCounts,
  });
  const categories = categoriesData || [];

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
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

  const trimmedSearch = searchQuery.trim();
  const activeCategoryName =
    categories.find((c) => c.slug === urlCategory)?.name || null;

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ['products', { category: urlCategory, search: trimmedSearch }],
      queryFn: ({ pageParam = 1 }) =>
        fetchCatalog({
          category: urlCategory || undefined,
          search: trimmedSearch || undefined,
          page: pageParam,
          limit: ITEMS_PER_LOAD,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
    });

  const products = data?.pages?.flatMap((page) => page.products) || [];
  const totalCount = data?.pages?.[0]?.total ?? products.length;

  const handleCategoryChange = (slug) => {
    if (slug) {
      setSearchParams({ category: slug }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
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
            categories={categories}
            activeSlug={urlCategory}
            onCategoryChange={handleCategoryChange}
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
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-200" />
              ))}
            </div>
          ) : (
            <>
              <ProductGrid
                products={products}
                emptyMessage={activeCategoryName === 'Festive Wear' ? 'No Festive Wear products available right now.' : activeCategoryName === 'Cord Sets' ? 'No Cord Set products available right now.' : undefined}
              />
              <LoadMore
                onClick={handleLoadMore}
                visibleCount={products.length}
                totalCount={totalCount}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}