import { Search, X } from 'lucide-react';

export default function ProductSearch({ value, onChange, onClear }) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products..."
        className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus-visible:border-[#C9A227] focus-visible:ring-2 focus-visible:ring-[#C9A227]/20"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
