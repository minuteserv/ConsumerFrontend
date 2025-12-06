import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Star, ArrowLeft, Clock, Tag, Package, CheckCircle2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useServices } from '../hooks/useServices';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from '../components/LoginModal';
import { ShareButton } from '../components/ShareButton';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { sanitizeForUrl } from '../lib/utils';

// Safe analytics import - uses loader that handles blocked imports gracefully
import { trackServiceViewed, trackAddToCart } from '../lib/analytics-loader';

export function ServiceDetail() {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional returns
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const { isAuthenticated } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { services: servicesData, loading: servicesLoading, error: servicesError } = useServices();

  // Find the service from the services data (MUST be before useEffect hooks that use it)
  const service = useMemo(() => {
    if (!servicesData?.tiers || !serviceId) {
      console.warn('[ServiceDetail] No services data or serviceId:', { servicesData, serviceId });
      return null;
    }
    
    // First, try to find by database UUID (for direct links)
    if (serviceId.length > 20) {
      // Likely a UUID, search by ID
      for (const tier of servicesData.tiers) {
        for (const category of tier.categories) {
          for (const item of category.items) {
            if (item.id === serviceId) {
              console.log('[ServiceDetail] Found service by UUID:', item.name);
              return {
                ...item,
                tier: tier.tier,
                category: category.category,
              };
            }
          }
        }
      }
    }
    
    // Otherwise, match by routeId (sanitized URL format)
    const attemptedMatches = [];
    for (const tier of servicesData.tiers) {
      for (const category of tier.categories) {
        for (const item of category.items) {
          // Create a unique ID for the service (for routing) - use sanitizeForUrl
          const routeId = `${sanitizeForUrl(tier.tier)}-${sanitizeForUrl(category.category)}-${sanitizeForUrl(item.name)}`;
          attemptedMatches.push({ routeId, name: item.name, tier: tier.tier, category: category.category });
          
          if (routeId === serviceId) {
            console.log('[ServiceDetail] Found service by routeId:', item.name);
            return {
              ...item,
              tier: tier.tier,
              category: category.category,
            };
          }
        }
      }
    }
    
    // Log debug info if service not found
    console.warn('[ServiceDetail] Service not found. Looking for:', serviceId);
    console.warn('[ServiceDetail] Attempted matches (first 5):', attemptedMatches.slice(0, 5));
    return null;
  }, [servicesData, serviceId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [serviceId]);

  // Update Open Graph meta tags for social sharing (WhatsApp preview)
  useEffect(() => {
    if (!service) return;

    const baseUrl = window.location.origin;
    const serviceUrl = `${baseUrl}/service/${serviceId}`;
    const serviceName = service?.name || 'Service';
    const price = service.productCost || service.marketPrice || service.price || '';
    const description = `Book ${serviceName}${price ? ` for just ₹${price}` : ''} at Minuteserv. Get salon-quality service at your doorstep!`;
    
    // Ensure image URL is absolute (required for WhatsApp preview)
    let imageUrl = service.image || `${baseUrl}/favicon.svg`;
    if (imageUrl && !imageUrl.startsWith('http')) {
      // If relative URL, make it absolute
      if (imageUrl.startsWith('/')) {
        imageUrl = `${baseUrl}${imageUrl}`;
      } else {
        imageUrl = `${baseUrl}/${imageUrl}`;
      }
    }

    // Update or create Open Graph meta tags
    const updateMetaTag = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`) || 
                 document.querySelector(`meta[name="${property}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        // Use 'property' for og: tags, 'name' for twitter: tags
        if (property.startsWith('og:')) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update title
    document.title = `${serviceName} - Minuteserv`;

    // Open Graph tags for WhatsApp/Facebook
    updateMetaTag('og:title', serviceName);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', imageUrl);
    updateMetaTag('og:url', serviceUrl);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:image:width', '1200');
    updateMetaTag('og:image:height', '630');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', serviceName);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', imageUrl);

    // Cleanup function to restore default meta tags
    return () => {
      document.title = 'Minuteserv - Beauty Parlor Booking';
      // Optionally restore default meta tags
    };
  }, [service, serviceId]);

  // Track service viewed event
  useEffect(() => {
    try {
      console.log('[ServiceDetail] Service loaded, attempting to track view');
      if (service) {
        if (typeof trackServiceViewed === 'function') {
          trackServiceViewed(service);
        } else {
          console.warn('[ServiceDetail] trackServiceViewed not available');
        }
      }
    } catch (error) {
      console.error('[ServiceDetail] Error in service_viewed tracking (non-blocking):', error);
    }
  }, [service]);

  // Handle loading state (AFTER all hooks)
  if (servicesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showSearch={false} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading service details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state (AFTER all hooks)
  if (servicesError || !servicesData) {
    return (
      <div className="min-h-screen bg-background">
        <Header showSearch={false} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load service details</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Header showSearch={false} />
        <div className="w-full max-w-[1232px] mx-auto px-4 py-6 md:px-6 md:py-10 box-border">
          <div className="text-center py-12 md:py-16 px-4 w-full box-border">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 mt-0">
              Service Not Found
            </h1>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              The service you're looking for doesn't exist.
            </p>
            <Button 
              onClick={() => navigate('/services')}
              className="min-h-[44px] px-6"
            >
              Back to Services
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Correct price logic: productCost is the selling price, marketPrice is the original (strikethrough)
  // Add defensive checks for missing fields
  const productCost = service?.productCost ? Number(service.productCost) : null;
  const marketPrice = service?.marketPrice ? Number(service.marketPrice) : null;
  const showDiscount = marketPrice && productCost && marketPrice > productCost;
  const discount = showDiscount 
    ? Math.round(((marketPrice - productCost) / marketPrice) * 100) 
    : null;
  const duration = service?.durationMinutes ? `${service.durationMinutes} minutes` : 'Not specified';
  
  // Ensure service name exists (fallback for safety)
  const serviceName = service?.name || 'Service';
  const serviceTier = service?.tier || 'Unknown';
  const serviceCategory = service?.category || 'Unknown';
  const serviceBrand = service?.brand || null;

  const handleAddToCart = () => {
    try {
      const serviceWithMeta = {
        ...service,
        id: service.id, // Ensure ID is included (from API or generated)
        category: service.category,
        tier: service.tier,
      };
      addToCart(serviceWithMeta);
      // Track add to cart event
      console.log('[ServiceDetail] Attempting to track add_to_cart');
      if (typeof trackAddToCart === 'function') {
        trackAddToCart(serviceWithMeta, serviceWithMeta.quantity || 1);
      } else {
        console.warn('[ServiceDetail] trackAddToCart not available');
      }
      setShowSuccessModal(true);
    } catch (error) {
      console.error('[ServiceDetail] Error in add_to_cart (non-blocking):', error);
      // Still show modal even if tracking fails
      setShowSuccessModal(true);
    }
  };

  const handleBookNow = () => {
    // CRITICAL SECURITY: Verify authentication before allowing checkout
    if (!isAuthenticated) {
      console.warn('[ServiceDetail] ⚠️ CRITICAL: Unauthenticated checkout attempt - showing login modal');
      setShowLoginModal(true);
      return;
    }
    // User is authenticated - proceed with booking
    handleAddToCart();
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header - Desktop only */}
      <div className="hidden md:block">
        <Header showSearch={false} />
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center text-gray-900 bg-transparent border-none cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 min-w-[44px] min-h-[44px]"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-gray-900 mb-0 leading-tight truncate">
              Service Details
            </h1>
            <p className="text-xs text-gray-600 m-0 truncate">
              {serviceName}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1232px] mx-auto px-4 md:px-6 pt-[78px] md:pt-10 pb-6 md:pb-10 box-border">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="hidden md:inline-flex mb-4 md:mb-6 items-center gap-2 px-4 py-2 min-h-[44px]"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </Button>

        {/* Service Detail Card */}
        <Card className="border border-gray-200 rounded-lg overflow-hidden w-full">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 p-4 md:p-6 lg:p-12 w-full box-border">
            {/* Left Column - Service Info */}
            <div className="flex-1 order-1 min-w-0 w-full lg:w-auto">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 mb-3 md:mb-4 text-sm md:text-base text-gray-600 flex-wrap break-words">
                <span className="break-words">{serviceTier}</span>
                <span>•</span>
                <span className="break-words">{serviceCategory}</span>
              </div>

              {/* Service Name with Share Button */}
              <div className="flex items-start justify-between gap-4 mb-3 md:mb-4">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 mt-0 leading-tight break-words flex-1">
                  {serviceName}
                </h1>
                <ShareButton 
                  service={service} 
                  tier={serviceTier} 
                  category={serviceCategory}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                />
              </div>

              {/* Brand */}
              {serviceBrand && (
                <div className="flex items-center gap-2 mb-4 md:mb-6 flex-wrap">
                  <Package size={18} className="text-gray-600 flex-shrink-0" />
                  <span className="text-sm md:text-base text-gray-600 font-medium break-words">
                    Brand: {serviceBrand}
                  </span>
                </div>
              )}

              {/* Rating and Duration */}
              <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8 flex-wrap">
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-primary fill-primary" />
                  <span className="text-base md:text-lg font-semibold text-gray-900">
                    4.8
                  </span>
                  <span className="text-xs md:text-sm text-gray-600">
                    (500+ ratings)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-gray-600" />
                  <span className="text-sm md:text-base text-gray-600">
                    {duration}
                  </span>
                </div>
              </div>

              {/* Service Details */}
              <div className="p-4 md:p-6 bg-gray-50 rounded-lg mb-6 md:mb-8">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 mt-0">
                  Service Details
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Tag size={16} className="text-gray-600 flex-shrink-0" />
                    <span className="text-sm md:text-base text-gray-600 break-words min-w-0">
                      Service Tier: <strong>{serviceTier}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <Tag size={16} className="text-gray-600 flex-shrink-0" />
                    <span className="text-sm md:text-base text-gray-600 break-words min-w-0">
                      Category: <strong>{serviceCategory}</strong>
                    </span>
                  </div>
                  {serviceBrand && (
                    <div className="flex items-center gap-3 min-w-0">
                      <Package size={16} className="text-gray-600 flex-shrink-0" />
                      <span className="text-sm md:text-base text-gray-600 break-words min-w-0">
                        Product Brand: <strong>{serviceBrand}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Placeholder */}
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 mt-0">
                  About This Service
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed m-0 break-words">
                  Professional {serviceName.toLowerCase()} service at your doorstep. Our expert beauticians use premium products from {serviceBrand || 'trusted brands'} to deliver salon-quality results in the comfort of your home. This {duration} service includes complete care and attention to detail.
                </p>
              </div>
            </div>

            {/* Right Column - Pricing & Actions */}
            <div className="w-full lg:w-[400px] lg:flex-shrink-0 order-2 min-w-0 box-border">
              <Card className="border border-gray-200 rounded-lg p-4 md:p-6 lg:sticky lg:top-24 w-full box-border">
                {/* Service Icon/Image */}
                <div className="w-24 h-24 md:w-32 md:h-32 lg:w-[120px] lg:h-[120px] mx-auto mb-4 md:mb-6 rounded-full overflow-hidden relative flex-shrink-0"
                  style={{
                    backgroundColor: service.image ? 'transparent' : 'rgb(110, 66, 229)'
                  }}>
                  {service?.image ? (
                    <img
                      src={service.image}
                      alt={serviceName}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        // Hide image and show placeholder if image fails to load
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentElement.querySelector('.service-placeholder');
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className="service-placeholder absolute inset-0 flex items-center justify-center rounded-full"
                    style={{
                      display: service?.image ? 'none' : 'flex',
                      backgroundColor: 'rgb(110, 66, 229)'
                    }}
                  >
                    <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                      {serviceName?.charAt(0)?.toUpperCase() || 'S'}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-center mb-4 md:mb-6">
                  {showDiscount && discount && (
                    <Badge className="bg-red-600 text-white mb-3 text-xs md:text-sm px-3 py-1">
                      {discount}% OFF
                    </Badge>
                  )}
                  <PriceDisplay
                    productCost={productCost}
                    marketPrice={marketPrice}
                    size="large"
                    align="center"
                    showDiscount={false}
                    className="mb-2"
                  />
                  <p className="text-xs md:text-sm text-gray-600 mt-2 mb-0">
                    Duration: {duration}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 w-full">
                  <Button
                    onClick={handleBookNow}
                    className="w-full bg-primary text-white py-3 md:py-4 text-base md:text-lg font-semibold rounded-lg min-h-[48px] md:min-h-[52px] box-border"
                  >
                    Book Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAddToCart}
                    className="w-full border-primary text-primary py-3 md:py-4 text-base md:text-lg font-semibold rounded-lg min-h-[48px] md:min-h-[52px] box-border"
                  >
                    Add to Cart
                  </Button>
                </div>

                {/* Trust Badge */}
                <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed m-0">
                    ✓ Safe & Hygienic<br />
                    ✓ Certified Professionals<br />
                    ✓ Home Service Available
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-[90vw] md:max-w-md rounded-lg p-4 md:p-6">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 size={48} className="text-green-500 fill-green-500 opacity-20" />
            </div>
            <DialogTitle className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              Added to Cart!
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base text-gray-600">
              {serviceName} has been added to your cart successfully.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowSuccessModal(false)}
              className="w-full sm:w-auto border-gray-300 text-gray-700 min-h-[44px]"
            >
              Continue Shopping
            </Button>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                // CRITICAL SECURITY: Verify authentication before allowing checkout
                if (!isAuthenticated) {
                  console.warn('[ServiceDetail] ⚠️ CRITICAL: Unauthenticated checkout attempt - showing login modal');
                  setShowLoginModal(true);
                  return;
                }
                navigate('/checkout');
              }}
              className="w-full sm:w-auto bg-primary text-white min-h-[44px]"
            >
              Go to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Modal - shown when user tries to checkout without authentication */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={(open) => {
          setShowLoginModal(open);
          if (!open && !isAuthenticated) {
            // If user closes modal without logging in, stay on service page
            console.warn('[ServiceDetail] User closed login modal without authenticating');
          }
        }}
        onSuccess={() => {
          // After successful login, user can proceed to checkout
          setShowLoginModal(false);
          // Optionally navigate to checkout after login
          if (cart.length > 0) {
            navigate('/checkout');
          }
        }}
      />
    </div>
  );
}

