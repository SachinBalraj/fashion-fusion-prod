import { Ruler } from 'lucide-react';

export default function MeasurementGuide() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C9A227]/10">
          <Ruler className="h-8 w-8 text-[#C9A227]" />
        </div>
        <h1 className="font-['Poppins'] text-3xl font-bold text-gray-900">Measurement Guide</h1>
        <p className="mt-2 text-gray-500">Find your perfect fit with our detailed sizing guide</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-4 font-['Poppins'] text-xl font-semibold text-gray-900">How to Measure</h2>
        <p className="mb-6 text-gray-600">
          For the most accurate fit, measure a well-fitting garment that you already own. Lay it flat on a hard surface and measure using a standard ruler.
        </p>

        <div className="grid gap-8 sm:grid-cols-2">
          {[
            { title: 'Bust', desc: 'Measure around the fullest part of your bust, keeping the tape measure horizontal.' },
            { title: 'Waist', desc: 'Measure around the narrowest part of your waist, typically just above the belly button.' },
            { title: 'Hips', desc: 'Measure around the fullest part of your hips, about 7-9 inches below your waist.' },
            { title: 'Length', desc: 'Measure from the highest point of your shoulder down to the desired hem length.' },
          ].map((item) => (
            <div key={item.title} className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-1 font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-4 font-['Poppins'] text-xl font-semibold text-gray-900">Size Chart</h2>
        <p className="mb-4 text-sm text-gray-500">All measurements are in inches</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 pr-4 font-semibold text-gray-900">Size</th>
                <th className="py-3 pr-4 font-semibold text-gray-900">Bust</th>
                <th className="py-3 pr-4 font-semibold text-gray-900">Waist</th>
                <th className="py-3 font-semibold text-gray-900">Hips</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {[
                { size: 'XS', bust: '32-33', waist: '26-27', hips: '35-36' },
                { size: 'S', bust: '34-35', waist: '28-29', hips: '37-38' },
                { size: 'M', bust: '36-37', waist: '30-31', hips: '39-40' },
                { size: 'L', bust: '38-39', waist: '32-33', hips: '41-42' },
                { size: 'XL', bust: '40-41', waist: '34-35', hips: '43-44' },
              ].map((row) => (
                <tr key={row.size} className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-medium text-gray-900">{row.size}</td>
                  <td className="py-3 pr-4">{row.bust}</td>
                  <td className="py-3 pr-4">{row.waist}</td>
                  <td className="py-3">{row.hips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
