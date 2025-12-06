/**
 * OTP Service for Partner App
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './constants';

/**
 * Send OTP to partner phone number
 */
export async function sendOTP(phoneNumber) {
  try {
    const response = await apiClient.post(API_ENDPOINTS.partnerSendOTP, {
      phone_number: phoneNumber,
    });

    if (response.otp_code) {
      console.log(`🔐 OTP for ${phoneNumber}: ${response.otp_code}`);
    }

    return {
      success: true,
      message: response.message || `OTP sent to ${phoneNumber}`,
      expires_in: response.expires_in || 300,
      otp: response.otp_code, // Only in development
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
 * Verify OTP for partner login
 */
export async function verifyOTP(phoneNumber, otp) {
  try {
    const response = await apiClient.post(API_ENDPOINTS.partnerVerifyOTP, {
      phone_number: phoneNumber,
      otp_code: otp,
    });

    const partnerData = response.partner || response.data || response;
    
    return {
      success: true,
      verified: true,
      message: response.message || 'OTP verified successfully',
      partner: partnerData,
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    
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
 * Verify OTP to start booking service
 */
export async function verifyStartOTP(bookingId, otp) {
  try {
    const response = await apiClient.post(API_ENDPOINTS.verifyStartOTP(bookingId), {
      otp_code: otp,
    });

    return {
      success: true,
      verified: true,
      message: response.message || 'OTP verified successfully',
      booking: response.booking || response.data,
    };
  } catch (error) {
    console.error('Error verifying start OTP:', error);
    
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

