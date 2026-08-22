import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const SIZE_GUIDE = [
  { size: 'XS', bust: '32"', waist: '26"', hip: '34"' },
  { size: 'S', bust: '34"', waist: '28"', hip: '36"' },
  { size: 'M', bust: '36"', waist: '30"', hip: '38"' },
  { size: 'L', bust: '38"', waist: '32"', hip: '40"' },
  { size: 'XL', bust: '40"', waist: '34"', hip: '42"' },
  { size: 'XXL', bust: '42"', waist: '36"', hip: '44"' },
];

function SizeGuideModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Size Guide</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Close size guide"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Measurements in inches. For the best fit, measure yourself and compare with the chart below.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Size</th>
                    <th className="pb-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Bust</th>
                    <th className="pb-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Waist</th>
                    <th className="pb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Hip</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_GUIDE.map((row) => (
                    <tr key={row.size} className="border-b border-gray-100 last:border-0">
                      <td className="py-2.5 pr-4 font-semibold text-gray-900">{row.size}</td>
                      <td className="py-2.5 pr-4 text-gray-600">{row.bust}</td>
                      <td className="py-2.5 pr-4 text-gray-600">{row.waist}</td>
                      <td className="py-2.5 text-gray-600">{row.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              If you're between sizes, we recommend sizing up for a comfortable fit.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function SizeSelector({ selectedSize, onSelect, showSizeGuide = true }) {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">Size</span>
        {showSizeGuide && (
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowGuide(true);
            }}
            className="text-xs text-[#C9A227] hover:text-[#B8921F] transition-colors underline underline-offset-2"
          >
            📏 Size Guide
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-[10px]">
        {SIZES.map((size) => (
          <button
            key={size}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(selectedSize === size ? '' : size);
            }}
            className={`h-10 w-12 rounded-[8px] text-[14px] font-semibold transition-all duration-200 ${
              selectedSize === size
                ? 'bg-[#C9A227] text-white border border-[#C9A227] shadow-sm'
                : 'bg-white text-[#111827] border border-[#E5E7EB] hover:border-[#C9A227] hover:text-[#C9A227]'
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      <SizeGuideModal open={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}
