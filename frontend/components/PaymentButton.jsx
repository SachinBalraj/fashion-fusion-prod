import { ShieldCheck, Loader2 } from 'lucide-react';

export default function PaymentButton({ onClick, loading, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="group relative w-full overflow-hidden rounded-xl bg-[#C9A227] py-4 text-base font-bold text-white shadow-lg shadow-[#C9A227]/20 transition-all duration-300 hover:bg-[#B8921F] hover:shadow-xl hover:shadow-[#C9A227]/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-lg"
    >
      <span className="flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <ShieldCheck className="h-5 w-5" />
            Proceed to Secure Payment
          </>
        )}
      </span>
    </button>
  );
}
