import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const LocationContext = createContext(null);

const LOCATION_STORAGE_KEY = 'minuteserv_location';
const SAVED_LOCATIONS_KEY = 'minuteserv_saved_locations';

function loadLocationFromStorage() {
  try {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading location from localStorage:', error);
    return null;
  }
}

function loadSavedLocationsFromStorage() {
  try {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(SAVED_LOCATIONS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading saved locations from localStorage:', error);
    return [];
  }
}

function saveLocationToStorage(locationData) {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
  } catch (error) {
    console.error('Error saving location to localStorage:', error);
  }
}

function saveSavedLocationsToStorage(locations) {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(locations));
  } catch (error) {
    console.error('Error saving saved locations to localStorage:', error);
  }
}

export function LocationProvider({ children }) {
  const [currentLocation, setCurrentLocation] = useState(() => loadLocationFromStorage());
  const [savedLocations, setSavedLocations] = useState(() => loadSavedLocationsFromStorage());

  // Save location to localStorage whenever it changes
  useEffect(() => {
    if (currentLocation) {
      saveLocationToStorage(currentLocation);
    }
  }, [currentLocation]);

  // Save saved locations to localStorage whenever they change
  useEffect(() => {
    saveSavedLocationsToStorage(savedLocations);
  }, [savedLocations]);

  const setLocation = useCallback((locationData) => {
    setCurrentLocation(locationData);
  }, []);

  const addSavedLocation = useCallback((locationData) => {
    setSavedLocations((prev) => {
      // Check if location already exists
      const exists = prev.some(
        (loc) => loc.address === locationData.address || loc.placeId === locationData.placeId
      );
      if (exists) return prev;
      return [...prev, { ...locationData, savedAt: Date.now() }];
    });
  }, []);

  const removeSavedLocation = useCallback((locationId) => {
    setSavedLocations((prev) => prev.filter((loc) => loc.id !== locationId));
  }, []);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        setLocation,
        savedLocations,
        addSavedLocation,
        removeSavedLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

