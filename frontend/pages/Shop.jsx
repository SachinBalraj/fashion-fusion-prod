import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import api from '@/services/api';

function Pagination({ page, totalPages, onPageChange }) {
  const getPages = () => {
    const pages = [];
    const delta = 1;
    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="icon-sm"
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page')) || 1;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', { page }],
    queryFn: () => api.get('/products', { params: { page } }).then((res) => res.data),
  });

  const products = data?.products || data?.data || [];
  const totalPages = data?.pages || data?.totalPages || 1;

  return (
    <>
      <Helmet>
        <title>Shop — Fashion's Fusion</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      >
        {isError ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <svg className="h-8 w-8 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Failed to load products</h3>
            <p className="mt-1 text-sm text-muted-foreground">Something went wrong. Please try again.</p>
            <Button variant="gold" className="mt-4" onClick={() => refetch()}>
              Try Again
            </Button>
          </motion.div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <svg className="h-10 w-10 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search terms.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => {
                const params = new URLSearchParams(searchParams);
                params.set('page', String(p));
                setSearchParams(params, { replace: true });
              }}
            />
          </>
        )}
      </motion.div>
    </>
  );
}
