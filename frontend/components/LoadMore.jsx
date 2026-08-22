import { motion } from 'framer-motion';

export default function LoadMore({ onClick, visibleCount, totalCount }) {
  const remaining = totalCount - visibleCount;

  if (remaining <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 text-center"
    >
      <button
        onClick={onClick}
        className="group inline-flex items-center gap-2 rounded-xl border-2 border-[#C9A227] bg-white px-8 py-3 text-sm font-semibold text-[#C9A227] transition-all duration-300 hover:bg-[#C9A227] hover:text-white hover:shadow-lg hover:shadow-[#C9A227]/25"
      >
        Load More ({remaining} remaining)
        <svg
          className="h-4 w-4 transition-transform group-hover:translate-y-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    </motion.div>
  );
}
