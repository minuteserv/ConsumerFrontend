/**
 * LocationAutoDetect Component
 * 
 * Automatically detects and sets user's current location when:
 * - No location is currently selected
 * - User first visits the website
 * 
 * This runs silently in the background without interrupting user experience.
 */

import { useEffect, useRef } from 'react';
import { useLocation } from '../contexts/LocationContext';
import { getCurrentLocation, reverseGeocode } from '../lib/location';

export function LocationAutoDetect() {
  const { currentLocation, setLocation, addSavedLocation } = useLocation();
  const timerRef = useRef(null);
  const isMountedRef = useRef(true);
  const detectionStartedRef = useRef(false);

  // Run only once on mount
  useEffect(() => {
    console.log('🔍 LocationAutoDetect: Component mounted');
    
    // Check if we've already started detection (to prevent multiple starts in StrictMode)
    if (detectionStartedRef.current) {
      console.log('⏭️ LocationAutoDetect: Detection already started, skipping...');
      return;
    }
    
    // Check if location is valid (has address or coordinates)
    const hasValidLocation = currentLocation && (
      currentLocation.address || 
      (currentLocation.lat && currentLocation.lng) ||
      currentLocation.city
    );
    
    // Also check localStorage directly to see if location exists
    let storedLocation = null;
    try {
      const stored = localStorage.getItem('minuteserv_location');
      if (stored) {
        storedLocation = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('⚠️ LocationAutoDetect: Error reading localStorage', e);
    }
    
    const hasStoredLocation = storedLocation && (
      storedLocation.address || 
      (storedLocation.lat && storedLocation.lng) ||
      storedLocation.city
    );
    
    console.log('📍 LocationAutoDetect: Initial check', {
      hasValidLocation,
      hasStoredLocation,
      currentLocationExists: !!currentLocation,
      storedLocationExists: !!storedLocation,
    });
    
    // Only auto-detect if no valid location exists (in state or localStorage)
    if (!hasValidLocation && !hasStoredLocation) {
      console.log('🚀 LocationAutoDetect: Starting auto-detection on mount...');
      detectionStartedRef.current = true;

      // Delay to let app fully load
      timerRef.current = setTimeout(async () => {
        console.log('⏰ LocationAutoDetect: Timer fired, starting detection...');
        
        // Check if location was set during the delay (by another mount or manual selection)
        try {
          const stored = localStorage.getItem('minuteserv_location');
          if (stored) {
            const storedLocation = JSON.parse(stored);
            if (storedLocation && (storedLocation.address || storedLocation.city)) {
              console.log('✅ LocationAutoDetect: Location already exists in localStorage, skipping detection');
              return;
            }
          }
        } catch (e) {
          // Continue with detection
        }

        try {
          console.log('🌐 LocationAutoDetect: Checking geolocation support...');
          
          if (!navigator.geolocation) {
            console.error('❌ LocationAutoDetect: Geolocation not supported by browser');
            return;
          }
          
          console.log('✅ LocationAutoDetect: Geolocation supported, requesting location...');
          
          // Request user's current location
          const location = await getCurrentLocation();
          
          console.log('📍 LocationAutoDetect: Got location response:', location);
          
          // Check again if component is still mounted after async operation
          if (!isMountedRef.current) {
            console.log('⚠️ LocationAutoDetect: Component unmounted during detection, skipping save');
            return;
          }
          
          if (location && location.lat && location.lng) {
            console.log('✅ LocationAutoDetect: Got valid coordinates:', location.lat, location.lng);
            console.log('🔄 LocationAutoDetect: Starting reverse geocoding...');
            
            // Reverse geocode to get address
            const addressData = await reverseGeocode(location.lat, location.lng);
            
            console.log('🏠 LocationAutoDetect: Reverse geocode response:', addressData);
            
            // Final check if component is still mounted
            if (!isMountedRef.current) {
              console.log('⚠️ LocationAutoDetect: Component unmounted after geocoding, skipping save');
              return;
            }
            
            if (addressData && addressData.address) {
              // Use a meaningful name from the address instead of "Current Location"
              // Priority: addressLine1 > locality > city > full address
              const locationName = addressData.addressLine1 || 
                                   addressData.locality || 
                                   addressData.city || 
                                   addressData.address.split(',')[0] || 
                                   addressData.address;
              
              const locationData = {
                id: `auto_detected_${Date.now()}`,
                name: locationName, // Use actual location name instead of "Current Location"
                address: addressData.address,
                addressLine1: addressData.addressLine1,
                addressLine2: addressData.addressLine2,
                city: addressData.city,
                state: addressData.state,
                pincode: addressData.pincode,
                lat: location.lat,
                lng: location.lng,
                placeId: addressData.placeId,
                autoDetected: true, // Flag to indicate this was auto-detected
              };

              console.log('💾 LocationAutoDetect: Saving location data:', locationData);
              
              // Set location and save it
              setLocation(locationData);
              addSavedLocation(locationData);
              
              console.log('✅ LocationAutoDetect: Location auto-detected and saved successfully!');
              console.log('📍 Address:', addressData.address);
            } else {
              console.error('❌ LocationAutoDetect: Reverse geocoding returned no address data', addressData);
            }
          } else {
            console.error('❌ LocationAutoDetect: Got location but missing coordinates', location);
          }
        } catch (error) {
          // Log detailed error information
          console.error('❌ LocationAutoDetect: Error during auto-detection:', error);
          console.error('❌ LocationAutoDetect: Error name:', error.name);
          console.error('❌ LocationAutoDetect: Error message:', error.message);
          
          // Common errors:
          // - PERMISSION_DENIED: User denied permission
          // - POSITION_UNAVAILABLE: Location unavailable
          // - TIMEOUT: Request timed out
          if (error.code) {
            console.error('❌ LocationAutoDetect: Error code:', error.code);
            switch(error.code) {
              case 1:
                console.warn('⚠️ LocationAutoDetect: PERMISSION_DENIED - User denied location access');
                break;
              case 2:
                console.warn('⚠️ LocationAutoDetect: POSITION_UNAVAILABLE - Location unavailable');
                break;
              case 3:
                console.warn('⚠️ LocationAutoDetect: TIMEOUT - Request timed out');
                break;
              default:
                console.warn('⚠️ LocationAutoDetect: Unknown error code:', error.code);
            }
          }
        } finally {
          console.log('🏁 LocationAutoDetect: Detection process finished');
        }
      }, 1500); // 1.5 second delay
      
      console.log('⏳ LocationAutoDetect: Timer set for 1500ms');
    }

    // Cleanup function - don't clear timer on StrictMode remount
    // The timer will complete and check isMountedRef before saving
    return () => {
      // Only mark as unmounted, but don't clear timer
      // This allows timer to complete even if StrictMode remounts
      console.log('🧹 LocationAutoDetect: Cleanup called (may be StrictMode remount)');
      // Don't clear timer - let it complete and check isMountedRef
    };
  }, []); // Empty dependency array - only run on mount

  // This component doesn't render anything
  return null;
}

