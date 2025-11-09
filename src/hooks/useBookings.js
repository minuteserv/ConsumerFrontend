import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/constants';

/**
 * Custom hook to fetch user bookings from API
 * Supports filtering by status (past, upcoming)
 */
export function useBookings(status = null) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchBookings() {
      try {
        setLoading(true);
        setError(null);

        const params = {};
        if (status) {
          params.status = status;
        }

        const response = await apiClient.get(API_ENDPOINTS.bookings, { params });

        // Handle paginated response: { success: true, data: [...], pagination: {...} }
        // Or direct array response
        let bookingsData = [];
        if (Array.isArray(response)) {
          bookingsData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          bookingsData = response.data;
        } else if (response?.bookings && Array.isArray(response.bookings)) {
          bookingsData = response.bookings;
        }

        if (isMounted) {
          setBookings(bookingsData);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        if (isMounted) {
          setError(err);
          setLoading(false);
          setBookings([]);
        }
      }
    }

    fetchBookings();

    return () => {
      isMounted = false;
    };
  }, [status, refreshKey]);

  return { bookings, loading, error, refetch };
}

