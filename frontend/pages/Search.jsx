import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X, TrendingUp, Clock, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { Helmet } from 'react-helmet-async';
import { allProducts } from '@/services/products';

const trendingSearches = ['Material', 'Kurti', 'Shawl', 'Silk', 'Saree', 'Festive Wear', 'Cord Set'];

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch { return []; }
  });
  const inputRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase().trim();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.fabric?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [debouncedQuery]);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (!inputValue.trim()) return;
      setSearchParams({ q: inputValue.trim() });
      const updated = [inputValue.trim(), ...recentSearches.filter((s) => s !== inputValue.trim())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    },
    [inputValue, recentSearches, setSearchParams]
  );

  const clearSearch = useCallback(() => {
    setInputValue('');
    setSearchParams({});
    inputRef.current?.focus();
  }, [setSearchParams]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <Helmet>
        <title>{query ? `Search: ${query} - Fashion's Fusion` : "Search - Fashion's Fusion"}</title>
      </Helmet>

      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
      </Link>

      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-12">
        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search products..."
          className="h-14 pl-12 pr-12 text-lg rounded-2xl border-2 focus-visible:border-gold"
        />
        {inputValue && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </form>

      {!query && (
        <div className="max-w-2xl mx-auto space-y-8">
          {recentSearches.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
                <Clock className="h-4 w-4" /> Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => { setSearchParams({ q: term }); setInputValue(term); }}
                    className="rounded-full border px-4 py-1.5 text-sm hover:bg-accent transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
              <TrendingUp className="h-4 w-4" /> Trending Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => { setSearchParams({ q: term }); setInputValue(term); }}
                  className="rounded-full border border-gold/30 px-4 py-1.5 text-sm text-gold hover:bg-gold/5 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {query && (
          <motion.div
            key={query}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {results.length > 0 ? (
              <>
                <p className="text-muted-foreground mb-6">{results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;</p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {results.map((product) => (
                    <ProductCard key={product._id || product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <SearchIcon className="h-16 w-16 text-muted-foreground/40 mb-4" />
                <h2 className="text-xl font-bold font-heading">No results found</h2>
                <p className="text-muted-foreground mt-1">
                  We couldn&apos;t find anything for &quot;{query}&quot;
                </p>
                <Button variant="outline" className="mt-4" onClick={clearSearch}>
                  Try a different search
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
