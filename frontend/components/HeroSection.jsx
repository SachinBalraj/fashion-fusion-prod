import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import banner1 from '@assets/images/newbannerphoto1.jpeg';
import banner2 from '@assets/images/newbannerphoto12jpeg.jpeg';

const banners = [
  { src: banner1, alt: "Fashion's Fusion Premium Collection" },
  { src: banner2, alt: "Fashion's Fusion New Arrivals" },
];

export default function HeroSection() {
  const swiperRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (swiperRef.current?.autoplay) {
      swiperRef.current.autoplay.stop();
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (swiperRef.current?.autoplay) {
      swiperRef.current.autoplay.start();
    }
  }, []);

  const onSwiperInit = useCallback((swiper) => {
    swiperRef.current = swiper;
  }, []);

  return (
    <section
      className="relative w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Hero banner carousel"
    >
      <div className="relative mx-auto w-full max-w-[1600px] h-[300px] overflow-hidden md:h-[420px] lg:h-[500px] xl:h-[525px] 2xl:h-[600px]">
        <Swiper
          modules={[Autoplay, Navigation, Pagination, Keyboard]}
          onSwiper={onSwiperInit}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          navigation={{
            prevEl: '.hero-prev',
            nextEl: '.hero-next',
          }}
          pagination={{
            clickable: true,
            el: '.hero-pagination',
            bulletClass: 'hero-bullet',
            bulletActiveClass: 'hero-bullet-active',
          }}
          keyboard={{
            enabled: true,
            onlyInViewport: true,
          }}
          loop
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={800}
          slidesPerView={1}
          allowTouchMove
          className="h-full w-full"
          a11y={{
            prevSlide: 'Previous banner',
            nextSlide: 'Next banner',
            paginationBulletMessage: 'Go to slide {{index}}',
          }}
        >
          {banners.map((banner, index) => (
            <SwiperSlide key={index} className="!h-full">
              <img
                src={banner.src}
                alt={banner.alt}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="h-full w-full object-cover hero-banner-img"
                width="1600"
                height="600"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          className="hero-prev absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-sm transition-all duration-300 hover:bg-[#C9A227] hover:border-[#C9A227] md:left-5 md:h-12 md:w-12"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>

        <button
          className="hero-next absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-sm transition-all duration-300 hover:bg-[#C9A227] hover:border-[#C9A227] md:right-5 md:h-12 md:w-12"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>

        <div className="hero-pagination absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-3 md:bottom-8" />

        <div className="relative z-10 flex h-full flex-col items-center justify-end pb-16 px-4 md:pb-20 lg:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/products?category=premium-shawls">
              <Button className="rounded-full bg-[#C9A227] px-8 py-4 text-base font-bold text-white shadow-lg shadow-black/30 transition-all duration-300 hover:scale-105 hover:bg-[#B8921F] hover:shadow-xl hover:shadow-black/40 cursor-pointer md:px-10 md:py-4.5 md:text-lg">
                Explore Products
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
