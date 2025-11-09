/**
 * API Functions - Backend Integration
 * All API calls now use the centralized API client
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './constants';

/**
 * Prepare checkout - Get pricing, time slots, and validate promo code
 * @param {Object} checkoutData - Checkout preparation data
 * @returns {Promise<Object>} Checkout preparation response
 */
export const prepareCheckout = async (checkoutData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.checkoutPrepare, {
      service_ids: checkoutData.service_ids || checkoutData.services?.map(s => s.id || s.service_id) || [],
      promo_code: checkoutData.promo_code || null,
      address_id: checkoutData.address_id || null,
      booking_date: checkoutData.booking_date || null,
    });

    return {
      success: true,
      ...response,
    };
  } catch (error) {
    console.error('Prepare checkout error:', error);
    throw error;
  }
};

/**
 * Validate promo code against backend (Supabase)
 * @param {Object} payload
 * @param {string} payload.code
 * @param {number} payload.amount
 * @returns {Promise<{success:boolean, promo:Object, message:string}>}
 */
export const validatePromoCodeAPI = async ({ code, amount }) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.validatePromo, {
      code,
      amount,
    });

    return {
      success: response?.success ?? true,
      promo: response?.data ?? response,
      message: response?.message ?? 'Promo code applied successfully',
    };
  } catch (error) {
    const message =
      error?.data?.error ||
      error?.message ||
      'Unable to apply promo code at the moment.';
    const enhancedError = new Error(message);
    enhancedError.status = error?.status;
    throw enhancedError;
  }
};

/**
 * Create booking - Backend Integration
 * @param {Object} bookingData - Booking data
 * @returns {Promise<Object>} Booking response
 */
export const bookingAPI = async (bookingData) => {
  try {
    // Transform booking data to match backend format
    const backendBookingData = {
      preview_id: bookingData.preview_id || null,
      payment_method: bookingData.payment_method || bookingData.paymentMethod || 'cash',
      address_id: bookingData.address_id || bookingData.addressId || null,
      booking_date: bookingData.booking_date || bookingData.bookingDate || bookingData.date,
      booking_time: bookingData.booking_time || bookingData.bookingTime || bookingData.time,
      customer_name: bookingData.customer_name || bookingData.customerName || bookingData.name,
      customer_phone: bookingData.customer_phone || bookingData.customerPhone || bookingData.phone,
      customer_email: bookingData.customer_email || bookingData.customerEmail || bookingData.email || null,
      services: bookingData.services?.map(service => ({
        service_id: service.id || service.service_id,
        quantity: service.quantity || 1,
      })) || [],
      promo_code: bookingData.promo_code || bookingData.promoCode || null,
      cancellation_policy_accepted: bookingData.cancellation_policy_accepted || bookingData.cancellationPolicyAccepted || false,
    };

    // Use checkout/confirm endpoint which creates booking and payment order
    const response = await apiClient.post(API_ENDPOINTS.checkoutConfirm, backendBookingData);

    const data = response?.data ?? response;
    const bookingInfo = data?.booking ?? response?.booking ?? data ?? {};
    const paymentInfo = data?.payment ?? response?.payment ?? null;

    return {
      success: true,
      booking: bookingInfo,
      payment: paymentInfo,
      bookingId: bookingInfo?.id || response?.booking_id || response?.id || null,
      bookingNumber: bookingInfo?.booking_number || response?.booking_number || null,
      message: response?.message || data?.message || 'Booking confirmed successfully',
    };
  } catch (error) {
    console.error('Booking API error:', error);
    throw error;
  }
};

/**
 * Submit contact form - Backend Integration
 * @param {Object} contactData - Contact form data
 * @returns {Promise<Object>} Contact submission response
 */
export const contactUsAPI = async (contactData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.contact, {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone || null,
      message: contactData.message,
    });

    return {
      success: true,
      message: response.message || 'Thank you for contacting us. We\'ll get back to you soon.',
      data: response,
    };
  } catch (error) {
    console.error('Contact API error:', error);
    throw error;
  }
};

/**
 * Get user bookings
 * @param {Object} options - Query options
 * @returns {Promise<Object>} User bookings
 */
export const getUserBookings = async (options = {}) => {
  try {
    const { status, page = 1, limit = 10 } = options;
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    queryParams.append('page', page);
    queryParams.append('limit', limit);

    const response = await apiClient.get(`${API_ENDPOINTS.bookings}?${queryParams.toString()}`);

    return {
      success: true,
      bookings: response.data || response,
      pagination: response.pagination || {},
    };
  } catch (error) {
    console.error('Get bookings error:', error);
    throw error;
  }
};

/**
 * Get booking by ID
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Booking details
 */
export const getBookingById = async (bookingId) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.bookingDetail(bookingId));
    return {
      success: true,
      booking: response.data || response,
    };
  } catch (error) {
    console.error('Get booking error:', error);
    throw error;
  }
};

/**
 * Cancel booking
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Cancellation response
 */
export const cancelBooking = async (bookingId) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.cancelBooking(bookingId), {});
    return {
      success: true,
      message: response.message || 'Booking cancelled successfully',
      booking: response.data || response,
    };
  } catch (error) {
    console.error('Cancel booking error:', error);
    throw error;
  }
};

/**
 * Save user address
 * @param {Object} addressData - Address data
 * @returns {Promise<Object>} Address creation response
 */
export const saveAddress = async (addressData) => {
  try {
    const response = await apiClient.post('/addresses', {
      name: addressData.name || 'Home',
      address_line1: addressData.address_line1 || addressData.addressLine1,
      address_line2: addressData.address_line2 || addressData.addressLine2 || addressData.addressLine2 || null,
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode,
      lat: addressData.lat || null,
      lng: addressData.lng || null,
      place_id: addressData.place_id || addressData.placeId || null,
      is_default: addressData.is_default || addressData.isDefault || false,
    });

    return {
      success: true,
      address: response.data || response,
      address_id: response.data?.id || response.id,
      message: response.message || 'Address saved successfully',
    };
  } catch (error) {
    console.error('Save address error:', error);
    throw error;
  }
};

/**
 * Get user addresses
 * @returns {Promise<Object>} User addresses
 */
export const getUserAddresses = async () => {
  try {
    const response = await apiClient.get('/addresses');
    return {
      success: true,
      addresses: response.data || response,
    };
  } catch (error) {
    console.error('Get addresses error:', error);
    throw error;
  }
};
