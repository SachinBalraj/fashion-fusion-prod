import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminLayout from '@/layouts/AdminLayout';

const Home = lazy(() => import('@/pages/Home'));
const Shop = lazy(() => import('@/pages/Shop'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const AddressPage = lazy(() => import('@/pages/checkout/AddressPage'));
const PaymentPage = lazy(() => import('@/pages/checkout/PaymentPage'));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess'));
const PaymentFailed = lazy(() => import('@/pages/PaymentFailed'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Profile = lazy(() => import('@/pages/Profile'));
const Orders = lazy(() => import('@/pages/Orders'));
const Wishlist = lazy(() => import('@/pages/Wishlist'));
const Search = lazy(() => import('@/pages/Search'));
const About = lazy(() => import('@/pages/About'));
const Products = lazy(() => import('@/pages/Products'));
const ProductDetails = lazy(() => import('@/pages/ProductDetails'));
const CustomStitching = lazy(() => import('@/pages/CustomStitching'));
const MeasurementGuide = lazy(() => import('@/pages/MeasurementGuide'));
const Wholesale = lazy(() => import('@/pages/Wholesale'));
const Contact = lazy(() => import('@/pages/Contact'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const TermsAndConditions = lazy(() => import('@/pages/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const RefundReturnPolicy = lazy(() => import('@/pages/RefundReturnPolicy'));
const PincodeAvailability = lazy(() => import('@/pages/PincodeAvailability'));
const ContactUs = lazy(() => import('@/pages/ContactUs'));

const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('@/pages/admin/Products'));
const AdminCategories = lazy(() => import('@/pages/admin/Categories'));
const AdminOrders = lazy(() => import('@/pages/admin/Orders'));
const AdminPayments = lazy(() => import('@/pages/admin/Payments'));
const AdminCustomers = lazy(() => import('@/pages/admin/Customers'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout/address"
            element={<AddressPage />}
          />
          <Route
            path="/checkout/payment"
            element={<PaymentPage />}
          />
          <Route
            path="/checkout"
            element={<Checkout />}
          />
          <Route
            path="/payment-success"
            element={<PaymentSuccess />}
          />
          <Route
            path="/payment-failed"
            element={<PaymentFailed />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />
          <Route
            path="/orders"
            element={<ProtectedRoute><Orders /></ProtectedRoute>}
          />
          <Route
            path="/wishlist"
            element={<ProtectedRoute><Wishlist /></ProtectedRoute>}
          />
          <Route path="/search" element={<Search />} />
          <Route path="/custom-stitching" element={<CustomStitching />} />
          <Route path="/measurement-guide" element={<MeasurementGuide />} />
          <Route path="/wholesale" element={<Wholesale />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-return-policy" element={<RefundReturnPolicy />} />
          <Route path="/pincode-availability" element={<PincodeAvailability />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
