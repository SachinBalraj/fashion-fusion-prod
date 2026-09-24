import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ShoppingBag, PackageX } from 'lucide-react';
import { fetchCollection } from '@/services/products';

const formatINR = (value) =>
  (Number(value) || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function effectivePrice(product) {
  const sale = Number(product.salePrice);
  const base = Number(product.price) || 0;
  return sale > 0 && sale < base ? sale : base;
}

function CollectionProductCard({ product, index }) {
  const [failed, setFailed] = useState(false);

  const price = effectivePrice(product);
  const hasSale = product.salePrice > 0 && product.salePrice < (Number(product.price) || 0);
  const outOfStock = (Number(product.stock) || 0) <= 0;
  const isFirst = index === 0;
  const href = product.slug ? `/shop/${product.slug}` : `/products/${product._id || product.id}`;
  const detailLabel = product.category && typeof product.category === 'string'
    ? product.category
    : product.category?.name || '';
  const imageUrl = product.image || '';

  return (
    <Link
      to={href}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 outline-none hover:-translate-y-1 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F1EA]">
        {imageUrl && !failed ? (
          <img
            src={imageUrl}
            alt={product.name}
            width={600}
            height={800}
            loading={isFirst ? 'eager' : 'lazy'}
            fetchPriority={isFirst ? 'high' : 'auto'}
            decoding="async"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#F5F1EA]">
            <span className="rounded-full bg-gold/10 p-5">
              <ShoppingBag className="h-8 w-8 text-gold/50" />
            </span>
          </div>
        )}

        {outOfStock ? (
          <span className="absolute left-3 top-3 rounded-full bg-gray-800/90 px-3 py-1 text-xs font-semibold text-white">
            Out of Stock
          </span>
        ) : (
          hasSale && (
            <span className="absolute left-3 top-3 rounded-full bg-[#EF4444] px-3 py-1 text-xs font-semibold text-white">
              {Math.round((1 - price / (Number(product.price) || price)) * 100)}% OFF
            </span>
          )
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 pt-3">
        {detailLabel && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#C9A227]">
            {detailLabel}
          </p>
        )}
        <h3 className="mt-1 line-clamp-1 font-['Poppins'] text-[15px] font-semibold text-gray-900 group-hover:text-[#C9A227]">
          {product.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 min-h-10 text-[13px] leading-5 text-gray-500">
          {product.shortDescription || product.description || ''}
        </p>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">₹{formatINR(price)}</span>
            {hasSale && (
              <span className="text-sm text-gray-400 line-through">₹{formatINR(product.price)}</span>
            )}
            {product.unit === 'meter' && (
              <span className="text-xs font-medium text-gray-500">/meter</span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                outOfStock ? 'bg-red-500' : Number(product.stock) > 10 ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            />
            <span
              className={`text-xs font-medium ${
                outOfStock ? 'text-red-600' : Number(product.stock) > 10 ? 'text-green-700' : 'text-yellow-700'
              }`}
            >
              {outOfStock ? 'Out of Stock' : Number(product.stock) > 10 ? 'In Stock' : 'Only Few Left'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Collection() {
  const { slug } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['collection', slug],
    queryFn: () => fetchCollection(slug),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="bg-[#FAF8F5] px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-10 h-9 w-64 animate-pulse rounded-full bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="aspect-[3/4] animate-pulse bg-gray-200" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-full animate-pulse rounded bg-gray-200/70" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200/70" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    const status = error?.response?.status;
    return (
      <div className="bg-[#FAF8F5] px-4 py-24 md:px-6">
        <div className="mx-auto max-w-md text-center">
          <PackageX className="mx-auto h-16 w-16 text-gray-300" />
          <h1 className="mt-4 font-['Poppins'] text-2xl font-bold text-gray-900">
            Collection not found
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {status === 404
              ? 'The collection you are looking for does not exist.'
              : 'This collection could not be loaded right now. Please try again.'}
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#C9A227] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#B8921F]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const title = data.name || String(slug || '').replace(/-/g, ' ');

  return (
    <>
      <Helmet>
        <title>{`${title} — Fashion's Fusion`}</title>
      </Helmet>

      <div className="bg-[#FAF8F5]">
        <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-[#C9A227]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </Link>
        </div>

        <section className="px-4 pb-16 pt-6 md:px-6 md:pb-24 md:pt-10">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h1 className="font-['Poppins'] text-3xl font-extrabold uppercase tracking-wide text-[#111111] md:text-4xl">
                {title}
              </h1>
              {data.description && (
                <p className="mx-auto mt-3 max-w-2xl text-sm text-[#6B7280] md:text-base">
                  {data.description}
                </p>
              )}
            </div>

            {data.products.length > 0 ? (
              <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
                {data.products.map((product, index) => (
                  <CollectionProductCard key={product._id || product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="mx-auto mt-10 max-w-md rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-3 text-lg font-semibold text-gray-900">No products yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  This collection is being curated. Please check back soon.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}