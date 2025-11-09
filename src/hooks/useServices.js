import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/constants';

/**
 * Clear any existing cache from localStorage
 */
function clearCache() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('minuteserv_services_cache');
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

// Clear cache on module load to ensure fresh data
if (typeof window !== 'undefined') {
  clearCache();
}

/**
 * Transform API response to match JSON structure
 */
function transformApiServices(apiServices) {
  // Group by tier and category to match JSON structure
  const tiers = {};
  
  apiServices.forEach(service => {
    const tier = service.tier;
    const category = service.category;
    
    if (!tiers[tier]) {
      tiers[tier] = {
        tier,
        categories: {}
      };
    }
    
    if (!tiers[tier].categories[category]) {
      tiers[tier].categories[category] = {
        category,
        items: []
      };
    }
    
    tiers[tier].categories[category].items.push({
      id: service.id,
      name: service.name,
      brand: service.brand,
      productCost: service.productCost,
      marketPrice: service.marketPrice,
      durationMinutes: service.durationMinutes,
      image: service.image,
      category: service.category,
      tier: service.tier,
    });
  });
  
  // Convert to array format matching JSON structure
  return {
    currency: 'INR',
    tiers: Object.values(tiers).map(tierObj => ({
      tier: tierObj.tier,
      categories: Object.values(tierObj.categories)
    }))
  };
}

/**
 * useServices Hook
 * Fetches services from API (always fresh, no cache)
 */
export function useServices() {
  const [services, setServices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('api'); // Always from API, no cache

  useEffect(() => {
    let isMounted = true;

    async function fetchServices() {
      try {
        setLoading(true);
        setError(null);

        // Always fetch from API (no cache)
        const response = await apiClient.get(API_ENDPOINTS.services);
        
        // Handle both direct array response and wrapped response
        const servicesArray = Array.isArray(response) 
          ? response 
          : (response?.data || response?.services || []);
        
        if (servicesArray && Array.isArray(servicesArray) && servicesArray.length > 0) {
          const transformed = transformApiServices(servicesArray);
          
          if (isMounted) {
            setServices(transformed);
            setSource('api');
            setLoading(false);
          }
        } else {
          throw new Error('No services found in API response');
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        if (isMounted) {
          setError(err);
          setLoading(false);
          setServices(null);
        }
      }
    }

    fetchServices();

    return () => {
      isMounted = false;
    };
  }, []);

  return { services, loading, error, source };
}

