/**
 * Partner API Functions
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './constants';

// Partner Profile APIs
export const getPartnerProfile = async () => {
  try {
    return await apiClient.get(API_ENDPOINTS.partnerMe);
  } catch (error) {
    console.error('Get partner profile error:', error);
    throw error;
  }
};

export const updatePartnerProfile = async (profileData) => {
  try {
    return await apiClient.put(API_ENDPOINTS.updatePartnerProfile, profileData);
  } catch (error) {
    console.error('Update partner profile error:', error);
    throw error;
  }
};

export const updateAvailability = async (isAvailable) => {
  try {
    return await apiClient.patch(API_ENDPOINTS.updateAvailability, { is_available: isAvailable });
  } catch (error) {
    console.error('Update availability error:', error);
    throw error;
  }
};

// Partner Bookings APIs
export const getPartnerBookings = async (filters = {}) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.partnerBookings, filters);
    return Array.isArray(response) ? response : response.bookings || [];
  } catch (error) {
    console.error('Get partner bookings error:', error);
    return [];
  }
};

export const getPartnerBookingById = async (id) => {
  try {
    return await apiClient.get(API_ENDPOINTS.partnerBookingDetail(id));
  } catch (error) {
    console.error('Get booking error:', error);
    throw error;
  }
};

export const acceptBooking = async (id) => {
  try {
    return await apiClient.post(API_ENDPOINTS.acceptBooking(id));
  } catch (error) {
    console.error('Accept booking error:', error);
    throw error;
  }
};

export const rejectBooking = async (id, reason) => {
  try {
    return await apiClient.post(API_ENDPOINTS.rejectBooking(id), { reason });
  } catch (error) {
    console.error('Reject booking error:', error);
    throw error;
  }
};

export const startBooking = async (id, otp) => {
  try {
    return await apiClient.post(API_ENDPOINTS.startBooking(id), { otp_code: otp });
  } catch (error) {
    console.error('Start booking error:', error);
    throw error;
  }
};

export const completeBooking = async (id) => {
  try {
    return await apiClient.post(API_ENDPOINTS.completeBooking(id));
  } catch (error) {
    console.error('Complete booking error:', error);
    throw error;
  }
};

export const updateBookingStatus = async (id, status) => {
  try {
    return await apiClient.patch(API_ENDPOINTS.updateBookingStatus(id), { status });
  } catch (error) {
    console.error('Update booking status error:', error);
    throw error;
  }
};

// Partner Dashboard APIs
export const getPartnerDashboard = async () => {
  try {
    return await apiClient.get(API_ENDPOINTS.partnerDashboard);
  } catch (error) {
    console.error('Get dashboard error:', error);
    throw error;
  }
};

// Partner Earnings APIs
export const getPartnerEarnings = async (filters = {}) => {
  try {
    return await apiClient.get(API_ENDPOINTS.partnerEarnings, filters);
  } catch (error) {
    console.error('Get earnings error:', error);
    throw error;
  }
};

export const getPartnerEarningsToday = async () => {
  try {
    return await apiClient.get(API_ENDPOINTS.partnerEarningsToday);
  } catch (error) {
    console.error('Get today earnings error:', error);
    throw error;
  }
};

