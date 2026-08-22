import { Link } from 'react-router-dom';
import banner from '@assets/images/banner.jpg';

export default function ProductHero() {
  return (
    <section className="relative flex h-[320px] items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${banner})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative z-10 text-center px-4">
        <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A227] mb-3">
          Fashion's Fusion
        </span>
        <h1 className="font-['Poppins'] text-4xl font-extrabold text-white md:text-5xl lg:text-5xl">
          Our Products
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70 md:text-base">
          Discover premium materials, elegant kurtis, luxurious shawls, and stylish hair accessories crafted with heritage and quality.
        </p>
        <div className="mt-6 flex items-center justify-center">
          <Link
            to="/contact"
            className="rounded-lg border border-white/30 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
