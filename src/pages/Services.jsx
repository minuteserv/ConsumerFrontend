import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { ServiceCard } from '../components/ServiceCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, Filter, Grid3x3, List, ChevronRight, X, SlidersHorizontal, Check } from 'lucide-react';
import { useServices } from '../hooks/useServices';

export function Services() {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional returns
  const { services: servicesData, loading: servicesLoading, error: servicesError } = useServices();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [comingSoonCategory, setComingSoonCategory] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [durationFilter, setDurationFilter] = useState(null);
  const [sortBy, setSortBy] = useState('popular'); // popular, price-low, price-high, duration
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);

  const sortOptions = [
    { value: 'popular', label: 'Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'duration', label: 'Duration: Shortest First' },
  ];

  // Use services data from API (safe with optional chaining)
  const servicesDataToUse = servicesData;

  // Get all available categories
  const allCategories = useMemo(() => {
    if (!servicesDataToUse?.tiers) return [];
    const categories = new Set();
    servicesDataToUse.tiers.forEach(tier => {
      tier.categories.forEach(cat => {
        categories.add(cat.category);
      });
    });
    return Array.from(categories);
  }, [servicesDataToUse]);

  const tiers = useMemo(() => {
    if (!servicesDataToUse?.tiers) return [];
    return servicesDataToUse.tiers.map(t => t.tier);
  }, [servicesDataToUse]);

  // Get all services from all tiers and categories
  const allServices = useMemo(() => {
    if (!servicesDataToUse?.tiers) return [];
    const services = [];
    servicesDataToUse.tiers.forEach(tier => {
      tier.categories.forEach(category => {
        category.items.forEach(item => {
          services.push({
            ...item,
            tier: tier.tier,
            category: category.category,
            searchableText: `${item.name} ${category.category} ${tier.tier} ${item.brand || ''}`.toLowerCase()
          });
        });
      });
    });
    return services;
  }, [servicesDataToUse]);

  // Filter services
  const filteredServices = useMemo(() => {
    let filtered = [...allServices];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(service => 
        service.searchableText.includes(searchQuery.toLowerCase())
      );
    }

    // Tier filter
    if (selectedTier) {
      filtered = filtered.filter(service => service.tier === selectedTier);
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Price filter
    if (priceRange.min) {
      const minPrice = parseInt(priceRange.min);
      filtered = filtered.filter(service => {
        const price = service.productCost || service.marketPrice || 0;
        return price >= minPrice;
      });
    }
    if (priceRange.max) {
      const maxPrice = parseInt(priceRange.max);
      filtered = filtered.filter(service => {
        const price = service.productCost || service.marketPrice || 0;
        return price <= maxPrice;
      });
    }

    // Duration filter
    if (durationFilter) {
      const [min, max] = durationFilter.split('-').map(Number);
      filtered = filtered.filter(service => {
        const duration = service.durationMinutes || 0;
        if (max) {
          return duration >= min && duration <= max;
        } else {
          return duration >= min;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const priceA = a.productCost || a.marketPrice || 0;
      const priceB = b.productCost || b.marketPrice || 0;
      const durationA = a.durationMinutes || 0;
      const durationB = b.durationMinutes || 0;

      switch (sortBy) {
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'duration':
          return durationA - durationB;
        case 'popular':
        default:
          // Sort by popularity (you can add rating/booking count later)
          return 0;
      }
    });

    return filtered;
  }, [allServices, searchQuery, selectedTier, selectedCategory, priceRange, durationFilter, sortBy]);

  // Get unique categories from filtered services
  const availableCategories = useMemo(() => {
    const categories = new Set(filteredServices.map(s => s.category));
    return Array.from(categories).sort();
  }, [filteredServices]);

  // Get price range stats
  const priceStats = useMemo(() => {
    const prices = filteredServices.map(s => s.productCost || s.marketPrice || 0);
    return {
      min: Math.min(...prices, 0),
      max: Math.max(...prices, 0)
    };
  }, [filteredServices]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTier(null);
    setSelectedCategory(null);
    setPriceRange({ min: '', max: '' });
    setDurationFilter(null);
    setComingSoonCategory(null);

    if (searchParams.get('category')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('category');
      setSearchParams(nextParams);
    }
  };

  const hasActiveFilters =
    selectedTier ||
    selectedCategory ||
    priceRange.min ||
    priceRange.max ||
    durationFilter ||
    comingSoonCategory;

  const handleSelectedCategoryChange = (category) => {
    setSelectedCategory(category);
    setComingSoonCategory(null);
  };

  // Read category from URL query parameter on mount (after all hooks)
  useEffect(() => {
    const categoryParam = searchParams.get('category');

    if (!categoryParam) {
      setComingSoonCategory(null);
      return;
    }

    const decodedCategory = decodeURIComponent(categoryParam).trim();
    if (!decodedCategory) {
      setComingSoonCategory(null);
      return;
    }

    if (allCategories.length === 0) {
      return;
    }

    const normalizedParam = decodedCategory.toLowerCase();

    const exactMatch = allCategories.find(
      cat => cat.toLowerCase() === normalizedParam
    );

    if (exactMatch) {
      setSelectedCategory(exactMatch);
      setComingSoonCategory(null);
      return;
    }

    const partialMatch = allCategories.find(cat => {
      const catLower = cat.toLowerCase().replace(/\s+/g, ' ');
      const paramLower = normalizedParam.replace(/\s+/g, ' ');
      return catLower.includes(paramLower) || paramLower.includes(catLower);
    });

    if (partialMatch) {
      setSelectedCategory(partialMatch);
      setComingSoonCategory(null);
      return;
    }

    const categoryMappings = {
      'cleanup': 'Clean up',
      'clean up': 'Clean up',
      'hair care': 'Head',
      'haircare': 'Head',
      'hair': 'Head',
      'waxing': 'Waxing',
      'facial': 'Facial',
      'pedicure': 'Pedicure',
      'manicure': 'Manicure',
      'add on facial': 'ADD On Facial',
      'addon facial': 'ADD On Facial',
      'hair colour': 'Hair Colour',
    };

    const mappedCategory = categoryMappings[normalizedParam];
    if (mappedCategory && allCategories.includes(mappedCategory)) {
      setSelectedCategory(mappedCategory);
      setComingSoonCategory(null);
      return;
    }

    setSelectedCategory(null);
    setComingSoonCategory(decodedCategory);
  }, [searchParams, allCategories]);

  // Handle loading state (AFTER all hooks)
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

  // Handle error state (AFTER all hooks)
  if (!servicesData || servicesError) {
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

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header showSearch={false} />
      
      <div className="w-full max-w-[1232px] mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-3 md:mb-6 text-xs sm:text-sm text-gray-600">
          <Link to="/" className="text-primary no-underline hover:underline">Home</Link>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="text-gray-900">Services</span>
        </div>

        {/* Page Header with Search */}
        <div className="mb-5 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-semibold text-gray-900 mb-3 md:mb-6 mt-0 leading-tight">
            All Services
          </h1>
          
          {/* Search Bar */}
          <div className="relative w-full max-w-full md:max-w-[600px] mb-3 md:mb-6">
            <Search 
              size={20} 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
            />
            <Input
              type="text"
              placeholder="Search services, categories, or brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-10 h-10 md:h-12 text-sm md:text-base border-gray-300 rounded-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-1 flex items-center"
              >
                <X size={18} className="text-gray-600" />
              </button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3 md:gap-6 flex-wrap">
            <span className="text-xs sm:text-sm text-gray-600 font-normal">
              Showing <strong className="font-semibold text-gray-900">{filteredServices.length}</strong> of <strong className="font-semibold text-gray-900">{allServices.length}</strong> services
            </span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs sm:text-sm text-primary px-3 md:px-3 py-1 h-auto"
              >
                Clear all filters
              </Button>
            )}
          </div>
        </div>

        <div className="relative">
          {/* Desktop Floating Filters */}
          {showFilters && (
            <>
              <div
                className="hidden lg:block fixed inset-0 bg-black/10 z-30"
                onClick={() => setShowFilters(false)}
              />
              <div
                className="hidden lg:flex flex-col z-40 bg-white border border-gray-200 rounded-2xl shadow-2xl w-[360px]"
                style={{
                  top: '120px',
                  left: 'max(24px, calc((100vw - 1232px) / 2 + 24px))',
                  maxHeight: 'calc(100vh - 160px)',
                  position: 'fixed'
                }}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-gray-900 text-lg font-semibold">
                    <SlidersHorizontal size={18} />
                    Filters
                  </div>
                  <div className="flex items-center gap-3">
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs px-2 py-1 h-auto text-primary"
                      >
                        Clear All
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowFilters(false)}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
                  {/* Tier Filter */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 mt-0">Service Tier</h4>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                        <input
                          type="radio"
                          name="tier-desktop"
                          checked={selectedTier === null}
                          onChange={() => setSelectedTier(null)}
                          className="cursor-pointer"
                        />
                        <span>All Tiers</span>
                      </label>
                      {tiers.map(tier => (
                        <label key={tier} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                          <input
                            type="radio"
                            name="tier-desktop"
                            checked={selectedTier === tier}
                            onChange={() => setSelectedTier(tier)}
                            className="cursor-pointer"
                          />
                          <span>{tier}</span>
                          <span className="text-[11px] leading-[14px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium min-w-[24px] text-center inline-block">
                            {allServices.filter(s => s.tier === tier).length}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Category Filter */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 mt-0">Category</h4>
                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                        <input
                          type="radio"
                          name="category-desktop"
                          checked={selectedCategory === null}
                          onChange={() => handleSelectedCategoryChange(null)}
                          className="cursor-pointer"
                        />
                        <span>All Categories</span>
                      </label>
                      {availableCategories.map(category => (
                        <label key={category} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                          <input
                            type="radio"
                            name="category-desktop"
                            checked={selectedCategory === category}
                            onChange={() => handleSelectedCategoryChange(category)}
                            className="cursor-pointer"
                          />
                          <span>{category}</span>
                          <span className="text-[11px] leading-[14px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium min-w-[24px] text-center inline-block">
                            {filteredServices.filter(s => s.category === category).length}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Price Filter */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 mt-0">Price Range</h4>
                    <div className="flex gap-2 mb-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="text-sm py-2 px-3 border-gray-300 rounded-md"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="text-sm py-2 px-3 border-gray-300 rounded-md"
                      />
                    </div>
                    <p className="text-xs text-gray-600 m-0">
                      ₹{priceStats.min} - ₹{priceStats.max}
                    </p>
                  </div>

                  <Separator />

                  {/* Duration Filter */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 mt-0">Duration</h4>
                    <div className="flex flex-col gap-2">
                      {[
                        { label: 'All', value: null },
                        { label: 'Under 30 mins', value: '0-30' },
                        { label: '30-45 mins', value: '30-45' },
                        { label: '45-60 mins', value: '45-60' },
                        { label: 'Over 60 mins', value: '60-999' }
                      ].map(option => (
                        <label key={option.value || 'all'} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                          <input
                            type="radio"
                            name="duration-desktop"
                            checked={durationFilter === option.value}
                            onChange={() => setDurationFilter(option.value)}
                            className="cursor-pointer"
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Mobile Filter Dialog */}
          <Dialog open={showMobileFilters} onOpenChange={setShowMobileFilters}>
            <DialogContent className="w-full max-w-full h-screen max-h-screen sm:h-auto sm:max-w-[400px] sm:max-h-[90vh] left-0 top-0 sm:left-1/2 sm:top-1/2 translate-x-0 translate-y-0 sm:translate-x-[-50%] sm:translate-y-[-50%] rounded-t-3xl sm:rounded-lg p-0 overflow-hidden border-none sm:border">
              <div className="flex flex-col h-full bg-white">
                <div className="sticky top-0 z-10 flex items-center px-4 py-3 border-b border-gray-200 bg-white">
                  <div className="flex items-center gap-2 text-gray-900 text-base font-semibold">
                    <SlidersHorizontal size={18} />
                    Filters
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs px-2 py-1 h-auto text-primary"
                      >
                        Clear All
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowMobileFilters(false)}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-24 space-y-6">
                  {/* Service Tier */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 mt-0">Service Tier</h4>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                        <input
                          type="radio"
                          name="tier-mobile"
                          checked={selectedTier === null}
                          onChange={() => setSelectedTier(null)}
                          className="cursor-pointer"
                        />
                        <span>All Tiers</span>
                      </label>
                      {tiers.map(tier => (
                        <label key={tier} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                          <input
                            type="radio"
                            name="tier-mobile"
                            checked={selectedTier === tier}
                            onChange={() => setSelectedTier(tier)}
                            className="cursor-pointer"
                          />
                          <span>{tier}</span>
                          <span className="text-[11px] leading-[14px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium min-w-[24px] text-center inline-block">
                            {allServices.filter(s => s.tier === tier).length}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-2" />

                  {/* Category */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 mt-0">Category</h4>
                    <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                        <input
                          type="radio"
                          name="category-mobile"
                          checked={selectedCategory === null}
                          onChange={() => handleSelectedCategoryChange(null)}
                          className="cursor-pointer"
                        />
                        <span>All Categories</span>
                      </label>
                      {availableCategories.map(category => (
                        <label key={category} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                          <input
                            type="radio"
                            name="category-mobile"
                            checked={selectedCategory === category}
                            onChange={() => handleSelectedCategoryChange(category)}
                            className="cursor-pointer"
                          />
                          <span>{category}</span>
                          <span className="text-[11px] leading-[14px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium min-w-[24px] text-center inline-block">
                            {filteredServices.filter(s => s.category === category).length}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-2" />

                  {/* Price Range */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 mt-0">Price Range</h4>
                    <div className="flex gap-2 mb-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="text-sm py-2 px-3 border-gray-300 rounded-md"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="text-sm py-2 px-3 border-gray-300 rounded-md"
                      />
                    </div>
                    <p className="text-xs text-gray-600 m-0">₹{priceStats.min} - ₹{priceStats.max}</p>
                  </div>

                  <Separator className="my-2" />

                  {/* Duration */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 mt-0">Duration</h4>
                    <div className="flex flex-col gap-2">
                      {[
                        { label: 'All', value: null },
                        { label: 'Under 30 mins', value: '0-30' },
                        { label: '30-45 mins', value: '30-45' },
                        { label: '45-60 mins', value: '45-60' },
                        { label: 'Over 60 mins', value: '60-999' }
                      ].map(option => (
                        <label key={option.value || 'all'} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                          <input
                            type="radio"
                            name="duration-mobile"
                            checked={durationFilter === option.value}
                            onChange={() => setDurationFilter(option.value)}
                            className="cursor-pointer"
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 left-0 right-0 px-4 py-3 border-t border-gray-200 bg-white sm:hidden">
                  <Button className="w-full" onClick={() => setShowMobileFilters(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Mobile Sort Dialog */}
          <Dialog open={showMobileSort} onOpenChange={setShowMobileSort}>
            <DialogContent className="sm:max-w-[360px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Sort by</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowMobileSort(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-md border text-left text-sm transition-colors ${
                      sortBy === option.value
                        ? 'border-primary bg-primary/5 text-primary font-semibold'
                        : 'border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{option.label}</span>
                    {sortBy === option.value && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Main Content Area */}
          <div className="w-full min-w-0">
            {/* Toolbar: Sort, View Toggle, Filter Toggle */}
            <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-3 md:gap-4">
              <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                {/* Mobile Filter Toggle - Show on mobile, hide on desktop */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 border-gray-300 px-3 py-1.5 md:px-4 md:py-2"
                >
                  <Filter size={16} />
                  Filters
                  {hasActiveFilters && (
                    <span className="text-[10px] leading-[14px] px-1.5 ml-1 bg-primary text-white rounded-full font-semibold min-w-[18px] text-center inline-block">
                      {[selectedTier, selectedCategory, priceRange.min, priceRange.max, durationFilter].filter(Boolean).length}
                    </span>
                  )}
                </Button>

                {/* Desktop Filter Toggle - Show on desktop */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(true)}
                  className="hidden lg:flex items-center gap-2 border-gray-300 px-3 py-1.5 md:px-4 md:py-2"
                >
                  <Filter size={16} />
                  Filters
                  {hasActiveFilters && (
                    <span className="text-[10px] leading-[14px] px-1.5 ml-1 bg-primary text-white rounded-full font-semibold min-w-[18px] text-center inline-block">
                      {[selectedTier, selectedCategory, priceRange.min, priceRange.max, durationFilter].filter(Boolean).length}
                    </span>
                  )}
                </Button>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
                    Sort by:
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMobileSort(true)}
                    className="sm:hidden flex items-center gap-2 border-gray-300 px-3 py-1.5"
                  >
                    {sortOptions.find(option => option.value === sortBy)?.label || 'Sort'}
                  </Button>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="hidden sm:block py-2 px-3 border border-gray-300 rounded-md text-sm sm:text-base cursor-pointer bg-white"
                  >
                    <option value="popular">Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="duration">Duration: Shortest First</option>
                  </select>
                </div>
              </div>

              {/* View Toggle - Hidden on mobile, shown on desktop */}
              <div className="hidden items-center gap-2 border border-gray-300 rounded-md p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 md:p-2 rounded transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-primary text-white' 
                      : 'bg-transparent text-gray-600 hover:bg-gray-100'
                  } cursor-pointer flex items-center`}
                >
                  <Grid3x3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 md:p-2 rounded transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-primary text-white' 
                      : 'bg-transparent text-gray-600 hover:bg-gray-100'
                  } cursor-pointer flex items-center`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>

            {/* Active Filters Chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                {selectedTier && (
                  <div
                    className="text-xs px-2.5 md:px-3 py-1 md:py-1.5 flex items-center gap-1.5 cursor-pointer bg-purple-100 text-gray-700 rounded-full font-normal border-none"
                    onClick={() => setSelectedTier(null)}
                  >
                    <span>Tier: {selectedTier}</span>
                    <X size={14} className="text-gray-700" />
                  </div>
                )}
                {selectedCategory && (
                  <div
                    className="text-xs px-2.5 md:px-3 py-1 md:py-1.5 flex items-center gap-1.5 cursor-pointer bg-purple-100 text-gray-700 rounded-full font-normal border-none"
                    onClick={() => handleSelectedCategoryChange(null)}
                  >
                    <span>{selectedCategory}</span>
                    <X size={14} className="text-gray-700" />
                  </div>
                )}
                {(priceRange.min || priceRange.max) && (
                  <div
                    className="text-xs px-2.5 md:px-3 py-1 md:py-1.5 flex items-center gap-1.5 cursor-pointer bg-purple-100 text-gray-700 rounded-full font-normal border-none"
                    onClick={() => setPriceRange({ min: '', max: '' })}
                  >
                    <span>Price: ₹{priceRange.min || '0'} - ₹{priceRange.max || '∞'}</span>
                    <X size={14} className="text-gray-700" />
                  </div>
                )}
                {durationFilter && (
                  <div
                    className="text-xs px-2.5 md:px-3 py-1 md:py-1.5 flex items-center gap-1.5 cursor-pointer bg-purple-100 text-gray-700 rounded-full font-normal border-none"
                    onClick={() => setDurationFilter(null)}
                  >
                    <span>Duration: {durationFilter.replace('-', ' to ').replace('999', '∞')} mins</span>
                    <X size={14} className="text-gray-700" />
                  </div>
                )}
              </div>
            )}

            {/* Services Grid/List - Responsive */}
            {!comingSoonCategory && filteredServices.length > 0 ? (
              <div
                className={`${
                  viewMode === 'grid'
                    ? 'grid gap-3 md:gap-6 justify-center md:justify-start [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))] lg:[grid-template-columns:repeat(auto-fill,minmax(326px,1fr))]'
                    : 'flex flex-col gap-3 md:gap-6'
                } mb-8 md:mb-12`}
              >
                {filteredServices.map((service, idx) => (
                  <ServiceCard
                    key={`${service.tier}-${service.category}-${idx}`}
                    service={service}
                    category={service.category}
                    tier={service.tier}
                  />
                ))}
              </div>
            ) : (
              <div className="p-10 md:p-16 text-center bg-gray-100 rounded-lg">
                {comingSoonCategory ? (
                  <>
                    <p className="text-base md:text-xl text-gray-900 font-semibold mb-2 mt-0">
                      {comingSoonCategory} services are launching soon
                    </p>
                    <p className="text-sm md:text-lg text-gray-600 font-normal mb-6">
                      We&apos;re putting the finishing touches on this experience. Check back shortly or explore the services that are available today.
                    </p>
                    <Button
                      onClick={clearFilters}
                      className="bg-primary text-white px-6 md:px-8"
                    >
                      Browse available services
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm md:text-lg text-gray-600 font-normal mb-4 mt-0">
                      No services found matching your criteria.
                    </p>
                    {hasActiveFilters && (
                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        className="border-primary text-primary"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
