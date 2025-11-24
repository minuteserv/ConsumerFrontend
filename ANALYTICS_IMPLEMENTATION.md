# Analytics Implementation Documentation

## Overview

This document describes the Google Analytics 4 (GA4) event tracking implementation for the Minuteserv platform. The implementation tracks the complete booking funnel from service viewing to booking completion, and includes a VIP customer tracking system.

## Implementation Date

December 2024

## Tracking Setup

### Tools Used
- **Google Analytics 4**: Primary analytics platform
- **Microsoft Clarity**: Visual behavior insights (heatmaps, session recordings)

### GA4 Measurement ID
- `G-M8TVCXX7Z1`

## Event Tracking Implementation

### Complete Booking Funnel

The following events are tracked in sequence:

1. **Service Viewed** → 2. **Add to Cart** → 3. **Begin Checkout** → 4. **Add Payment Info** → 5. **Purchase/Booking Completed**

---

## Event Details

### 1. Service Viewed (`view_item` / `service_viewed`)

**When it fires:**
- User views a service detail page

**Location:**
- `src/pages/ServiceDetail.jsx` - useEffect hook when service loads

**Event Data:**
```javascript
{
  currency: 'INR',
  value: service.price,
  items: [{
    item_id: service.id,
    item_name: service.name,
    item_category: service.category,
    item_category2: service.tier,
    price: service.price,
    quantity: 1
  }]
}
```

**GA4 Events:**
- `view_item` (standard GA4 ecommerce event)
- `service_viewed` (custom event)

---

### 2. Add to Cart (`add_to_cart`)

**When it fires:**
- User clicks "Add to Cart" button
- User clicks "Select" button on service card

**Locations:**
- `src/pages/ServiceDetail.jsx` - `handleAddToCart()` function
- `src/components/ServiceCard.jsx` - `handleSelect()` function

**Event Data:**
```javascript
{
  currency: 'INR',
  value: price * quantity,
  items: [{
    item_id: service.id,
    item_name: service.name,
    item_category: service.category,
    item_category2: service.tier,
    price: price,
    quantity: quantity
  }]
}
```

**GA4 Events:**
- `add_to_cart` (standard GA4 ecommerce event)

---

### 3. Begin Checkout (`begin_checkout`)

**When it fires:**
- User enters checkout page (component mounts)

**Location:**
- `src/pages/Checkout.jsx` - useEffect hook on component mount

**Event Data:**
```javascript
{
  currency: 'INR',
  value: totalCartValue,
  items: [
    {
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      item_category2: item.tier,
      price: item.price,
      quantity: item.quantity
    },
    // ... more items
  ]
}
```

**GA4 Events:**
- `begin_checkout` (standard GA4 ecommerce event)

---

### 4. Add Payment Info (`add_payment_info`)

**When it fires:**
- User selects payment method (online/card or cash)

**Location:**
- `src/pages/Checkout.jsx` - useEffect hook when paymentMethod changes

**Event Data:**
```javascript
{
  currency: 'INR',
  value: totalValue,
  payment_type: 'online' | 'cash'
}
```

**GA4 Events:**
- `add_payment_info` (standard GA4 ecommerce event)

---

### 5. Purchase/Booking Completed (`purchase` / `booking_completed`)

**When it fires:**
- Booking is successfully completed and payment is verified (online)
- Booking is successfully created (cash payment)

**Locations:**
- `src/pages/Checkout.jsx` - `handlePaymentSuccess()` function (online)
- `src/pages/Checkout.jsx` - `handleCashPaymentBooking()` function (cash)

**Event Data:**
```javascript
{
  transaction_id: bookingId,
  value: totalPrice,
  currency: 'INR',
  items: [...cartItems],
  payment_type: 'online' | 'cash',
  coupon: promoCode
}
```

**GA4 Events:**
- `purchase` (standard GA4 ecommerce event)
- `booking_completed` (custom event)
- `vip_purchase` (if customer is VIP)
- `customer_became_vip` (if customer just became VIP)

---

### 6. Payment Failed (`payment_failed`)

**When it fires:**
- Payment transaction fails

**Location:**
- `src/pages/Checkout.jsx` - `handlePaymentFailure()` function

**Event Data:**
```javascript
{
  currency: 'INR',
  value: amount,
  error_message: error.message,
  error_code: error.code
}
```

**GA4 Events:**
- `payment_failed` (custom event)

---

## VIP Customer Tracking System

### Overview

The VIP tracking system identifies and tracks high-value customers based on:
- **Booking Count**: 3+ bookings
- **Total Spend**: ₹5000+ 

### VIP Criteria

A customer becomes VIP if they meet **either** criteria:
- 3 or more bookings, OR
- Total spend of ₹5000 or more

### VIP Tiers

- **Standard VIP**: Total spend ₹5000 - ₹9999
- **Premium VIP**: Total spend ₹10000+

### Implementation

**Location:** `src/lib/analytics.js`

**Storage:**
- Data stored in `localStorage` under key: `minuteserv_vip_customers`
- Format: `{ phoneKey: { phone, bookingCount, totalSpent, isVIP, ... } }`

**Functions:**
- `trackVIPCustomer(phone, bookingValue)` - Updates VIP status after purchase
- `getVIPStatus(phone)` - Gets VIP status for a customer
- `isVIPCustomer(phone)` - Checks if customer is VIP
- `getAllVIPCustomers()` - Gets all VIP customers (for admin)

**Events Tracked:**
- `customer_became_vip` - When customer first becomes VIP
- `vip_purchase` - Every purchase by a VIP customer

**User Properties Set:**
- `is_vip: true`
- `vip_tier: 'standard' | 'premium'`

---

## Analytics Utility File

**Location:** `src/lib/analytics.js`

### Functions Available

1. `trackServiceViewed(service)` - Track service view
2. `trackAddToCart(service, quantity)` - Track add to cart
3. `trackBeginCheckout(cart, totalValue)` - Track checkout start
4. `trackAddPaymentInfo(paymentMethod, totalValue)` - Track payment info
5. `trackPurchase(bookingData)` - Track completed booking
6. `trackPaymentFailed(error, amount)` - Track payment failure
7. `getVIPStatus(customerPhone)` - Get VIP status
8. `isVIPCustomer(customerPhone)` - Check if VIP
9. `getAllVIPCustomers()` - Get all VIP customers

### Usage Example

```javascript
import { trackServiceViewed, trackAddToCart } from '../lib/analytics';

// Track service view
trackServiceViewed(service);

// Track add to cart
trackAddToCart(service, 1);
```

---

## Key Metrics to Track

### Conversion Funnel Metrics

1. **Service View Rate**: `service_viewed` events
2. **Add to Cart Rate**: `add_to_cart` / `service_viewed`
3. **Checkout Start Rate**: `begin_checkout` / `add_to_cart`
4. **Payment Info Rate**: `add_payment_info` / `begin_checkout`
5. **Conversion Rate**: `purchase` / `service_viewed`
6. **Cart Abandonment Rate**: (`add_to_cart` - `purchase`) / `add_to_cart`
7. **Checkout Completion Rate**: `purchase` / `begin_checkout`

### Business Metrics

- **Total Bookings**: Count of `purchase` events
- **Total Revenue**: Sum of `value` in `purchase` events
- **Average Order Value**: Total Revenue / Total Bookings
- **Payment Success Rate**: `purchase` / (`purchase` + `payment_failed`)
- **VIP Customer Count**: Count of unique VIP customers
- **VIP Revenue**: Sum of `vip_purchase` event values

---

## Testing

### How to Test Events

1. **Open Browser Console** (F12)
2. **Navigate through the booking flow:**
   - View a service → Check console for `view_item` event
   - Add to cart → Check console for `add_to_cart` event
   - Go to checkout → Check console for `begin_checkout` event
   - Select payment method → Check console for `add_payment_info` event
   - Complete booking → Check console for `purchase` event

3. **Verify in GA4:**
   - Go to GA4 Dashboard → Reports → Realtime
   - Check "Events by Event name" section
   - Events should appear within 30 seconds

### Testing VIP Tracking

1. Complete 3 bookings with the same phone number
2. Check `localStorage.getItem('minuteserv_vip_customers')`
3. Verify VIP status is set to `true`
4. Check GA4 for `customer_became_vip` event

---

## Files Modified

1. `src/lib/analytics.js` - **NEW** - Analytics utility functions
2. `src/pages/ServiceDetail.jsx` - Added service_viewed and add_to_cart tracking
3. `src/components/ServiceCard.jsx` - Added add_to_cart tracking
4. `src/pages/Checkout.jsx` - Added begin_checkout, add_payment_info, purchase, payment_failed tracking
5. `index.html` - Added GA4 tracking script (already done)

---

## Future Enhancements

### Recommended Additional Events

1. **Search Events**: Track service searches
2. **Filter Events**: Track category/tier filters
3. **Promo Code Events**: Track promo code usage
4. **User Registration**: Track sign-ups
5. **Login Events**: Track user logins
6. **Cart Removal**: Track items removed from cart
7. **Page View Events**: Track all page views
8. **Error Events**: Track API errors, form validation errors

### Recommended Reports

1. **Conversion Funnel Report**: Visualize drop-off at each step
2. **Service Performance Report**: Top services by views, bookings
3. **VIP Customer Report**: VIP customer behavior and revenue
4. **Payment Method Report**: Cash vs Online payment preferences
5. **Geographic Report**: Bookings by location

---

## Support

For questions or issues with analytics tracking:
1. Check browser console for errors
2. Verify GA4 Measurement ID is correct
3. Check Network tab for GA4 requests
4. Verify events in GA4 Realtime report

---

## Changelog

### v1.0.0 (December 2024)
- Initial implementation of complete booking funnel tracking
- VIP customer tracking system
- Payment failure tracking
- All standard GA4 ecommerce events implemented

