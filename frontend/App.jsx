import AppRoutes from '@/routes/AppRoutes';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CheckoutProvider } from '@/context/CheckoutContext';
import ScrollToTop from '@/components/ScrollToTop';
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <CheckoutProvider>
              <ScrollToTop />
              <AppRoutes />
            </CheckoutProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
