import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Search', icon: Search, href: '/search' },
  { label: 'Wishlist', icon: Heart, href: '/wishlist', authRequired: true },
  { label: 'Cart', icon: ShoppingBag, href: '/cart' },
  { label: 'Profile', icon: User, href: '/profile', authRequired: true },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { cartCount } = useCart();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.href);

          const needsAuth = item.authRequired && !user;
          const targetHref = needsAuth ? '/login' : item.href;

          return (
            <Link
              key={item.href}
              to={targetHref}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-3 py-1 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.href === '/cart' && cartCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
