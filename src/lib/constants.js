const getRequiredEnvVar = (key, description = '') => {
  const value = import.meta.env[key];
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  const details = description ? ` ${description}` : '';
  throw new Error(
    `[Config] Missing required environment variable ${key}.${details} Please add it to your .env file before building or running the app.`
  );
};

export const COMPANY_INFO = {
  name: 'Minuteserv',
  email: 'minuteserv1@gmail.com',
  phone: '+91 81002 30459',
  whatsapp: '+91 81002 30459',
  address: '75/95, Ram Thakur Road, Bijoygarh, Jadavpur, Kolkata-700032',
};

// API Base URL - Can be overridden with VITE_API_BASE_URL env variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// API Endpoints - Backend Integration
export const API_ENDPOINTS = {
  // Authentication
  sendOTP: '/auth/send-otp',
  verifyOTP: '/auth/verify-otp',
  refreshToken: '/auth/refresh-token',
  logout: '/auth/logout',
  getCurrentUser: '/auth/me',
  
  // Services
  services: '/services',
  serviceDetail: (id) => `/services/${id}`,
  
  // Checkout & Booking
  checkoutPrepare: '/checkout/prepare',
  checkoutConfirm: '/checkout/confirm', // Creates booking and payment order
  validatePromo: '/promos/validate',
  bookings: '/bookings',
  bookingDetail: (id) => `/bookings/${id}`,
  cancelBooking: (id) => `/bookings/${id}/cancel`,
  
  // Payment
  verifyPayment: '/payments/verify',
  
  // Contact
  contact: '/contact',
  
  // Dashboard
  dashboard: '/dashboard',
  
  // Loyalty Points
  loyaltyBalance: '/loyalty/balance',
  loyaltyHistory: '/loyalty/history',
  loyaltyRedeem: '/loyalty/redeem',
  loyaltyApplyRedemption: '/loyalty/apply-redemption',
  loyaltyTiers: '/loyalty/tiers',
  
  // Legacy endpoints (for backward compatibility during migration)
  booking: '/bookings', // Legacy - use bookings
  contactUs: '/contact', // Legacy - use contact
  razorpayCreateOrder: '/checkout/prepare', // Legacy - use checkoutPrepare
  razorpayVerifyPayment: '/payments/verify', // Legacy - use verifyPayment
};

// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  keyId: getRequiredEnvVar('VITE_RAZORPAY_KEY_ID', 'This is your Razorpay public key.'),
  // Note: For dynamic pricing based on cart value, use Razorpay Checkout (Orders API)
  // Payment Links are for fixed amounts, so we use Orders API instead
};

// Ola API Configuration
export const OLA_API_CONFIG = {
  key: getRequiredEnvVar('VITE_OLA_API_KEY', 'This is your Ola Maps API key.'),
  baseUrl: 'https://api.olamaps.io/places/v1',
  endpoints: {
    autocomplete: '/autocomplete',
    reverseGeocode: '/reverse-geocode',
  },
};
