/**
 * OTP Service - Backend Integration
 * Connects to backend API for OTP sending and verification
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './constants';

/**
 * Send OTP to phone number
 * @param {string} phoneNumber - Phone number with country code (e.g., +919876543210)
 * @returns {Promise<{success: boolean, message?: string, expires_in?: number, otp_code?: string}>}
 */
export async function sendOTP(phoneNumber) {
  try {
    const response = await apiClient.post(API_ENDPOINTS.sendOTP, {
      phone_number: phoneNumber,
    });

    // Backend returns success, message, expires_in
    // In development mode, backend may also return otp_code
    if (response.otp_code) {
      console.log(`🔐 OTP for ${phoneNumber}: ${response.otp_code}`);
      console.log(`⏰ OTP expires in ${response.expires_in || 300} seconds`);
    }

    return {
      success: true,
      message: response.message || `OTP sent to ${phoneNumber}`,
      expires_in: response.expires_in || 300,
      otp: response.otp_code, // Only in development - backend returns this for testing
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      message: error.message || 'Failed to send OTP. Please try again.',
    };
  }
}

/**
 * Verify OTP
 * @param {string} phoneNumber - Phone number with country code
 * @param {string} otp - OTP entered by user
 * @returns {Promise<{success: boolean, message?: string, verified: boolean, access_token?: string, refresh_token?: string, user?: object}>}
 */
export async function verifyOTP(phoneNumber, otp) {
  try {
    const response = await apiClient.post(API_ENDPOINTS.verifyOTP, {
      phone_number: phoneNumber,
      otp_code: otp,
    });

    // Backend sets tokens in HttpOnly cookies and returns user data
    // Handle different response structures (response.user, response.data.user, or response.data)
    const userData = response.user || response.data?.user || response.data || response;
    
    return {
      success: true,
      verified: true,
      message: response.message || 'OTP verified successfully',
      user: userData, // Tokens are in HttpOnly cookies, not in response
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    
    // Handle specific error cases
    let message = 'Failed to verify OTP. Please try again.';
    if (error.status === 400 || error.status === 422) {
      message = error.data?.message || 'Invalid OTP. Please try again.';
    } else if (error.status === 401) {
      message = 'OTP expired or invalid. Please request a new OTP.';
    }

    return {
      success: false,
      verified: false,
      message: message,
    };
  }
}

/**
 * Resend OTP to phone number
 * Uses MSG91's retry endpoint
 * @param {string} phoneNumber - Phone number with country code (e.g., +919876543210)
 * @param {string} retryType - 'text' for SMS, 'voice' for voice call (default: 'text')
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function resendOTP(phoneNumber, retryType = 'text') {
  try {
    const response = await apiClient.post(API_ENDPOINTS.resendOTP, {
      phone_number: phoneNumber,
      retry_type: retryType,
    });

    return {
      success: true,
      message: response.message || 'OTP resent successfully',
    };
  } catch (error) {
    console.error('Error resending OTP:', error);
    return {
      success: false,
      message: error.message || 'Failed to resend OTP. Please try again.',
    };
  }
}

/**
 * Clear OTP for a phone number (useful for resend)
 * Note: With backend, OTP is managed server-side, but this function
 * is kept for compatibility. Consider requesting a new OTP instead.
 * @param {string} phoneNumber - Phone number with country code
 */
export function clearOTP(phoneNumber) {
  // No-op - OTP is managed by backend
  console.log('OTP is managed by backend. Request a new OTP if needed.');
}

