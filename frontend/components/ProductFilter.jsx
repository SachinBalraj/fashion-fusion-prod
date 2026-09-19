export default function ProductFilter({ categories = [], activeSlug = '', onCategoryChange }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {categories.map((cat) => (
        <button
          key={cat.slug || cat.name}
          onClick={() => onCategoryChange(cat.slug)}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
            activeSlug === cat.slug
              ? 'bg-[#C9A227] text-white shadow-md shadow-[#C9A227]/25'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-[#C9A227] hover:text-[#C9A227]'
          }`}
        >
          {cat.name}
          {typeof cat.count === 'number' && (
            <span className="ml-1.5 text-xs opacity-70">({cat.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}