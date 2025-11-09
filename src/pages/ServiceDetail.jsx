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

export function ServiceDetail() {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional returns
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { services: servicesData, loading: servicesLoading, error: servicesError } = useServices();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [serviceId]);

  // Find the service from the services data (MUST be before conditional returns)
  const service = useMemo(() => {
    if (!servicesData?.tiers || !serviceId) return null;
    
    for (const tier of servicesData.tiers) {
      for (const category of tier.categories) {
        for (const item of category.items) {
          // Create a unique ID for the service (for routing)
          const routeId = `${tier.tier}-${category.category}-${item.name}`.toLowerCase().replace(/\s+/g, '-');
          
          // Also check if serviceId is a database UUID
          if (routeId === serviceId || item.id === serviceId) {
            return {
              ...item,
              tier: tier.tier,
              category: category.category,
            };
          }
        }
      }
    }
    return null;
  }, [servicesData, serviceId]);

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

  const price = service.productCost || service.marketPrice || 0;
  const originalPrice = service.marketPrice && service.productCost && service.marketPrice > service.productCost 
    ? service.marketPrice 
    : null;
  const discount = originalPrice && price < originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : null;
  const duration = service.durationMinutes ? `${service.durationMinutes} minutes` : 'Not specified';

  const handleAddToCart = () => {
    const serviceWithMeta = {
      ...service,
      id: service.id, // Ensure ID is included (from API or generated)
      category: service.category,
      tier: service.tier,
    };
    addToCart(serviceWithMeta);
    setShowSuccessModal(true);
  };

  const handleBookNow = () => {
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
              {service.name}
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
                <span className="break-words">{service.tier}</span>
                <span>•</span>
                <span className="break-words">{service.category}</span>
              </div>

              {/* Service Name */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 mb-3 md:mb-4 mt-0 leading-tight break-words">
                {service.name}
              </h1>

              {/* Brand */}
              {service.brand && (
                <div className="flex items-center gap-2 mb-4 md:mb-6 flex-wrap">
                  <Package size={18} className="text-gray-600 flex-shrink-0" />
                  <span className="text-sm md:text-base text-gray-600 font-medium break-words">
                    Brand: {service.brand}
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
                      Service Tier: <strong>{service.tier}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <Tag size={16} className="text-gray-600 flex-shrink-0" />
                    <span className="text-sm md:text-base text-gray-600 break-words min-w-0">
                      Category: <strong>{service.category}</strong>
                    </span>
                  </div>
                  {service.brand && (
                    <div className="flex items-center gap-3 min-w-0">
                      <Package size={16} className="text-gray-600 flex-shrink-0" />
                      <span className="text-sm md:text-base text-gray-600 break-words min-w-0">
                        Product Brand: <strong>{service.brand}</strong>
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
                  Professional {service.name.toLowerCase()} service at your doorstep. Our expert beauticians use premium products from {service.brand || 'trusted brands'} to deliver salon-quality results in the comfort of your home. This {duration} service includes complete care and attention to detail.
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
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
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
                      display: service.image ? 'none' : 'flex',
                      backgroundColor: 'rgb(110, 66, 229)'
                    }}
                  >
                    <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                      {service.name.charAt(0)}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-center mb-4 md:mb-6">
                  {discount && (
                    <Badge className="bg-red-600 text-white mb-3 text-xs md:text-sm px-3 py-1">
                      {discount}% OFF
                    </Badge>
                  )}
                  <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap break-words">
                    <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 break-words">
                      ₹{price}
                    </span>
                    {originalPrice && (
                      <span className="text-lg md:text-xl lg:text-2xl text-gray-600 line-through break-words">
                        ₹{originalPrice}
                      </span>
                    )}
                  </div>
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
              {service.name} has been added to your cart successfully.
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
                navigate('/checkout');
              }}
              className="w-full sm:w-auto bg-primary text-white min-h-[44px]"
            >
              Go to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

