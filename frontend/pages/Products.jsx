import { Helmet } from 'react-helmet-async';
import ProductShowcaseSection from '@/components/ProductShowcaseSection';

export default function Products() {
  return (
    <>
      <Helmet>
        <title>Our Products — Fashion's Fusion</title>
      </Helmet>

      <ProductShowcaseSection headingLevel="h1" />
    </>
  );
}