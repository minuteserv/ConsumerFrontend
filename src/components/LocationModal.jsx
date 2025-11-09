import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, X, ArrowLeft, Home } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';
import { getLocationAutocomplete, getCurrentLocation, reverseGeocode } from '../lib/location';

export function LocationModal({ open, onOpenChange }) {
  const { currentLocation, setLocation, savedLocations, addSavedLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await getLocationAutocomplete(searchQuery.trim(), {
            lat: currentLocation?.lat,
            lng: currentLocation?.lng,
          });
          setSearchResults(results);
        } catch (error) {
          console.error('Error fetching location suggestions:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, currentLocation]);

  const handleUseCurrentLocation = async () => {
    setIsGettingCurrentLocation(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        const addressData = await reverseGeocode(location.lat, location.lng);
        if (addressData) {
          // Use a meaningful name from the address instead of "Current Location"
          // Priority: addressLine1 > locality > city > full address
          const locationName = addressData.addressLine1 || 
                               addressData.locality || 
                               addressData.city || 
                               addressData.address.split(',')[0] || 
                               addressData.address;
          
          const locationData = {
            id: `current_${Date.now()}`,
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
          };
          
          // Fill the search input with the detected address
          setSearchQuery(addressData.address);
          
          // Set location and save it
          setLocation(locationData);
          addSavedLocation(locationData);
          
          // Show the address in the input for a moment, then close
          setTimeout(() => {
            onOpenChange(false);
            setSearchQuery('');
            setSearchResults([]);
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      setIsGettingCurrentLocation(false);
      alert('Unable to get your current location. Please enable location services and try again.');
    }
  };

  const handleSelectLocation = async (location) => {
    // If we have coordinates, reverse geocode to get full address details
    let locationData = {
      id: location.id || location.placeId || `loc_${Date.now()}`,
      name: location.mainText || location.description || 'Selected Location',
      address: location.description || location.address || '',
      addressLine1: location.addressLine1 || '',
      addressLine2: location.addressLine2 || '',
      city: location.city || '',
      state: location.state || '',
      pincode: location.pincode || '',
      lat: location.lat,
      lng: location.lng,
      placeId: location.placeId || location.id,
    };

    // If we have lat/lng but missing address components, reverse geocode
    if ((location.lat && location.lng) && (!locationData.addressLine1 || !locationData.city)) {
      try {
        const addressData = await reverseGeocode(location.lat, location.lng);
        if (addressData) {
          locationData = {
            ...locationData,
            address: addressData.address || locationData.address,
            addressLine1: addressData.addressLine1 || locationData.addressLine1,
            addressLine2: addressData.addressLine2 || locationData.addressLine2,
            city: addressData.city || locationData.city,
            state: addressData.state || locationData.state,
            pincode: addressData.pincode || locationData.pincode,
          };
        }
      } catch (error) {
        console.error('Error reverse geocoding selected location:', error);
      }
    }

    // Fill search input with selected address
    setSearchQuery(locationData.address);
    
    // Set location and save it
    setLocation(locationData);
    addSavedLocation(locationData);
    
    // Close after brief delay to show selection
    setTimeout(() => {
      onOpenChange(false);
      setSearchQuery('');
      setSearchResults([]);
    }, 800);
  };

  const handleSelectSavedLocation = (location) => {
    // Fill search input with saved location address
    setSearchQuery(location.address);
    
    // Set location
    setLocation(location);
    
    // Close after brief delay to show selection
    setTimeout(() => {
      onOpenChange(false);
      setSearchQuery('');
      setSearchResults([]);
    }, 800);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[520px] p-0 rounded-t-2xl rounded-b-2xl max-h-[90vh] flex flex-col"
        hideClose={true}
        style={{
          marginTop: 'auto',
          marginBottom: 0,
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          height: 'auto',
          maxHeight: '725px',
          minHeight: '60px',
        }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Select Location</DialogTitle>
          <DialogDescription>Choose your service location or search for an address</DialogDescription>
        </DialogHeader>
        {/* Close Button */}
        <div className="flex justify-end p-4 pb-2">
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close Button"
          >
            <X size={20} color="#0F0F0F" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Search Input */}
          <div className="mb-4">
            <div className="flex items-center border border-gray-300 rounded-lg bg-white">
              <div className="px-3 flex items-center">
                <ArrowLeft size={16} color="#0F0F0F" />
              </div>
              <Input
                type="text"
                placeholder="Search for your location/society/apartment"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                style={{
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '14px',
                  lineHeight: '20px',
                  fontWeight: 400,
                }}
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="px-3 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Clear search"
                >
                  <X size={16} color="#545454" />
                </button>
              )}
            </div>
          </div>

          {/* Use Current Location */}
          <div className="mb-4">
            <button
              onClick={handleUseCurrentLocation}
              disabled={isGettingCurrentLocation}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <MapPin size={20} color="#6E42E5" />
              <span
                style={{
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#6E42E5',
                  fontWeight: 600,
                }}
              >
                {isGettingCurrentLocation ? 'Getting location...' : 'Use current location'}
              </span>
            </button>
          </div>

          {/* Saved Locations (only show when no search query) */}
          {!searchQuery && savedLocations.length > 0 && (
            <div className="mb-4">
              <h4
                style={{
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '20px',
                  lineHeight: '28px',
                  color: '#0F0F0F',
                  fontWeight: 600,
                  marginBottom: '12px',
                }}
              >
                Saved
              </h4>
              <div className="space-y-2">
                {savedLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleSelectSavedLocation(location)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Home size={20} color="#545454" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        style={{
                          fontFamily: 'system-ui, sans-serif',
                          fontSize: '14px',
                          lineHeight: '20px',
                          color: '#0F0F0F',
                          fontWeight: 600,
                          marginBottom: '4px',
                        }}
                      >
                        {location.name}
                      </p>
                      <p
                        style={{
                          fontFamily: 'system-ui, sans-serif',
                          fontSize: '12px',
                          lineHeight: '16px',
                          color: '#545454',
                          fontWeight: 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {location.address}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchQuery && (
            <div className="mb-4">
              {isSearching ? (
                <div className="text-center py-8">
                  <p
                    style={{
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#545454',
                    }}
                  >
                    Searching...
                  </p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={result.id || result.placeId || index}
                      onClick={() => handleSelectLocation(result)}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <MapPin size={20} color="#545454" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          style={{
                            fontFamily: 'system-ui, sans-serif',
                            fontSize: '14px',
                            lineHeight: '20px',
                            color: '#0F0F0F',
                            fontWeight: 600,
                            marginBottom: '4px',
                          }}
                        >
                          {result.mainText || result.description || 'Location'}
                        </p>
                        <p
                          style={{
                            fontFamily: 'system-ui, sans-serif',
                            fontSize: '12px',
                            lineHeight: '16px',
                            color: '#545454',
                            fontWeight: 400,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {result.secondaryText || result.description || ''}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p
                    style={{
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#545454',
                    }}
                  >
                    No results found. Try a different search term.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Powered by Ola (changed from Google) */}
      
        </div>
      </DialogContent>
    </Dialog>
  );
}

