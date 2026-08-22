export default function ProductFilter({ activeCategory, onCategoryChange, counts = {} }) {
  const categories = ['Material', 'Ready-Made Kurtis', 'Premium Shawls', 'Hair Accessories', 'Sarees', 'Festive Wear', 'Cord Sets', 'Assam Silk Shawl', 'Raw Silk Fabric', 'Kurthi', 'Cord Set', 'Kurti Set'];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
            activeCategory === cat
              ? 'bg-[#C9A227] text-white shadow-md shadow-[#C9A227]/25'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-[#C9A227] hover:text-[#C9A227]'
          }`}
        >
          {cat}
          <span className="ml-1.5 text-xs opacity-70">({counts[cat]})</span>
        </button>
      ))}
    </div>
  );
}
