import { Check } from 'lucide-react';

const steps = [
  { label: 'Cart', path: '/cart' },
  { label: 'Address', path: '/checkout/address' },
  { label: 'Payment', path: '/checkout/payment' },
  { label: 'Review', path: '/checkout/review' },
  { label: 'Success', path: '/order-success' },
];

export default function StepIndicator({ currentStep }) {
  const currentIndex = steps.findIndex((s) => s.label.toLowerCase() === (currentStep || '').toLowerCase());

  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-2xl mx-auto">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#C9A227] text-white'
                    : isCurrent
                      ? 'bg-[#C9A227] text-white ring-4 ring-[#C9A227]/20'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={`mt-1.5 text-[10px] font-semibold sm:text-xs ${
                  isCurrent ? 'text-[#C9A227]' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 transition-all duration-300 sm:mx-2 ${
                  isCompleted ? 'bg-[#C9A227]' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
