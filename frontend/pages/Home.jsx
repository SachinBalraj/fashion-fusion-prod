import { Helmet } from 'react-helmet-async';
import HeroSection from '@/components/HeroSection';
import ProductShowcaseSection from '@/components/ProductShowcaseSection';
import WhyChooseUs from '@/components/WhyChooseUs';
import Testimonials from '@/components/Testimonials';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Fashion's Fusion - Where Quality Meets Confidence</title>
      </Helmet>
      <HeroSection />
      <ProductShowcaseSection showDescriptions={false} />
      <WhyChooseUs />
      <Testimonials />
    </>
  );
}
