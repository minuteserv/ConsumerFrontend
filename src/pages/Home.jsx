import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { ServiceCard } from '../components/ServiceCard';
import { CategoryTabs } from '../components/CategoryTabs';
import { ServiceCategorySection } from '../components/ServiceCategorySection';
import { BannerCarousel } from '../components/BannerCarousel';
import { PackageCarousel } from '../components/PackageCarousel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowRight, Headset, ShieldCheck } from 'lucide-react';
import { useServices } from '../hooks/useServices';



export function Home() {
  const navigate = useNavigate();
  const { services: servicesData, loading: servicesLoading, error: servicesError } = useServices();
  const [selectedTier, setSelectedTier] = useState('Minimal');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const servicesDataToUse = servicesData;

  const allServices = useMemo(() => {
    if (!servicesDataToUse?.tiers) return [];
    const services = [];
    servicesDataToUse.tiers.forEach((tier) => {
      tier.categories.forEach((category) => {
        category.items.forEach((item) => {
          services.push({
            ...item,
            tier: tier.tier,
            category: category.category,
            searchableText: `${item.name} ${category.category} ${tier.tier} ${item.brand || ''}`.toLowerCase(),
          });
        });
      });
    });
    return services;
  }, [servicesDataToUse]);

  const hairNailServices = useMemo(() => {
    if (!allServices.length) return [];

    const hairServices = allServices
      .filter((service) => {
        const categoryName = service.category?.toLowerCase() || '';
        return categoryName.includes('head') || categoryName.includes('hair');
      })
      .sort((a, b) => {
        const priceA =
          a.productCost ??
          a.product_cost ??
          a.marketPrice ??
          a.market_price ??
          0;
        const priceB =
          b.productCost ??
          b.product_cost ??
          b.marketPrice ??
          b.market_price ??
          0;
        return priceA - priceB;
      })
      .slice(0, 5);

    return hairServices.map((service) => {
      const marketPrice =
        service.marketPrice ?? service.market_price ?? null;
      const productCost =
        service.productCost ?? service.product_cost ?? null;
      const displayPrice =
        marketPrice ??
        productCost ??
        0;
      const image = service.image || service.image_url || '';
      const rating =
        service.rating ??
        service.averageRating ??
        service.avg_rating ??
        '';
      const reviewCount =
        service.reviewCount ??
        service.review_count ??
        service.totalReviews ??
        '';

      return {
        id: service.id,
        name: service.name,
        image,
        rating: rating !== undefined && rating !== null ? `${rating}` : '',
        reviewCount:
          reviewCount !== undefined && reviewCount !== null
            ? `${reviewCount}`
            : '',
        price:
          displayPrice && displayPrice > 0
            ? Math.round(displayPrice).toString()
            : '',
        category: service.category,
        originalPrice:
          marketPrice && productCost
            ? Math.round(marketPrice).toString()
            : null,
        discount:
          marketPrice &&
          productCost &&
          marketPrice > productCost
            ? `${Math.round(
                ((marketPrice - productCost) / marketPrice) * 100
              )}% off`
            : '',
      };
    });
  }, [allServices]);

  // Handle loading state
  if (servicesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showSearch={false} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (servicesError || !servicesData) {
    return (
      <div className="min-h-screen bg-background">
        <Header showSearch={false} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load services</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  const tier = servicesDataToUse?.tiers?.find(t => t.tier === selectedTier);
  const categories = tier ? tier.categories.map(c => c.category) : [];
  const displayCategory = selectedCategory || categories[0];
  const categoryData = tier?.categories.find(c => c.category === displayCategory);

  // Category grid items from reference
  const categoryGridItems = [
    {
      name: 'Salon for Women',
      image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_category/w_56,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1672324465583-2688a9.jpeg',
      category: 'Salon'
    },
    {
      name: 'Spa for Women',
      image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_category/w_56,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1673936988512-276a19.jpeg',
      category: 'Spa'
    },
    {
      name: 'Hair Studio for Women',
      image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_category/w_56,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1728839468364-90b0dc.jpeg',
      category: 'Head'
    },
    {
      name: 'Makeup & Styling Studio',
      image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_category/w_56,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1669023257508-ffd582.jpeg',
      category: 'Facial'
    },
    {
      name: 'Salon for Men',
      image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_category/w_56,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1710241114433-5cfa7c.jpeg',
      category: 'Salon'
    },
    {
      name: 'Massage for Men',
      image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_category/w_56,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1674623814769-eeca92.jpeg',
      category: 'Facial'
    }
  ];

  // Salon for women services with images
  const salonForWomenServices = [
    {
      name: 'Cleanup',
      image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_231,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1717397984511-247afe.jpeg',
      category: 'Clean up'
    },
    {
      name: 'Waxing',
      image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_231,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1717397992635-09b511.jpeg',
      category: 'Waxing'
    },
    {
      name: 'Hair care',
      image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_231,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1717398018197-c68fcc.jpeg',
      category: 'Head'
    }
  ];

  // Spa for women services with images
  const spaForWomenServices = [
    {
      name: 'Stress relief',
      image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_231,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1700143543316-c5eb5c.jpeg',
      category: 'Facial'
    },
    {
      name: 'Pain relief',
      image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_231,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1700143539186-26f4e5.jpeg',
      category: 'Facial'
    }
  ];

  // Banner carousel images
  const bannerCarouselItems = [
    {
      image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_394,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1749719167789-a2e4a9.jpeg',
      alt: 'Banner 1',
      category: 'Waxing'
    },
    {
      image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_394,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/home-screen/1711428187463-abb19d.jpeg',
      alt: 'Banner 2',
      category: 'Facial'
    },
    {
      image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_394,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/home-screen/1711428209166-2d42c0.jpeg',
      alt: 'Banner 3',
      category: 'Head'
    },
    {
      image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_394,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/home-screen/1711428163831-860972.jpeg',
      alt: 'Banner 4',
      category: 'Facial'
    },
    {
      image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_394,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1749719177066-6bd9be.jpeg',
      alt: 'Hair Studio for Women',
      category: 'Head'
    }
  ];

  const handleBannerClick = (banner) => {
    if (banner.category) {
      navigate(`/services?category=${encodeURIComponent(banner.category)}`);
    }
  };

  const handleHairNailServiceClick = (service) => {
    if (service.category) {
      navigate(`/services?category=${encodeURIComponent(service.category)}`);
    }
  };

  const handleHairNailSeeAll = () => {
    // Navigate to services page with Head category filter (primary category for Hair & Nail)
    navigate('/services?category=Head');
  };

  const handleServiceCategoryClick = (service) => {
    // Navigate to services page with category filter
    const categoryName = service.category || service.name;
    navigate(`/services?category=${encodeURIComponent(categoryName)}`);
  };

  const handleCategoryGridClick = (item) => {
    // Map categoryGridItems to actual service categories from services.json
    // Categories available: Clean up, Facial, Waxing, Pedicure, Manicure, Head, Hair Colour
    const categoryMapping = {
      'Salon': 'Clean up', // Salon services primarily include Clean up and Waxing
      'Spa': 'Facial', // Spa services primarily include Facial treatments
      'Head': 'Head', // Direct match - Hair services
      'Facial': 'Facial', // Direct match
      'Hair Colour': 'Hair Colour' // Direct match
    };

    // Get the mapped category or use the item's category as fallback
    const mappedCategory = categoryMapping[item.category] || item.category;
    navigate(`/services?category=${encodeURIComponent(mappedCategory)}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header showSearch={false} />
      
      {/* Hero Section - Fully Responsive */}
      <div className="w-full max-w-[1232px] mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Left Column - Responsive Width */}
          <div className="w-full lg:w-auto lg:flex-1 lg:max-w-[481px] lg:pr-8 flex-shrink-0">
            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-0 mt-0 leading-tight line-clamp-2">
              Beauty services at your doorstep
            </h1>

            {/* Spacer */}
            <div className="h-4 md:h-6"></div>

            {/* What are you looking for Card */}
            <div className="p-4 sm:p-6 md:p-8 w-full mb-0 bg-transparent rounded-none">
              <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-600 mb-4 mt-0 text-left">
                What are you looking for?
              </p>
              
              {/* 3x2 Grid - Responsive */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {categoryGridItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCategoryGridClick(item)}
                    className="flex flex-col items-center gap-2 p-0 border-none bg-transparent cursor-pointer transition-opacity duration-200 w-auto active:opacity-70 hover:opacity-80"
                  >
                    {/* Icon Container - Responsive Size */}
                    <div 
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center ${
                        item.image ? 'bg-transparent' : 'bg-primary'
                      }`}
                    >
                      {item.image ? (
                        <img
                          src={item.image || undefined}
                          alt={item.name}
                          className="object-contain h-full w-full bg-transparent aspect-square block"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                            if (placeholder) {
                              placeholder.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className="image-placeholder hidden items-center justify-center w-full h-full text-white text-xl sm:text-2xl font-bold"
                        style={{
                          display: item.image ? 'none' : 'flex',
                        }}
                      >
                        {item.name.charAt(0)}
                      </div>
                    </div>
                    {/* Label */}
                    <p className="text-[10px] sm:text-xs font-normal text-gray-900 text-center m-0 w-full px-1 line-clamp-2">
                      {item.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Spacer */}
            <div className="h-6 md:h-8"></div>

            {/* Trust Markers */}
            <div className="hidden sm:flex flex-wrap gap-4 sm:gap-6 md:gap-8 items-start">
              {/* Rating */}
              <div className="flex gap-2 sm:gap-3 items-start pr-4 sm:pr-6 md:pr-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center rounded bg-primary/10 text-primary">
                  <Headset className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-semibold text-gray-900 m-0 line-clamp-2">
                    24/7
                  </p>
                  <p className="text-xs sm:text-sm font-normal text-gray-600 m-0">
                    Dedicated Customer Support
                  </p>
                </div>
              </div>
              {/* Customer Count */}
              <div className="flex gap-2 sm:gap-3 items-start">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center rounded bg-primary/10 text-primary">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-semibold text-gray-900 m-0 line-clamp-2">
                    100%
                  </p>
                  <p className="text-xs sm:text-sm font-normal text-gray-600 m-0">
                    Hygienic & Safe Practices
                  </p>
                </div>
              </div>
            </div>
          </div>


          {/* Spacer Column - Hidden on mobile */}
          <div className="hidden lg:block pr-8 flex-shrink-0">
            <div className="w-full"></div>
          </div>

          {/* Right Column - Image Collage - Responsive */}
          <div className="hidden lg:flex flex-1 min-h-[400px] lg:min-h-[600px] rounded-none overflow-hidden w-full">
            <img
              src="https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template,q_auto:low,f_auto/dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/home-screen/1719293199714-da733e.jpeg"
              alt="Beauty services at your doorstep"
              className="object-contain h-full w-full bg-transparent aspect-square block"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1232px] mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {/* Tier Selection */}
        {/* <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Service Tiers</h2>
          </div>
          <CategoryTabs
            categories={servicesDataToUse.tiers?.map(t => t.tier) || []}
            activeCategory={selectedTier}
            onSelect={setSelectedTier}
          />
        </div> */}

        {/* Category Selection */}
        {/* {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Service Categories</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary"
                onClick={() => {
                  // Scroll to services section and show all categories
                  document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                See all <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <CategoryTabs
              categories={categories}
              activeCategory={displayCategory}
              onSelect={setSelectedCategory}
            />
          </div>
        )} */}

        {/* Salon for Women Section */}
        <ServiceCategorySection
          title="Salon for women"
          services={salonForWomenServices}
          onServiceClick={handleServiceCategoryClick}
        />

        {/* Spa for Women Section */}
        <ServiceCategorySection
          title="Spa for women"
          subtitle="Refresh. Rewind. Rejuvenate."
          services={spaForWomenServices}
          onServiceClick={handleServiceCategoryClick}
        />

        {/* Spotlight Banner Section - Responsive */}
        <div className="hidden md:block w-full max-w-[1232px] mx-auto px-4 sm:px-6 md:px-8 my-6 md:my-10">
          <div
            tabIndex={0}
            className="cursor-pointer w-full overflow-hidden border-0 rounded-none opacity-100 h-[200px] sm:h-[250px] md:h-[300px] lg:h-[410px] transition-transform duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => navigate('/services?category=Waxing')}
          >
            <div className="w-full h-full">
              <img
                src="https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_1232,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1698216798701-9a08f0.jpeg"
                alt="Spotlight Banner"
                className="h-full w-full bg-transparent aspect-[3/1] block"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Banner Carousel Section */}
        <div className="mt-2 md:mt-4">
          <BannerCarousel banners={bannerCarouselItems} onBannerClick={handleBannerClick} />
        </div>

        {/* Hair & Nail Services Package Carousel */}
        <div className="mt-2 md:mt-4">
          <PackageCarousel
            title="Hair & Nail services"
            subtitle="Refreshed style, revamped look"
            services={hairNailServices}
            onSeeAll={handleHairNailSeeAll}
            onServiceClick={handleHairNailServiceClick}
          />
        </div>

        {/* Second Spotlight Banner Section - Responsive */}
        <div className="hidden md:block w-full max-w-[1232px] mx-auto px-4 sm:px-6 md:px-8 my-6 md:my-10">
          <div
            tabIndex={0}
            className="cursor-pointer w-full overflow-hidden border-0 rounded-none opacity-100 h-[200px] sm:h-[250px] md:h-[300px] lg:h-[405px] transition-transform duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => navigate('/services?category=Waxing')}
          >
            <div className="w-full h-full">
              <img
                src="https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_1232,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1698216790006-967dd6.jpeg"
                alt="Spotlight Banner"
                className="h-full w-full bg-transparent aspect-[3.04/1] block"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {/* {categoryData && (
          <div id="services-section">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">{displayCategory}</h2>
              <Badge variant="secondary">{categoryData.items.length} services</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryData.items.map((service, idx) => (
                <ServiceCard
                  key={idx}
                  service={service}
                  category={displayCategory}
                  tier={selectedTier}
                />
              ))}
            </div>
          </div>
        )} */}

        {/* Promotional Banner */}
        {/* <Card className="mt-12 p-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-2 bg-green-500">Special Offer</Badge>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Book multiple services and save up to 25%
              </h3>
              <p className="text-muted-foreground mb-4">
                Get the best deals when you combine services
              </p>
              <Button>Explore Offers</Button>
            </div>
          </div>
        </Card> */}
      </div>
    </div>
  );
}