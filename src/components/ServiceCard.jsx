import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Check } from 'lucide-react';
import { ShareButtonIcon } from './ShareButton';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { sanitizeForUrl } from '../lib/utils';

// Safe analytics import - uses loader that handles blocked imports gracefully
import { trackAddToCart } from '../lib/analytics-loader';

export function ServiceCard({ service, category, tier, onSelect }) {
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  
  // Check if service is in cart
  const isInCart = cart.some(item => {
    if (service.id) {
      return item.id === service.id;
    }
    return item.name === service.name && 
           item.category === category && 
           item.tier === tier;
  });
  // Correct price logic: productCost is the selling price, marketPrice is the original (strikethrough)
  const productCost = service.productCost ? Number(service.productCost) : null;
  const marketPrice = service.marketPrice ? Number(service.marketPrice) : null;
  const showDiscount = marketPrice && productCost && marketPrice > productCost;
  const discount = showDiscount 
    ? Math.round(((marketPrice - productCost) / marketPrice) * 100) 
    : null;
  const duration = service.durationMinutes ? `${service.durationMinutes} Mins` : 'N/A';

  // Generate service ID for routing - use sanitizeForUrl to handle special characters
  const serviceId = `${sanitizeForUrl(tier)}-${sanitizeForUrl(category)}-${sanitizeForUrl(service.name)}`;

  const handleCardClick = (e) => {
    // Don't navigate if clicking on the button
    if (e.target.closest('button')) {
      return;
    }
    navigate(`/service/${serviceId}`);
  };

  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent card click
    try {
      const serviceWithMeta = {
        ...service,
        id: service.id, // Ensure ID is included (from API or generated)
        category,
        tier,
      };
      addToCart(serviceWithMeta);
      // Track add to cart event
      console.log('[ServiceCard] Attempting to track add_to_cart');
      if (typeof trackAddToCart === 'function') {
        trackAddToCart(serviceWithMeta, 1);
      } else {
        console.warn('[ServiceCard] trackAddToCart not available');
      }
      if (onSelect) onSelect();
    } catch (error) {
      console.error('[ServiceCard] Error in handleSelect (non-blocking):', error);
      // Still add to cart even if tracking fails
      const serviceWithMeta = {
        ...service,
        id: service.id,
        category,
        tier,
      };
      addToCart(serviceWithMeta);
      if (onSelect) onSelect();
    }
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer md:max-w-[326px] md:w-[326px]"
      onClick={handleCardClick}
    >
      <div className="relative h-40 md:h-[160px] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden md:mx-auto md:w-full">
        {service.image ? (
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover md:h-[160px] md:w-[326px] md:max-w-full"
            onError={(e) => {
              // Hide image and show placeholder if image fails to load
              e.target.style.display = 'none';
              const placeholder = e.target.parentElement.querySelector('.placeholder');
              if (placeholder) {
                placeholder.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div 
          className="placeholder w-16 h-16 md:w-[326px] md:h-[160px] md:rounded-none md:bg-transparent bg-primary rounded-full flex items-center justify-center border border-dashed border-primary/50"
          style={{ 
            display: service.image ? 'none' : 'flex',
            position: service.image ? 'absolute' : 'relative',
            ...(service.image ? { inset: 0, margin: 'auto' } : {})
          }}
        >
          <span className="text-primary-foreground font-bold text-xl md:text-2xl">
            {service.name.charAt(0)}
          </span>
        </div>
        {showDiscount && discount && (
          <Badge className="absolute top-2 right-2 bg-destructive z-10">
            {discount}% OFF
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-base md:text-lg line-clamp-1 flex-1">
              {service.name}
            </h3>
            <ShareButtonIcon 
              service={service} 
              tier={tier} 
              category={category}
              className="shrink-0"
            />
          </div>
          {service.brand && (
            <p className="text-sm text-muted-foreground mb-2">{service.brand}</p>
          )}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-primary text-primary" />
              <span className="text-xs md:text-sm font-medium">4.8</span>
            </div>
            <span className="text-[11px] md:text-xs text-muted-foreground">•</span>
            <span className="text-[11px] md:text-xs text-muted-foreground">{duration}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <PriceDisplay
            productCost={productCost}
            marketPrice={marketPrice}
            size="default"
            align="left"
          />
          <Button
            variant={isInCart ? "default" : "outline"}
            size="sm"
            onClick={handleSelect}
            className={`shrink-0 transition-all duration-200 ${
              isInCart 
                ? 'bg-primary text-primary-foreground shadow-md hover:shadow-lg' 
                : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'
            }`}
          >
            {isInCart ? (
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Added</span>
              </span>
            ) : (
              'Select'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}