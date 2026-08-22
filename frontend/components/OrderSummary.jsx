import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const gradients = {
  Material: 'from-amber-200 to-yellow-100',
  'Ready-Made Kurtis': 'from-rose-200 to-pink-100',
  'Premium Shawls': 'from-purple-200 to-indigo-100',
  'Hair Accessories': 'from-emerald-200 to-teal-100',
  Saree: 'from-pink-200 to-rose-100',
};

export default function OrderSummary({ cartItems = [], subtotal = 0, shipping = 0, tax = 0, total = 0 }) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-['Poppins'] text-lg font-bold text-gray-900">Order Summary</h3>

        <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
          {cartItems.map((item) => (
            <div key={`${item._id || item.id}-${item.size || ''}-${item.color || ''}`} className="flex items-center gap-3">
              <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradients[item.category] || 'from-gray-200 to-gray-100'} overflow-hidden`}>
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <span className="text-xs text-white/60">No img</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                ₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium text-gray-900">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping</span>
            <span className="font-medium text-gray-900">{shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">GST (18%)</span>
            <span className="font-medium text-gray-900">₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <Separator />
          <div className="flex justify-between pt-1">
            <span className="font-bold text-gray-900">Grand Total</span>
            <span className="font-bold text-[#C9A227]">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
