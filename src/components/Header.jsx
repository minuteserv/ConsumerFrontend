import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Search, ShoppingCart, User, ChevronDown, TrendingUp, LogOut, Coins } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { COMPANY_INFO } from '../lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { LoginModal } from './LoginModal';
import { LocationModal } from './LocationModal';
import { PointsBalance } from './loyalty/PointsBalance';
import { getPointsBalance } from '@/lib/api';

export function Header({ title, showBack = false, showSearch = true }) {
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { currentLocation } = useLocation();
  const [activeTab, setActiveTab] = useState('Beauty');
  const [showTrendingSearches, setShowTrendingSearches] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [pointsBalance, setPointsBalance] = useState(null);
  const [loadingPoints, setLoadingPoints] = useState(true);
  const mobileOffsetClass = showSearch ? 'h-[120px]' : 'h-[72px]';
  const userMenuRef = useRef(null);

  // Fetch points balance for mobile header badge
  useEffect(() => {
    const fetchPoints = async () => {
      try {
        setLoadingPoints(true);
        const balance = await getPointsBalance();
        setPointsBalance(balance?.points_balance || 0);
      } catch (error) {
        console.error('Failed to load points balance:', error);
        setPointsBalance(0);
      } finally {
        setLoadingPoints(false);
      }
    };

    fetchPoints();
  }, []);
  
  // Listen for login modal open event from BottomNav
  useEffect(() => {
    const handleOpenLogin = () => {
      setShowLoginModal(true);
    };
    window.addEventListener('open-login-modal', handleOpenLogin);
    return () => {
      window.removeEventListener('open-login-modal', handleOpenLogin);
    };
  }, []);

  // Handle clicks outside user menu dropdown (Desktop only)
  useEffect(() => {
    if (!showUserMenu) return;

    const handleClickOutside = (e) => {
      console.log('[DEBUG] Document click detected', e.target, e.currentTarget);
      
      // Check if click is inside the dropdown menu
      if (userMenuRef.current && userMenuRef.current.contains(e.target)) {
        console.log('[DEBUG] Click is inside dropdown, ignoring');
        return;
      }
      
      // Check if click is on the user button (to toggle menu)
      const userButton = e.target.closest('button[data-user-menu-button="true"]');
      if (userButton) {
        console.log('[DEBUG] Click is on user button, ignoring (will be handled by button onClick)');
        return;
      }
      
      console.log('[DEBUG] Click is outside dropdown and user button, closing menu');
      setShowUserMenu(false);
    };

    // Use a small delay to ensure button onClick handlers fire first
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, false);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside, false);
    };
  }, [showUserMenu]);
  
  // Get display location text for desktop
  const getDisplayLocation = () => {
    if (!currentLocation) return 'Select location';
    // If name is "Current Location", prefer address to show actual location
    if (currentLocation.name === 'Current Location') {
      return currentLocation.address || currentLocation.name || 'Select location';
    }
    // Otherwise use name or address
    return currentLocation.name || currentLocation.address || 'Select location';
  };
  const displayLocation = getDisplayLocation();

  // Get mobile location display (truncated single line)
  // NEVER show "Current Location" - always show actual address/location name
  const getMobileLocationDisplay = () => {
    if (!currentLocation) {
      return 'Select location';
    }
    
    // CRITICAL: If name is "Current Location", use address instead
    // Priority: address > addressLine1 > name (if not "Current Location") > locality > city
    let locationText = null;
    
    if (currentLocation.name === 'Current Location') {
      // Skip name if it's "Current Location", use address instead
      locationText = currentLocation.address ||
                     currentLocation.addressLine1 || 
                     currentLocation.locality ||
                     currentLocation.city ||
                     'Select location';
    } else {
      // Use name if it's not "Current Location"
      locationText = currentLocation.name || 
                     currentLocation.address ||
                     currentLocation.addressLine1 || 
                     currentLocation.locality ||
                     currentLocation.city ||
                     'Select location';
    }
    
    return locationText;
  };
  const mobileLocationDisplay = getMobileLocationDisplay();

  const trendingSearches = ['Salon', 'Massage for men', 'Spa luxe', 'Party makeup'];

  return (
    <>
      {/* Mobile Header - Location + Cart Only */}
      <header className="md:hidden bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Location Selector - Mobile */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="flex-1 flex items-center gap-2 px-3 py-2.5 h-11 border border-gray-200 rounded-lg bg-white min-h-[44px] min-w-0"
            >
              <MapPin size={18} className="text-gray-500 flex-shrink-0" />
              <div className="flex-1 text-left min-w-0 overflow-hidden">
                <div className={`text-xs font-semibold overflow-hidden text-ellipsis whitespace-nowrap ${
                  currentLocation ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {mobileLocationDisplay}
                </div>
              </div>
              <ChevronDown size={14} className="text-gray-500 flex-shrink-0 ml-1" />
            </button>

            {/* Points Badge - Mobile (Replaces Cart) */}
            <Link to="/loyalty" className="relative flex items-center flex-shrink-0 group">
              <button className="w-12 h-12 border-2 border-gray-200 rounded-full bg-white flex items-center justify-center p-0 min-h-[48px] min-w-[48px] hover:border-primary/50 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md active:scale-95">
                <div className="w-8 h-8 flex items-center justify-center relative">
                  <DotLottieReact
                    src="/Coin.lottie"
                    loop
                    autoplay
                    className="w-full h-full"
                    style={{ width: '32px', height: '32px' }}
                  />
                </div>
              </button>
              {!loadingPoints && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 text-xs flex items-center justify-center bg-primary text-white font-semibold shadow-sm border-2 border-white z-10">
                  {pointsBalance?.toLocaleString() || 0}
                </Badge>
              )}
            </Link>
          </div>
        </div>

        {/* Fixed Search Bar - Mobile */}
        {showSearch && (
          <div className="sticky top-[60px] z-40 bg-white border-b border-gray-200">
            <div className="px-4 py-2.5">
              <div className="relative">
                <div className="bg-gray-50 border border-gray-200 rounded-lg flex items-center px-4 h-12 relative overflow-hidden">
                  <Search size={20} className="text-gray-600 mr-3 flex-shrink-0" />
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onFocus={() => setShowTrendingSearches(true)}
                      onBlur={() => setTimeout(() => setShowTrendingSearches(false), 200)}
                      className="w-full text-sm text-gray-900 font-normal border-none outline-none bg-transparent p-0"
                    />
                    {/* Moving Placeholder Animation - Only show when input is empty */}
                    {!searchValue && (
                      <div className="absolute inset-0 pointer-events-none flex items-center">
                        <span className="text-sm text-gray-400">
                          Search for '<span className="font-medium text-gray-500">Salon</span>'
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Trending Searches Dropdown - Mobile */}
                {showTrendingSearches && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 p-3 shadow-lg z-[100] max-h-[400px] overflow-y-auto">
                    <p className="text-sm font-semibold text-gray-900 mb-2 mt-0">
                      Trending searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((search, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setShowTrendingSearches(false);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 border border-gray-200 rounded-full bg-white cursor-pointer text-xs text-gray-600 font-normal transition-all hover:bg-gray-50 min-h-[32px]"
                        >
                          <TrendingUp size={12} className="text-gray-400" />
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      <div className={`md:hidden ${mobileOffsetClass}`}></div>

      {/* Desktop Header */}
      <header className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full max-w-[1232px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-8 py-4">
            {/* Left Section: Logo */}
            <div className="flex-shrink-0 pr-4 lg:pr-8">
              <Link 
                to="/" 
                className="inline-flex flex-col gap-1 group no-underline"
                aria-label={`${COMPANY_INFO.name} home`}
              >
                <span
                  className="text-[26px] leading-[26px] font-semibold text-gray-900 tracking-tight transition-transform duration-200 group-hover:-translate-y-0.5"
                  style={{
                    fontFamily: "'Inter', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                    letterSpacing: '-0.015em',
                    fontSize: '24px',
                    fontWeight: '500',
                  }}
                >
                  Minute<span className="font-medium text-gray-600">serv</span>
                </span>
                {/* <span className="text-[11px] uppercase tracking-[0.3em] text-gray-400">
                  beauty & wellness
                </span> */}
              </Link>
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Location Selector */}
            <div className="flex-shrink-0">
              <button
                onClick={() => setShowLocationModal(true)}
                className="px-4 py-3 h-12 flex items-center gap-2 border border-gray-200 rounded-lg bg-white cursor-pointer min-w-[160px] md:min-w-[200px] max-w-[200px]"
              >
                <MapPin size={20} className="text-gray-500 flex-shrink-0" />
                <span className={`flex-1 text-sm text-left overflow-hidden text-ellipsis whitespace-nowrap ${
                  currentLocation ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                  {displayLocation}
                </span>
                <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
              </button>
            </div>

            {/* Search with Trending */}
            {showSearch && (
              <div className="flex-shrink-0 relative pl-2">
                <div className="bg-white border border-gray-200 rounded-lg flex items-center px-4 h-12 relative">
                  <Search size={20} className="text-gray-600 mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Salon"
                    onFocus={() => setShowTrendingSearches(true)}
                    onBlur={() => setTimeout(() => setShowTrendingSearches(false), 200)}
                    className="flex-1 text-sm text-gray-600 font-normal border-none outline-none bg-transparent p-0"
                  />
                  <div className="w-0 h-0 overflow-hidden"></div>
                </div>
                
                {/* Trending Searches Dropdown - Shown on focus */}
                {showTrendingSearches && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 p-4 shadow-lg z-[100]">
                    <p className="text-base font-semibold text-gray-900 mb-3 mt-0">
                      Trending searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((search, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setShowTrendingSearches(false);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full bg-white cursor-pointer text-xs text-gray-600 font-normal transition-all hover:bg-gray-50"
                        >
                          <TrendingUp size={14} className="text-gray-400" />
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Right Section: Cart and User */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <Link to="/cart" className="relative flex items-center">
                <button className="w-10 h-10 border-2 border-gray-200 rounded-full bg-white flex items-center justify-center p-0">
                  <ShoppingCart size={18} className="text-gray-900" />
                </button>
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 text-xs flex items-center justify-center">
                    {getTotalItems()}
                  </Badge>
                )}
              </Link>
              
              {/* User/Login Button */}
              <div className="relative">
                {isAuthenticated ? (
                  <button
                    data-user-menu-button="true"
                    onClick={(e) => {
                      console.log('[DEBUG] User menu button clicked, current state:', showUserMenu);
                      e.stopPropagation();
                      setShowUserMenu(!showUserMenu);
                      console.log('[DEBUG] User menu state set to:', !showUserMenu);
                    }}
                    className="w-10 h-10 border-none rounded-full bg-primary flex items-center justify-center p-0"
                  >
                    <User size={20} className="text-white" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="w-10 h-10 border-none rounded-full bg-transparent flex items-center justify-center p-0"
                  >
                    <User size={20} className="text-gray-900" />
                  </button>
                )}
                
                {/* User Dropdown Menu - Desktop */}
                {isAuthenticated && showUserMenu && (
                  <div 
                    ref={userMenuRef}
                    className="hidden md:block absolute top-full right-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] z-[120] py-2 mt-1 pointer-events-auto"
                    onClick={(e) => {
                      console.log('[DEBUG] Dropdown container clicked', e.target);
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                      console.log('[DEBUG] Dropdown container mousedown', e.target);
                      e.stopPropagation();
                    }}
                  >
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900 mb-1 mt-0">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-600 m-0">
                        {user?.phoneNumber || user?.phone_number || ''}
                      </p>
                    </div>
                    <div className="px-4 py-3 border-b border-gray-200">
                      <PointsBalance showTier={true} />
                    </div>
                    <button
                      onClick={(e) => {
                        console.log('[DEBUG] My Bookings button clicked', e);
                        e.preventDefault();
                        e.stopPropagation();
                        setShowUserMenu(false);
                        console.log('[DEBUG] Navigating to /bookings');
                        navigate('/bookings');
                      }}
                      onMouseDown={(e) => {
                        console.log('[DEBUG] My Bookings button mousedown', e);
                        e.stopPropagation();
                      }}
                      onMouseUp={(e) => {
                        console.log('[DEBUG] My Bookings button mouseup', e);
                        e.stopPropagation();
                      }}
                      className="w-full px-4 py-3 border-none bg-transparent text-left cursor-pointer text-sm text-gray-900 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                      <User size={16} />
                      My Bookings
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowUserMenu(false);
                        navigate('/loyalty');
                      }}
                      className="w-full px-4 py-3 border-none bg-transparent text-left cursor-pointer text-sm text-gray-900 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                      <Coins size={16} />
                      Loyalty Points
                    </button>
                    <button
                      onClick={async (e) => {
                        console.log('[DEBUG] Logout button clicked', e);
                        e.preventDefault();
                        e.stopPropagation();
                        setShowUserMenu(false);
                        console.log('[DEBUG] Calling logout function');
                        await logout();
                        console.log('[DEBUG] Logout complete, navigating to home');
                        // Navigate to home after logout
                        navigate('/');
                      }}
                      onMouseDown={(e) => {
                        console.log('[DEBUG] Logout button mousedown', e);
                        e.stopPropagation();
                      }}
                      onMouseUp={(e) => {
                        console.log('[DEBUG] Logout button mouseup', e);
                        e.stopPropagation();
                      }}
                      className="w-full px-4 py-3 border-none bg-transparent text-left cursor-pointer text-sm text-red-600 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
      />
      
      {/* Location Modal */}
      <LocationModal
        open={showLocationModal}
        onOpenChange={setShowLocationModal}
      />
      
      {/* Overlay to close user menu - Desktop only (visual only, clicks handled by document listener) */}
      {showUserMenu && (
        <div
          className="hidden md:block fixed inset-0 z-[80] pointer-events-none"
        />
      )}
    </>
  );
}