import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function ServiceCategorySection({ title, subtitle, services, onServiceClick }) {
  return (
    <div className="mt-6 mb-6 md:mt-10 md:mb-10" style={{ maxWidth: '1232px', width: '100%', margin: '45px auto', padding: '0 16px' }}>
      {/* Heading - Exact match */}
      <div className="mb-3 md:mb-4">
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

      {/* Services Container - Horizontal Scroll */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="gap-3 md:gap-4" style={{ 
          display: 'flex', 
          paddingBottom: '8px',
        //   justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          {services.map((service, idx) => (
            <div
              key={idx}
              onClick={() => onServiceClick?.(service)}
              className="cursor-pointer w-[180px] md:w-[233.6px]"
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexShrink: 0,
                borderColor: 'rgb(237, 237, 237)',
                borderStyle: 'solid',
                borderWidth: '1px',
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgb(200, 200, 200)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgb(237, 237, 237)';
              }}
            >
              {/* Card Content */}
              <div className="w-[178.6px] md:w-[231.6px]" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Title Section - Exact dimensions */}
                <div className="h-[80px] md:h-[104.62px] w-[178.6px] md:w-[231.6px] p-3 md:p-4" style={{ 
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start'
                }}>
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
                      textTransform: 'none'
                    }}
                  >
                    {service.name}
                  </a>
                </div>

                {/* Image Section - Exact dimensions */}
                <div className="h-[135px] md:h-[173.7px] w-[178.6px] md:w-[231.6px]" style={{ 
                  overflow: 'hidden',
                  border: '0px',
                  borderRadius: '8px',
                  opacity: 1
                }}>
                  <div className="w-[178px] md:w-[231px] h-[135px] md:h-[173px]" style={{
                    overflow: 'hidden',
                    borderRadius: '8px'
                  }}>
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
              </div>

              {/* Spacer div (matching HTML structure) */}
              <div style={{
                userSelect: 'inherit',
                cursor: 'inherit',
                touchAction: 'inherit',
                transitionDuration: '0s',
                width: '2px'
              }}></div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  );
}
