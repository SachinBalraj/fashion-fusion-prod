import { useEffect, useRef, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { adminAPI } from '@/services/admin';

const DEBOUNCE_MS = 350;

const formatINR = (value) => (Number(value) || 0).toLocaleString('en-IN');

export default function ProductPicker({ excludeIds = [], onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const boxRef = useRef(null);

  const runSearch = async (term) => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getProducts({ search: term, limit: 8 });
      setResults(Array.isArray(data?.products) ? data.products : []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    const term = value.trim();
    if (!term) {
      setOpen(false);
      setResults([]);
      return;
    }
    timerRef.current = setTimeout(() => runSearch(term), DEBOUNCE_MS);
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const isExcluded = (id) => excludeIds.includes(id);

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query.trim() && runSearch(query.trim())}
          placeholder="Search by name, category or SKU…"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm focus:border-[#C9A227] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </div>
          ) : results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-400">No products found</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {results.map((product) => {
                const id = product._id || product.id;
                const disabled = isExcluded(id);
                return (
                  <li key={id}>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        onSelect(product);
                        setQuery('');
                        setResults([]);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                        disabled
                          ? 'cursor-not-allowed opacity-50'
                          : 'hover:bg-[#FAF8F5] cursor-pointer'
                      }`}
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {product.images?.[0] && (
                          <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="truncate text-xs text-gray-400">
                          ₹{formatINR(product.price)}
                          {product.category?.name && <span> · {product.category.name}</span>}
                          {product.sku && <span> · {product.sku}</span>}
                          {product.stock === 0 && <span className="ml-1 text-red-500">· Out of stock</span>}
                        </p>
                      </div>
                      {disabled && <span className="text-[10px] text-gray-400">In list</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}