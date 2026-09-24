import { useQuery } from '@tanstack/react-query';
import ProductShowcase from './ProductShowcase';
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

export default function ProductShowcaseSection({ headingLevel = 'h2', showDescriptions = true }) {
  const { data: showcaseImages, isLoading } = useQuery({
    queryKey: ['product-showcase'],
    queryFn: fetchProductShowcase,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const Heading = headingLevel;

  return (
    <section
      id="products-section"
      className={`bg-[#FAF8F5] px-4 pt-16 md:px-6 md:pt-20 ${showDescriptions ? 'pb-20 md:pb-28' : 'pb-10 md:pb-14'}`}
    >
      <div className="mx-auto max-w-7xl px-2 text-center md:px-0">
        <Heading className="font-['Poppins'] text-4xl font-extrabold text-[#111111] md:text-5xl">
          Materials
        </Heading>
        <p className="mx-auto mt-4 max-w-3xl text-base text-[#6B7280] md:text-lg">
          Discover our premium collections including Materials, Premium Shawls, Ready-Made Kurtis, Hair Accessories, Sarees, Festive Wear, and Cord Sets.
        </p>
      </div>
      <div className="mx-auto mt-10 max-w-7xl">
        {isLoading ? <ShowcaseLoading /> : <ProductShowcase images={showcaseImages || []} showDescriptions={showDescriptions} />}
      </div>
    </section>
  );
}