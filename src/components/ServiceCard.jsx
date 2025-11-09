import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Check } from 'lucide-react';

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
  const price = service.marketPrice || service.productCost || 0;
  const originalPrice = service.marketPrice && service.productCost ? service.marketPrice : null;
  const discount = originalPrice && price < originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : null;
  const duration = service.durationMinutes ? `${service.durationMinutes} Mins` : 'N/A';

  // Generate service ID for routing
  const serviceId = `${tier}-${category}-${service.name}`.toLowerCase().replace(/\s+/g, '-');

  const handleCardClick = (e) => {
    // Don't navigate if clicking on the button
    if (e.target.closest('button')) {
      return;
    }
    navigate(`/service/${serviceId}`);
  };

  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent card click
    const serviceWithMeta = {
      ...service,
      id: service.id, // Ensure ID is included (from API or generated)
      category,
      tier,
    };
    addToCart(serviceWithMeta);
    if (onSelect) onSelect();
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative h-40 md:h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
        {service.image ? (
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover"
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
          className="placeholder w-16 h-16 md:w-20 md:h-20 bg-primary rounded-full flex items-center justify-center"
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
        {discount && (
          <Badge className="absolute top-2 right-2 bg-destructive z-10">
            {discount}% OFF
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-foreground text-base md:text-lg mb-1 line-clamp-1">
            {service.name}
          </h3>
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
          <div>
            {originalPrice && price < originalPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-base md:text-lg font-bold text-foreground">₹{price}</span>
                <span className="text-xs md:text-sm text-muted-foreground line-through">₹{originalPrice}</span>
              </div>
            ) : (
              <span className="text-base md:text-lg font-bold text-foreground">₹{price}</span>
            )}
          </div>
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