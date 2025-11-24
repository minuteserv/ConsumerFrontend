/**
 * Analytics Loader - Safe Import Wrapper
 * 
 * Provides safe analytics functions that NEVER break the site.
 * If analytics.js is blocked, these functions are no-ops.
 * 
 * This module ALWAYS exports functions - they work even if analytics.js is blocked.
 */

console.log('[Analytics-Loader] Initializing safe analytics wrapper...');

// Analytics module cache - loaded lazily
let analyticsModule = null;
let isLoading = false;
let loadAttempted = false;

// No-op function - always available
const noop = function(...args) {
  // Silently do nothing - analytics blocked or unavailable
};

// Try to load analytics module (non-blocking, lazy)
async function ensureAnalyticsLoaded() {
  // Only try once
  if (loadAttempted) {
    return analyticsModule !== null;
  }
  
  loadAttempted = true;
  
  if (isLoading) {
    return false;
  }
  
  isLoading = true;
  
  try {
    console.log('[Analytics-Loader] Attempting to dynamically load analytics module...');
    analyticsModule = await import('./analytics.js');
    console.log('[Analytics-Loader] ✓ Analytics module loaded successfully');
    isLoading = false;
    return true;
  } catch (error) {
    console.warn('[Analytics-Loader] ✗ Analytics module blocked or unavailable (non-critical)');
    console.warn('[Analytics-Loader] Error type:', error.name, 'Message:', error.message);
    analyticsModule = null;
    isLoading = false;
    return false;
  }
}

// Start loading analytics in background (non-blocking)
ensureAnalyticsLoaded().catch(() => {
  // Already handled
});

// Safe wrapper function
function createSafeFunction(fnName) {
  return function(...args) {
    // Always safe - never throws
    try {
      // Try to use real function if available
      if (analyticsModule && typeof analyticsModule[fnName] === 'function') {
        return analyticsModule[fnName](...args);
      }
      // Otherwise silently do nothing (analytics blocked)
      return;
    } catch (error) {
      // Never throw - analytics should never break the site
      console.debug(`[Analytics-Loader] Error in ${fnName} (ignored):`, error.message);
    }
  };
}

// Export safe functions - ALWAYS available, NEVER throw
// These work even if analytics.js is completely blocked
export const trackServiceViewed = createSafeFunction('trackServiceViewed');
export const trackAddToCart = createSafeFunction('trackAddToCart');
export const trackBeginCheckout = createSafeFunction('trackBeginCheckout');
export const trackAddPaymentInfo = createSafeFunction('trackAddPaymentInfo');
export const trackPurchase = createSafeFunction('trackPurchase');
export const trackPaymentFailed = createSafeFunction('trackPaymentFailed');

console.log('[Analytics-Loader] ✓ Safe functions exported - site will work even if analytics is blocked');

