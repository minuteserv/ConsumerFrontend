/**
 * PriceDisplay Component
 * 
 * Displays prices with proper formatting:
 * - Shows productCost as the main selling price
 * - Shows marketPrice with strikethrough if it exists and is greater than productCost
 * - Handles cases where only one price exists
 * - Consistent UI across the entire application
 */

export function PriceDisplay({ 
  productCost, 
  marketPrice, 
  className = '',
  size = 'default', // 'small', 'default', 'large'
  showDiscount = false,
  align = 'left' // 'left', 'center', 'right'
}) {
  // Ensure we have valid numbers
  const cost = productCost ? Number(productCost) : null;
  const market = marketPrice ? Number(marketPrice) : null;
  
  // Determine if we should show strikethrough price
  const showStrikethrough = market && cost && market > cost;
  
  // Calculate discount percentage if needed
  const discountPercent = showStrikethrough && showDiscount
    ? Math.round(((market - cost) / market) * 100)
    : null;

  // Size classes
  const sizeClasses = {
    small: {
      main: 'text-sm font-semibold',
      strike: 'text-xs',
      discount: 'text-xs'
    },
    default: {
      main: 'text-base md:text-lg font-bold',
      strike: 'text-xs md:text-sm',
      discount: 'text-xs'
    },
    large: {
      main: 'text-xl md:text-2xl font-bold',
      strike: 'text-sm md:text-base',
      discount: 'text-sm'
    }
  };

  const sizes = sizeClasses[size] || sizeClasses.default;

  // Alignment classes
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  if (!cost && !market) {
    return (
      <span className={`text-muted-foreground ${sizes.main} ${className}`}>
        Price not available
      </span>
    );
  }

  // If only one price exists, show it simply
  if (!showStrikethrough) {
    const displayPrice = cost || market;
    return (
      <div className={`flex items-center ${alignClasses[align]} ${className}`}>
        <span className={`text-foreground ${sizes.main}`}>
          ₹{displayPrice.toLocaleString('en-IN')}
        </span>
      </div>
    );
  }

  // Show both prices with strikethrough
  return (
    <div className={`flex flex-col gap-1 ${alignClasses[align]} ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-foreground ${sizes.main}`}>
          ₹{cost.toLocaleString('en-IN')}
        </span>
        <span className={`text-muted-foreground line-through ${sizes.strike}`}>
          ₹{market.toLocaleString('en-IN')}
        </span>
        {discountPercent && (
          <span className={`text-destructive font-semibold ${sizes.discount}`}>
            {discountPercent}% OFF
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Inline Price Display - for compact spaces
 */
export function InlinePriceDisplay({ 
  productCost, 
  marketPrice, 
  className = '' 
}) {
  const cost = productCost ? Number(productCost) : null;
  const market = marketPrice ? Number(marketPrice) : null;
  const showStrikethrough = market && cost && market > cost;

  if (!cost && !market) {
    return null;
  }

  if (!showStrikethrough) {
    const displayPrice = cost || market;
    return (
      <span className={`font-semibold text-foreground ${className}`}>
        ₹{displayPrice.toLocaleString('en-IN')}
      </span>
    );
  }

  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="font-bold text-foreground">
        ₹{cost.toLocaleString('en-IN')}
      </span>
      <span className="text-muted-foreground line-through text-sm">
        ₹{market.toLocaleString('en-IN')}
      </span>
    </span>
  );
}

