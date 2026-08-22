import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const fields = [
  { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Enter your full name', colSpan: 2 },
  { name: 'phone', label: 'Mobile Number', type: 'tel', placeholder: '+91 XXXXX XXXXX', colSpan: 2 },
  { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', colSpan: 2 },
  { name: 'address', label: 'Street Address', type: 'text', placeholder: 'House no, Street, Area', colSpan: 2 },
  { name: 'city', label: 'City', type: 'text', placeholder: 'City', colSpan: 1 },
  { name: 'state', label: 'State', type: 'text', placeholder: 'State', colSpan: 1 },
  { name: 'pincode', label: 'Pincode', type: 'text', placeholder: '000000', colSpan: 1 },
  { name: 'country', label: 'Country', type: 'text', placeholder: 'India', colSpan: 1 },
];

export default function BillingForm({ billing = {}, setBilling = () => {}, errors = {} }) {
  const handleChange = (e) => {
    setBilling((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-['Poppins'] text-lg font-bold text-gray-900">Customer Details</h3>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name} className={field.colSpan === 2 ? 'sm:col-span-2' : ''}>
              <Label htmlFor={field.name} className="text-gray-700">{field.label}</Label>
              <Input
                id={field.name}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={billing[field.name] || ''}
                onChange={handleChange}
                className={`mt-1.5 h-10 rounded-xl border-gray-200 text-sm focus:border-[#C9A227] focus:ring-[#C9A227]/20 ${errors[field.name] ? 'border-red-400' : ''}`}
              />
              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
