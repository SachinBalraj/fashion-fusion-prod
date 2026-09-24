import { useParams } from 'react-router-dom';
import ProductDetails from '@/pages/ProductDetails';
import Collection from '@/pages/Collection';

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

export default function ProductParamRoute() {
  const { param } = useParams();
  const isProductId = typeof param === 'string' && OBJECT_ID_RE.test(param);
  return isProductId ? <ProductDetails /> : <Collection />;
}