/**
 * API Constants for Partner App
 */

const getRequiredEnvVar = (key, description) => {
  const value = import.meta.env[key];
  if (!value) {
    console.warn(
      `⚠️  Environment variable ${key} is not set. ${description}`
    );
  }
  return value;
};

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// API Endpoints
export const API_ENDPOINTS = {
  // Partner Auth
  partnerSendOTP: '/partner/auth/send-otp',
  partnerVerifyOTP: '/partner/auth/verify-otp',
  partnerRegister: '/partner/auth/register',
  partnerLogin: '/partner/auth/login',
  partnerLogout: '/partner/auth/logout',
  partnerMe: '/partner/auth/me',
  partnerRefreshToken: '/partner/auth/refresh-token',
  
  // Partner Profile
  partnerProfile: '/partner/profile',
  updatePartnerProfile: '/partner/profile',
  updateAvailability: '/partner/profile/availability',
  
  // Partner Bookings
  partnerBookings: '/partner/bookings',
  partnerBookingDetail: (id) => `/partner/bookings/${id}`,
  acceptBooking: (id) => `/partner/bookings/${id}/accept`,
  rejectBooking: (id) => `/partner/bookings/${id}/reject`,
  startBooking: (id) => `/partner/bookings/${id}/start`,
  completeBooking: (id) => `/partner/bookings/${id}/complete`,
  updateBookingStatus: (id) => `/partner/bookings/${id}/status`,
  verifyStartOTP: (id) => `/partner/bookings/${id}/verify-start-otp`,
  
  // Partner Earnings
  partnerEarnings: '/partner/earnings',
  partnerEarningsToday: '/partner/earnings/today',
  partnerEarningsWeek: '/partner/earnings/week',
  partnerEarningsMonth: '/partner/earnings/month',
  partnerPayouts: '/partner/payouts',
  
  // Partner Dashboard
  partnerDashboard: '/partner/dashboard',
};

// Booking Status Constants
export const BOOKING_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Payment Methods
export const PAYMENT_METHOD = {
  CASH: 'cash',
  ONLINE: 'online',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

