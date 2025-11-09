/**
 * Ola Location Service
 * Handles location detection, autocomplete, and geocoding
 */

import { OLA_API_CONFIG } from './constants';

/**
 * Get location autocomplete suggestions
 * @param {string} query - Search query (e.g., "Ballygunge")
 * @param {Object} options - Additional options (lat, lng for location bias)
 * @returns {Promise<Array>} Array of location suggestions
 */
export async function getLocationAutocomplete(query, options = {}) {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const params = new URLSearchParams({
      input: query.trim(),
      api_key: OLA_API_CONFIG.key,
    });

    // Add location bias if provided (for better results near user)
    if (options.lat && options.lng) {
      params.append('location', `${options.lat},${options.lng}`);
    }

    const response = await fetch(
      `${OLA_API_CONFIG.baseUrl}${OLA_API_CONFIG.endpoints.autocomplete}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
          'origin': window.location.origin,
          'referer': window.location.origin + '/',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch location suggestions: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse response - Ola API typically returns { predictions: [...] }
    // Handle different possible response formats
    if (data.predictions) {
      return data.predictions.map((prediction) => ({
        id: prediction.place_id || prediction.id,
        description: prediction.description || prediction.formatted_address,
        mainText: prediction.structured_formatting?.main_text || prediction.description,
        secondaryText: prediction.structured_formatting?.secondary_text || '',
        placeId: prediction.place_id || prediction.id,
        types: prediction.types || [],
        ...prediction,
      }));
    }
    
    if (Array.isArray(data)) {
      return data;
    }
    
    if (data.results) {
      return data.results;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching location autocomplete:', error);
    return [];
  }
}

/**
 * Reverse geocoding - Convert coordinates to address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Location details with formatted address
 */
export async function reverseGeocode(lat, lng) {
  try {
    const params = new URLSearchParams({
      latlng: `${lat},${lng}`,
      api_key: OLA_API_CONFIG.key,
    });

    const response = await fetch(
      `${OLA_API_CONFIG.baseUrl}${OLA_API_CONFIG.endpoints.reverseGeocode}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
          'origin': window.location.origin,
          'referer': window.location.origin + '/',
          'X-Request-Id': `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to reverse geocode: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse Ola API response format
    // Handle different possible response structures
    const result = data.result || data.results?.[0] || data;
    
    // Extract address components
    const streetNumber = result.address_components?.find(c => c.types?.includes('street_number'))?.long_name || '';
    const route = result.address_components?.find(c => c.types?.includes('route'))?.long_name || '';
    const sublocality = result.address_components?.find(c => c.types?.includes('sublocality'))?.long_name || '';
    const locality = result.address_components?.find(c => c.types?.includes('locality'))?.long_name || '';
    const city = result.address_components?.find(c => c.types?.includes('administrative_area_level_2'))?.long_name || locality || '';
    const state = result.address_components?.find(c => c.types?.includes('administrative_area_level_1'))?.long_name || '';
    const pincode = result.address_components?.find(c => c.types?.includes('postal_code'))?.long_name || '';
    
    // Build Address Line 1 from available components
    // If street_number exists, combine it with route
    // Otherwise, use first part of formatted_address or route
    let addressLine1 = '';
    if (streetNumber && route) {
      addressLine1 = `${streetNumber} ${route}`.trim();
    } else if (streetNumber) {
      addressLine1 = streetNumber;
    } else if (route) {
      addressLine1 = route;
    } else if (result.formatted_address) {
      // Parse formatted_address to extract first part (before first comma usually)
      const formattedParts = result.formatted_address.split(',');
      addressLine1 = formattedParts[0]?.trim() || '';
    }
    
    // Build Address Line 2 from sublocality or other components
    let addressLine2 = '';
    if (sublocality) {
      addressLine2 = sublocality;
    } else if (route && streetNumber) {
      // If we used street_number + route for Line 1, Line 2 can be empty or use sublocality
      addressLine2 = '';
    }
    
    return {
      address: result.formatted_address || result.address || '',
      addressLine1: addressLine1,
      addressLine2: addressLine2,
      city: city,
      state: state,
      pincode: pincode,
      country: result.address_components?.find(c => c.types?.includes('country'))?.long_name || '',
      lat: lat,
      lng: lng,
      placeId: result.place_id,
      ...result,
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}

/**
 * Get current location using browser geolocation API
 * @returns {Promise<Object>} Location coordinates
 */
export async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    console.log('🌐 getCurrentLocation: Checking geolocation support...');
    
    if (!navigator.geolocation) {
      console.error('❌ getCurrentLocation: Geolocation not supported');
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    console.log('✅ getCurrentLocation: Geolocation supported');
    console.log('📡 getCurrentLocation: Requesting user location...');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0, // Always get fresh location
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ getCurrentLocation: Position received:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.error('❌ getCurrentLocation: Error getting position:', error);
        console.error('❌ getCurrentLocation: Error code:', error.code);
        console.error('❌ getCurrentLocation: Error message:', error.message);
        reject(error);
      },
      options
    );
  });
}

/**
 * Get location from IP (fallback method)
 * Uses a free IP geolocation service as fallback
 * @returns {Promise<Object>} Approximate location
 */
export async function getLocationFromIP() {
  try {
    // Using a free IP geolocation service as fallback
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();

    return {
      lat: data.latitude,
      lng: data.longitude,
      city: data.city,
      region: data.region,
      country: data.country_name,
      address: `${data.city}, ${data.region}`,
    };
  } catch (error) {
    console.error('Error getting location from IP:', error);
    return null;
  }
}

/**
 * Format address for display
 * @param {Object} location - Location object
 * @returns {string} Formatted address string
 */
export function formatAddress(location) {
  if (!location) return '';
  
  if (location.formatted_address) {
    return location.formatted_address;
  }
  
  const parts = [
    location.address_line_1,
    location.address_line_2,
    location.city,
    location.state,
    location.pincode,
  ].filter(Boolean);
  
  return parts.join(', ') || location.address || '';
}

