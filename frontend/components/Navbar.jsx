import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Heart, ShoppingBag, User, Menu, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { cn } from '@/lib/utils';

const primaryLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Products', path: '/products' },
  { label: 'Contact', path: '/contact' },
];

const loggedInMenuItems = [
  { label: 'My Account', path: '/profile' },
  { label: 'My Orders', path: '/orders' },
  { label: 'Wishlist', path: '/wishlist' },
  { label: 'Cart', path: '/cart' },
];

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const closeAll = () => {
    setMobileOpen(false);
  };

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white shadow-md'
          : 'bg-white'
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2"
          onClick={closeAll}
        >
          <span className="font-['Poppins'] text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">
            Fashion&apos;s
            <span className="text-[#C9A227]"> Fusion</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className={cn(
                'relative px-4 py-2 text-sm font-medium transition-colors',
                isActive(link.path)
                  ? 'font-semibold text-[#C9A227]'
                  : 'text-gray-800 hover:text-[#C9A227]'
              )}
            >
              {link.label}
              {isActive(link.path) && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#C9A227]"
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Link to="/search">
            <Button variant="ghost" size="icon" aria-label="Search" className="text-gray-700 hover:text-[#C9A227]">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          <Link to="/wishlist" className="relative">
            <Button variant="ghost" size="icon" aria-label="Wishlist" className="text-gray-700 hover:text-[#C9A227]">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C9A227] p-0 text-[10px] text-white hover:bg-[#C9A227]">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </Badge>
              )}
            </Button>
          </Link>

          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart" className="text-gray-700 hover:text-[#C9A227]">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C9A227] p-0 text-[10px] text-white hover:bg-[#C9A227]">
                  {cartCount > 99 ? '99+' : cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          <div className="relative">
            <Button
              variant="ghost"
              size={user ? 'default' : 'icon'}
              aria-label="Profile"
              onClick={() => setProfileOpen(!profileOpen)}
              onMouseEnter={() => setProfileOpen(true)}
              className={cn(
                'text-gray-700 hover:text-[#C9A227]',
                user && 'gap-2 px-3'
              )}
            >
              {user ? (
                <>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar || ''} alt={user.name} />
                    <AvatarFallback className="bg-[#C9A227] text-[10px] font-bold text-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium lg:inline max-w-[100px] truncate">
                    {user.name?.split(' ')[0]}
                  </span>
                </>
              ) : (
                <User className="h-5 w-5" />
              )}
            </Button>
            <AnimatePresence>
              {profileOpen && (
                <div
                  onMouseLeave={() => setProfileOpen(false)}
                  className="absolute right-0 top-full z-50 pt-2"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-56 rounded-xl border border-gray-100 bg-white p-2 shadow-lg"
                  >
                    {user ? (
                      <>
                        <div className="border-b border-gray-100 px-3 py-2.5">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {user.name || 'User'}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {user.email || ''}
                          </p>
                        </div>
                        {loggedInMenuItems.map((item) => (
                          <Link
                            key={item.label}
                            to={item.path}
                            onClick={() => setProfileOpen(false)}
                            className="block rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#C9A227]"
                          >
                            {item.label}
                          </Link>
                        ))}
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={() => {
                            logout();
                            setProfileOpen(false);
                            navigate('/');
                          }}
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setProfileOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm font-medium text-[#C9A227] transition-colors hover:bg-[#C9A227]/5"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setProfileOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#C9A227]"
                        >
                          Register
                        </Link>
                      </>
                    )}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            className="lg:hidden text-gray-700"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-gray-100 bg-white lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {primaryLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeAll}
                  className={cn(
                    'flex items-center py-2.5 text-sm font-medium transition-colors',
                    isActive(link.path) ? 'text-[#C9A227] font-semibold' : 'text-gray-800'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <hr className="my-3 border-gray-100" />

              <Link
                to="/wishlist"
                onClick={closeAll}
                className="flex items-center gap-2 py-2.5 text-sm font-medium text-gray-800"
              >
                <Heart className="h-4 w-4" />
                Wishlist
                {wishlistCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C9A227] text-[10px] font-bold text-white">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                onClick={closeAll}
                className="flex items-center gap-2 py-2.5 text-sm font-medium text-gray-800"
              >
                <ShoppingBag className="h-4 w-4" />
                Cart
                {cartCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C9A227] text-[10px] font-bold text-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={closeAll}
                    className="flex items-center gap-2 py-2.5 text-sm font-medium text-gray-800"
                  >
                    <User className="h-4 w-4" />
                    My Account
                  </Link>
                  <Link
                    to="/orders"
                    onClick={closeAll}
                    className="flex items-center gap-2 py-2.5 text-sm font-medium text-gray-800"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      closeAll();
                      navigate('/');
                    }}
                    className="block w-full py-2.5 text-left text-sm text-red-500"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeAll}
                    className="flex items-center gap-2 py-2.5 text-sm font-medium text-[#C9A227]"
                  >
                    <User className="h-4 w-4" />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeAll}
                    className="flex items-center gap-2 py-2.5 text-sm font-medium text-gray-800"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
