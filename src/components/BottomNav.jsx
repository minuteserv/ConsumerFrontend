import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Coins, ShoppingCart } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut } from 'lucide-react';

export function BottomNav() {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navRef = useRef(null);

  // Ensure nav stays fixed after load and prevent layout shifts
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Force fixed positioning after mount
    const ensureFixed = () => {
      if (nav) {
        nav.style.position = 'fixed';
        nav.style.bottom = '0';
        nav.style.left = '0';
        nav.style.right = '0';
        nav.style.width = '100%';
        nav.style.zIndex = '9999';
      }
    };

    // Run immediately and after a short delay to catch any late style changes
    ensureFixed();
    const timeoutId = setTimeout(ensureFixed, 100);
    const timeoutId2 = setTimeout(ensureFixed, 500);

    // Also ensure on window resize
    window.addEventListener('resize', ensureFixed);
    window.addEventListener('scroll', ensureFixed);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
      window.removeEventListener('resize', ensureFixed);
      window.removeEventListener('scroll', ensureFixed);
    };
  }, []);

  // Hide bottom nav on cart and checkout pages for mobile web
  // These pages have their own bottom action bars with proceed buttons
  const isCartOrCheckout = location.pathname === '/cart' || location.pathname === '/checkout';
  
  // Don't render bottom nav on cart/checkout pages
  if (isCartOrCheckout) {
    return null;
  }

  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: () => (
        <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">MS</span>
        </div>
      ),
      isLogo: true,
    },
    {
      path: '/services',
      label: 'Services',
      icon: ShoppingBag,
      isLogo: false,
    },
    {
      path: '/cart',
      label: 'Cart',
      icon: ShoppingCart,
      isLogo: false,
      showBadge: true,
    },
    {
      path: '/account',
      label: 'Account',
      icon: User,
      isLogo: false,
      onClick: (e) => {
        if (!isAuthenticated) {
          e.preventDefault();
          // Trigger login modal via custom event
          window.dispatchEvent(new CustomEvent('open-login-modal'));
        }
      },
    },
  ];

  const handleAccountClick = (e, item) => {
    if (item.onClick) {
      item.onClick(e);
    }
    if (isAuthenticated) {
      e.preventDefault();
      setShowUserMenu(true);
    }
  };

  return (
    <>
      <nav 
        ref={navRef}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[9999] md:hidden shadow-[0_-2px_8px_rgba(0,0,0,0.1)]"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          maxWidth: '100%',
          margin: 0,
          padding: 0,
          transform: 'translateZ(0)', // Force hardware acceleration
          WebkitTransform: 'translateZ(0)',
          willChange: 'transform', // Optimize for fixed positioning
          backfaceVisibility: 'hidden', // Prevent flickering
          WebkitBackfaceVisibility: 'hidden',
          isolation: 'isolate', // Create new stacking context
        }}
      >
        <div 
          className="flex items-center justify-around w-full h-[64px] px-2"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom, 8px)',
            minHeight: '64px',
            height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path === '/' && location.pathname === '/') ||
              (item.path === '/services' && location.pathname.startsWith('/service')) ||
              (item.path === '/cart' && location.pathname === '/cart');

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => {
                  if (item.path === '/account') {
                    handleAccountClick(e, item);
                  }
                }}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 max-w-[120px] min-w-0 transition-all duration-200',
                  'touch-manipulation', // Optimize touch
                  'active:opacity-70', // Touch feedback
                  isActive ? 'text-primary' : 'text-gray-600'
                )}
                style={{
                  minHeight: '44px', // Touch target size
                  WebkitTapHighlightColor: 'transparent', // Remove tap highlight
                }}
              >
                <div 
                  className={cn(
                    'flex items-center justify-center mb-0.5 relative',
                    isActive && !item.isLogo ? 'text-primary' : ''
                  )}
                  style={{
                    minHeight: '24px',
                    minWidth: '24px',
                  }}
                >
                  {item.isLogo ? (
                    <Icon />
                  ) : (
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                  {item.showBadge && getTotalItems() > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 text-[10px] flex items-center justify-center bg-red-600 text-white border-0">
                      {getTotalItems()}
                    </Badge>
                  )}
                </div>
                <span 
                  className={cn(
                    'text-[10px] sm:text-[11px] font-medium leading-tight text-center truncate w-full px-1',
                    isActive ? 'text-primary font-semibold' : 'text-gray-600'
                  )}
                  style={{
                    lineHeight: '1.2',
                    maxWidth: '100%',
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Menu Dialog - Mobile */}
      {isAuthenticated && (
        <Dialog open={showUserMenu} onOpenChange={setShowUserMenu}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Account</DialogTitle>
              <DialogDescription>
                Manage your account and bookings
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="px-4 py-3 border-b border-gray-200 mb-2">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-600">
                  {user?.phoneNumber || user?.phone_number || ''}
                </p>
              </div>
              <Link to="/bookings" onClick={() => setShowUserMenu(false)}>
                <button className="w-full px-4 py-3 text-left text-sm text-gray-900 flex items-center gap-2 hover:bg-gray-50 transition-colors rounded-lg">
                  <User size={16} />
                  My Bookings
                </button>
              </Link>
              <Link to="/loyalty" onClick={() => setShowUserMenu(false)}>
                <button className="w-full px-4 py-3 text-left text-sm text-gray-900 flex items-center gap-2 hover:bg-gray-50 transition-colors rounded-lg">
                  <Coins size={16} />
                  Loyalty Points
                </button>
              </Link>
            </div>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
