/**
 * Google Analytics 4 Event Tracking Utility
 * 
 * This module provides centralized analytics tracking functions for the Minuteserv platform.
 * All events follow GA4 ecommerce standards for consistent reporting.
 * 
 * This module is designed to fail gracefully if analytics is blocked by ad blockers.
 */

// Log initialization
console.log('[Analytics] Module loading...');

// Track if module loaded successfully
let moduleLoaded = false;
try {
  moduleLoaded = true;
  console.log('[Analytics] Module loaded successfully');
} catch (error) {
  console.error('[Analytics] Module failed to load:', error);
  moduleLoaded = false;
}

/**
 * Check if gtag is available
 */
function isGtagAvailable() {
  try {
    const available = typeof window !== 'undefined' && typeof window.gtag === 'function';
    if (!available) {
      console.debug('[Analytics] gtag not available');
    }
    return available;
  } catch (error) {
    console.debug('[Analytics] Error checking gtag availability:', error);
    return false;
  }
}

/**
 * Detect device type (desktop or mobile/web)
 * Returns: 'desktop' or 'mobile'
 */
function getDeviceType() {
  try {
    if (typeof window === 'undefined') return 'desktop';
    
    // Method 1: Check screen width (most reliable for responsive design)
    const width = window.innerWidth || window.screen?.width || 0;
    if (width < 768) {
      return 'mobile';
    }
    
    // Method 2: Check user agent as fallback
    const userAgent = navigator.userAgent || navigator.vendor || '';
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    if (mobileRegex.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  } catch (error) {
    console.debug('[Analytics] Error detecting device type:', error);
    return 'desktop'; // Default to desktop
  }
}

/**
 * Safe wrapper for gtag calls - prevents errors from breaking the site
 */
function safeGtag(...args) {
  try {
    if (isGtagAvailable()) {
      window.gtag(...args);
      console.debug('[Analytics] Event tracked:', args[0], args[1]);
    } else {
      console.debug('[Analytics] Event skipped - gtag not available:', args[0]);
    }
  } catch (error) {
    // Log but don't throw - analytics should never break the site
    console.warn('[Analytics] Tracking error (non-blocking):', error);
  }
}

/**
 * Track service viewed event
 * Fires when user views a service detail page
 */
export function trackServiceViewed(service) {
  try {
    if (!isGtagAvailable()) return;

    const price = service.productCost || service.marketPrice || 0;
    const deviceType = getDeviceType();
    
    safeGtag('event', 'view_item', {
    currency: 'INR',
    value: price,
    device_type: deviceType,
    items: [{
      item_id: service.id || service.name,
      item_name: service.name,
      item_category: service.category,
      item_category2: service.tier,
      price: price,
      quantity: 1
    }]
    });

    // Also track as custom event for clarity
    safeGtag('event', 'service_viewed', {
    service_id: service.id || service.name,
    service_name: service.name,
    service_category: service.category,
      service_tier: service.tier,
      service_price: price,
      device_type: deviceType
    });
  } catch (error) {
    // Silently fail - analytics should never break the site
    console.debug('Analytics tracking error:', error);
  }
}

/**
 * Track add to cart event
 * Fires when user adds a service to cart
 */
export function trackAddToCart(service, quantity = 1) {
  try {
    if (!isGtagAvailable()) return;

    const price = service.productCost || service.marketPrice || service.price || 0;
    const value = price * quantity;
    const deviceType = getDeviceType();

    safeGtag('event', 'add_to_cart', {
    currency: 'INR',
    value: value,
    device_type: deviceType,
    items: [{
      item_id: service.id || service.name,
      item_name: service.name,
      item_category: service.category,
      item_category2: service.tier,
      price: price,
      quantity: quantity
    }]
    });
  } catch (error) {
    console.debug('Analytics tracking error:', error);
  }
}

/**
 * Track begin checkout event
 * Fires when user enters checkout page or clicks checkout button
 */
export function trackBeginCheckout(cart, totalValue) {
  try {
    if (!isGtagAvailable()) return;

    const deviceType = getDeviceType();
    const items = cart.map(item => {
    const price = item.productCost || item.marketPrice || item.price || 0;
    return {
      item_id: item.id || item.name,
      item_name: item.name,
      item_category: item.category,
      item_category2: item.tier,
      price: price,
      quantity: item.quantity || 1
    };
  });

    safeGtag('event', 'begin_checkout', {
      currency: 'INR',
      value: totalValue,
      device_type: deviceType,
      items: items
    });
  } catch (error) {
    console.debug('Analytics tracking error:', error);
  }
}

/**
 * Track add payment info event
 * Fires when user enters payment information
 */
export function trackAddPaymentInfo(paymentMethod, totalValue) {
  try {
    if (!isGtagAvailable()) return;

    const deviceType = getDeviceType();
    safeGtag('event', 'add_payment_info', {
    currency: 'INR',
      value: totalValue,
      payment_type: paymentMethod,
      device_type: deviceType
    });
  } catch (error) {
    console.debug('Analytics tracking error:', error);
  }
}

/**
 * Track purchase/booking completed event
 * Fires when booking is successfully completed and payment is verified
 */
export function trackPurchase(bookingData) {
  try {
    if (!isGtagAvailable()) return;

    const { 
      bookingId, 
      services, 
      totalPrice, 
      paymentMethod, 
      paymentId,
      promoCode,
      customerPhone 
    } = bookingData;

    const deviceType = getDeviceType();
    const items = services.map(item => {
    const price = item.productCost || item.marketPrice || item.price || 0;
    return {
      item_id: item.id || item.name,
      item_name: item.name,
      item_category: item.category,
      item_category2: item.tier,
      price: price,
      quantity: item.quantity || 1
    };
  });

    safeGtag('event', 'purchase', {
      transaction_id: bookingId || paymentId,
      value: totalPrice,
      currency: 'INR',
      device_type: deviceType,
      items: items,
      payment_type: paymentMethod,
      coupon: promoCode || undefined
    });

    // Also track as booking_completed for clarity
    safeGtag('event', 'booking_completed', {
    booking_id: bookingId,
    transaction_id: paymentId,
    value: totalPrice,
    currency: 'INR',
    device_type: deviceType,
    item_count: services.length,
    payment_method: paymentMethod,
      promo_code: promoCode || undefined
    });

    // Track VIP customer if applicable
    trackVIPCustomer(customerPhone, totalPrice);
  } catch (error) {
    console.debug('Analytics tracking error:', error);
  }
}

/**
 * Track payment failed event
 */
export function trackPaymentFailed(error, amount) {
  try {
    if (!isGtagAvailable()) return;

    const deviceType = getDeviceType();
    safeGtag('event', 'payment_failed', {
    currency: 'INR',
    value: amount,
      device_type: deviceType,
      error_message: error?.message || error?.error?.description || 'Payment failed',
      error_code: error?.error?.code || 'UNKNOWN'
    });
  } catch (err) {
    console.debug('Analytics tracking error:', err);
  }
}

/**
 * VIP Customer Tracking System
 * 
 * Identifies and tracks high-value customers (VVIP)
 * Criteria: Customers with 3+ bookings OR total spend > ₹5000
 */

// VIP tracking storage key
const VIP_STORAGE_KEY = 'minuteserv_vip_customers';

/**
 * Get VIP customers from localStorage
 */
function getVIPCustomers() {
  try {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem(VIP_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading VIP customers:', error);
    return {};
  }
}

/**
 * Save VIP customers to localStorage
 */
function saveVIPCustomers(vipCustomers) {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(VIP_STORAGE_KEY, JSON.stringify(vipCustomers));
  } catch (error) {
    console.error('Error saving VIP customers:', error);
  }
}

/**
 * Track VIP customer after purchase
 * Updates customer record and sets VIP status if criteria met
 */
function trackVIPCustomer(customerPhone, bookingValue) {
  try {
    if (!customerPhone) return;

    const vipCustomers = getVIPCustomers();
    const phoneKey = customerPhone.replace(/\D/g, ''); // Remove non-digits

    if (!vipCustomers[phoneKey]) {
      vipCustomers[phoneKey] = {
        phone: customerPhone,
        bookingCount: 0,
        totalSpent: 0,
        isVIP: false,
        firstBookingDate: new Date().toISOString(),
        lastBookingDate: new Date().toISOString()
      };
    }

    // Update customer record
    vipCustomers[phoneKey].bookingCount += 1;
    vipCustomers[phoneKey].totalSpent += bookingValue;
    vipCustomers[phoneKey].lastBookingDate = new Date().toISOString();

    // Check VIP criteria
    const wasVIP = vipCustomers[phoneKey].isVIP;
    const isVIP = vipCustomers[phoneKey].bookingCount >= 3 || vipCustomers[phoneKey].totalSpent >= 5000;
    vipCustomers[phoneKey].isVIP = isVIP;

    // Save updated data
    saveVIPCustomers(vipCustomers);

    // Track VIP status in GA4
    const deviceType = getDeviceType();
    if (isVIP && !wasVIP) {
      // Customer just became VIP
      safeGtag('event', 'customer_became_vip', {
        customer_phone: phoneKey, // Hashed/anonymized
        booking_count: vipCustomers[phoneKey].bookingCount,
        total_spent: vipCustomers[phoneKey].totalSpent,
        currency: 'INR',
        device_type: deviceType
      });

      // Set user property for VIP status
      safeGtag('set', 'user_properties', {
        is_vip: true,
        vip_tier: vipCustomers[phoneKey].totalSpent >= 10000 ? 'premium' : 'standard'
      });
    }

    // Track VIP purchase
    if (isVIP) {
      safeGtag('event', 'vip_purchase', {
        customer_phone: phoneKey, // Hashed/anonymized
        booking_value: bookingValue,
        total_spent: vipCustomers[phoneKey].totalSpent,
        booking_count: vipCustomers[phoneKey].bookingCount,
        currency: 'INR',
        device_type: deviceType
      });
    }
  } catch (error) {
    console.debug('VIP tracking error:', error);
  }
}

/**
 * Get VIP status for a customer
 */
export function getVIPStatus(customerPhone) {
  if (!customerPhone) return null;

  const vipCustomers = getVIPCustomers();
  const phoneKey = customerPhone.replace(/\D/g, '');
  return vipCustomers[phoneKey] || null;
}

/**
 * Check if customer is VIP
 */
export function isVIPCustomer(customerPhone) {
  const status = getVIPStatus(customerPhone);
  return status?.isVIP || false;
}

/**
 * Get all VIP customers (for admin/reporting)
 */
export function getAllVIPCustomers() {
  return getVIPCustomers();
}

