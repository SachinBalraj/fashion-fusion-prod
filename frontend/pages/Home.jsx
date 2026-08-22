import { Helmet } from 'react-helmet-async';
import HeroSection from '@/components/HeroSection';
import CategorySection from '@/components/CategorySection';
import BestSellers from '@/components/BestSellers';
import NewLaunch from '@/components/NewLaunch';
import WhyChooseUs from '@/components/WhyChooseUs';
import Testimonials from '@/components/Testimonials';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Fashion's Fusion - Where Quality Meets Confidence</title>
      </Helmet>
      <HeroSection />
      <CategorySection />
      <BestSellers />
      <NewLaunch />
      <WhyChooseUs />
      <Testimonials />
    </>
  );
}
