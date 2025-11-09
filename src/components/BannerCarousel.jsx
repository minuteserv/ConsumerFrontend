import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function BannerCarousel({ banners = [], onBannerClick }) {
  return (
    <div className="mt-6 mb-6 md:mt-10 md:mb-10" style={{ maxWidth: '1232px', width: '100%', margin: '45px auto', padding: '0 16px' }}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="gap-3 md:gap-4" style={{ 
          display: 'flex', 
          paddingBottom: '8px',
          justifyContent: 'flex-start',
          alignItems: 'flex-start'
        }}>
          {banners.map((banner, idx) => (
            <div
              key={idx}
              tabIndex={0}
              className="cursor-pointer w-[260px] h-[160px] md:w-[394px] md:h-[222px]"
              onClick={() => onBannerClick?.(banner)}
              style={{
                overflow: 'hidden',
                border: '0px',
                borderRadius: '8px',
                opacity: 1,
                flexShrink: 0,
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div style={{
                width: '100%',
                height: '100%'
              }}>
                <img
                  src={banner.image}
                  alt={banner.alt || `Banner ${idx + 1}`}
                  style={{
                    objectFit: 'contain',
                    height: '100%',
                    width: '100%',
                    backgroundColor: 'transparent',
                    display: 'block'
                  }}
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  );
}
