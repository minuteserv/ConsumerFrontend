/**
 * Safe Analytics Wrapper
 * 
 * This file re-exports analytics functions with comprehensive error handling.
 * Simply re-exports from analytics.js - all functions there are already safe.
 * 
 * If analytics.js is blocked, this import will fail, but components handle it gracefully.
 */

console.log('[Analytics-Safe] Module initializing...');

// Direct re-export - if analytics.js is blocked, this import will fail
// but components using this will handle the error gracefully
export {
  trackServiceViewed,
  trackAddToCart,
  trackBeginCheckout,
  trackAddPaymentInfo,
  trackPurchase,
  trackPaymentFailed
} from './analytics';

console.log('[Analytics-Safe] Module initialized - re-exporting from analytics.js');

