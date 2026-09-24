import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import ProductShowcase from '@/components/ProductShowcase';
import { fetchProductShowcase } from '@/services/products';

function ShowcaseLoading() {
  return (
    <div className="grid grid-cols-2 gap-4 max-[360px]:grid-cols-1 md:grid-cols-3 xl:grid-cols-5 sm:gap-5 lg:gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col">
          <div className="aspect-[4/5] animate-pulse rounded-2xl bg-gray-200" />
          <div className="mx-auto mt-2 h-10 w-full animate-pulse rounded bg-gray-200/70" />
        </div>
      ))}
    </div>
  );
}

export default function Products() {
  const { data: showcaseImages, isLoading } = useQuery({
    queryKey: ['product-showcase'],
    queryFn: fetchProductShowcase,
    staleTime: 60 * 1000,
    retry: 1,
  });

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

      <section id="products-section" className="bg-[#FAF8F5] px-4 pb-20 md:px-6 md:pb-28">
        <div className="mx-auto max-w-7xl">
          {isLoading ? (
            <ShowcaseLoading />
          ) : (
            <ProductShowcase images={showcaseImages || []} />
          )}
        </div>
      </section>
    </>
  );
}