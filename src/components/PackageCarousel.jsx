import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function PackageCarousel({ title, subtitle, services, onSeeAll, onServiceClick }) {
  return (
    <div className="mt-6 mb-6 md:mt-10 md:mb-10" style={{ maxWidth: '1232px', width: '100%', margin: '45px auto', padding: '0 16px' }}>
      {/* Header with title, subtitle, and See all button */}
      <div className="mb-3 md:mb-4">
        <div style={{ 
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              flexDirection: 'column'
            }}>
              <h2 
                className="text-2xl md:text-[36px] leading-7 md:leading-[44px]"
                style={{ 
                  fontFamily: 'system-ui, sans-serif',
                  color: 'rgb(15, 15, 15)',
                  fontWeight: 600,
                  textAlign: 'left',
                  marginBottom: 0,
                  marginTop: 0,
                  WebkitLineClamp: 2,
                  overflow: 'hidden',
                  textDecorationLine: 'none',
                  textTransform: 'none'
                }}
              >
                {title}
              </h2>
              {subtitle && (
                <>
                  <div style={{ marginTop: '4px', height: '1px' }}></div>
                  <p
                    className="text-sm md:text-base leading-5 md:leading-6"
                    style={{
                      fontFamily: 'system-ui, sans-serif',
                      color: 'rgb(84, 84, 84)',
                      fontWeight: 400,
                      textAlign: 'left',
                      marginTop: 0,
                      marginBottom: 0,
                      textDecorationLine: 'none',
                      textTransform: 'none'
                    }}
                  >
                    {subtitle}
                  </p>
                </>
              )}
            </div>
          </div>
          {onSeeAll && (
            <div style={{ alignSelf: 'flex-start', marginTop: 0 }}>
              <Button
                variant="ghost"
                onClick={onSeeAll}
                className="text-xs md:text-sm leading-4 md:leading-5 px-3 py-1.5 md:px-4 md:py-2"
                style={{
                  fontFamily: 'system-ui, sans-serif',
                  color: 'rgb(110, 66, 229)',
                  fontWeight: 600
                }}
              >
                See all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Services Carousel */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="gap-3 md:gap-4" style={{ 
          display: 'flex', 
          paddingBottom: '8px',
          alignItems: 'flex-start'
        }}>
          {services.map((service, idx) => (
            <div
              key={idx}
              tabIndex={0}
              onClick={() => onServiceClick?.(service)}
              className="cursor-pointer w-[180px] md:w-[233.6px]"
              style={{
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {/* Image Container with optional badge */}
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                {/* {service.discount && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    zIndex: 10,
                    backgroundColor: 'rgb(255, 77, 77)',
                    borderRadius: '4px',
                    padding: '4px 8px'
                  }}>
                    <p style={{
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '12px',
                      lineHeight: '16px',
                      color: 'rgb(255, 255, 255)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                      margin: 0
                    }}>
                      {service.discount}
                    </p>
                  </div>
                )} */}
                <div 
                  className="w-[180px] h-[180px] md:w-[233px] md:h-[233px]"
                  style={{
                    overflow: 'hidden',
                    border: '0px',
                    borderRadius: '8px',
                    opacity: 1
                  }}
                >
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      style={{
                        objectFit: 'cover',
                        height: '100%',
                        width: '100%',
                        backgroundColor: 'transparent',
                        display: 'block'
                      }}
                      loading="lazy"
                      onError={(e) => {
                        // Hide image and show placeholder on error
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className="image-placeholder"
                    style={{
                      display: service.image ? 'none' : 'flex',
                      position: 'absolute',
                      inset: 0,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgb(110, 66, 229)',
                      color: 'white',
                      fontSize: '32px',
                      fontWeight: 'bold'
                    }}
                  >
                    {service.name.charAt(0)}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Title */}
                <div style={{ marginBottom: '4px' }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onServiceClick?.(service);
                    }}
                    className="text-sm md:text-base leading-5 md:leading-6"
                    style={{
                      fontFamily: 'system-ui, sans-serif',
                      color: 'rgb(15, 15, 15)',
                      fontWeight: 600,
                      textDecoration: 'none',
                      textAlign: 'left',
                      margin: 0,
                      WebkitLineClamp: 2,
                      overflow: 'hidden',
                      textTransform: 'none',
                      display: 'block'
                    }}
                  >
                    {service.name}
                  </a>
                </div>

                {/* Rating removed as per latest requirements */}

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="text-xs md:text-sm leading-4 md:leading-5" style={{
                    fontFamily: 'system-ui, sans-serif',
                    color: 'rgb(15, 15, 15)',
                    fontWeight: 400
                  }}>
                    ₹{service.price}
                  </span>
                  {/* {service.originalPrice && (
                    <span className="text-xs md:text-sm leading-4 md:leading-5" style={{
                      fontFamily: 'system-ui, sans-serif',
                      color: 'rgb(84, 84, 84)',
                      fontWeight: 400,
                      textDecoration: 'line-through'
                    }}>
                      ₹{service.originalPrice}
                    </span>
                  )} */}
                </div>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  );
}
