# Razorpay Payment Integration Guide

## Overview

This document outlines the professional payment integration approach for Minuteserv using Razorpay, following Amazon-level engineering standards.

## Architecture

### Flow Diagram

```
User clicks "Pay Online"
    ↓
Load Razorpay SDK (dynamically)
    ↓
Create Razorpay Order (Backend API)
    ↓
Initialize Razorpay Checkout
    ↓
User completes payment
    ↓
Payment Success Handler
    ↓
Verify Payment (Backend API)
    ↓
Create Booking
    ↓
Clear Cart & Redirect
```

## Components

### 1. Payment Service (`src/lib/payment.js`)

**Features:**
- Dynamic Razorpay SDK loading
- Order creation (with backend integration)
- Payment initialization
- Payment verification
- Error handling
- Singleton pattern for consistency

**Key Methods:**
- `loadRazorpaySDK()` - Dynamically loads Razorpay checkout.js
- `createRazorpayOrder()` - Creates order via backend API
- `initializePayment()` - Opens Razorpay checkout modal
- `verifyPayment()` - Verifies payment signature via backend

### 2. Checkout Integration (`src/pages/Checkout.jsx`)

**Payment Flow:**
1. User selects "Pay Online" payment method
2. On "Place Order" click, `handleRazorpayPayment()` is called
3. Razorpay modal opens with payment options
4. On success: Payment verified → Booking created → Cart cleared
5. On failure: Error modal with retry/fallback options

**States:**
- `isProcessingPayment` - Payment in progress
- `paymentInitiated` - Payment modal opened
- `showPaymentSuccessModal` - Success confirmation
- `showPaymentErrorModal` - Error handling

## Backend API Requirements

### Required Endpoints

#### 1. Create Razorpay Order
```
POST /api/razorpay/create-order

Request Body:
{
  "amount": 100000,  // Amount in paise
  "currency": "INR",
  "receipt": "REC-1234567890-ABC",
  "notes": {
    "order_id": "ORDER-1234567890",
    "customer_name": "John Doe",
    "customer_phone": "+919876543210"
  }
}

Response:
{
  "id": "order_abc123",
  "amount": 100000,
  "currency": "INR",
  "receipt": "REC-1234567890-ABC"
}
```

#### 2. Verify Payment
```
POST /api/razorpay/verify-payment

Request Body:
{
  "razorpay_payment_id": "pay_abc123",
  "razorpay_order_id": "order_abc123",
  "razorpay_signature": "signature_hash",
  "order_id": "ORDER-1234567890"
}

Response:
{
  "verified": true,
  "payment_id": "pay_abc123",
  "order_id": "ORDER-1234567890"
}
```

## Setup Instructions

### 1. Get Razorpay Credentials

1. Sign up at https://razorpay.com
2. Get your Key ID and Key Secret from Dashboard → Settings → API Keys
3. For testing, use Test Mode keys
4. For production, use Live Mode keys

### 2. Update Configuration

**File: `src/lib/constants.js`**
```javascript
export const RAZORPAY_CONFIG = {
  keyId: 'rzp_live_YOUR_KEY_ID', // Replace with your actual key
};
```

### 3. Backend Implementation

**Node.js/Express Example:**

```javascript
// Install: npm install razorpay

const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: req.body.amount,
      currency: req.body.currency,
      receipt: req.body.receipt,
      notes: req.body.notes,
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Payment
app.post('/api/razorpay/verify-payment', async (req, res) => {
  const crypto = require('crypto');
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  
  const text = `${razorpay_order_id}|${razorpay_payment_id}`;
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');
  
  if (generated_signature === razorpay_signature) {
    // Payment verified - create booking
    res.json({ verified: true, payment_id: razorpay_payment_id });
  } else {
    res.status(400).json({ verified: false, error: 'Invalid signature' });
  }
});
```

## Security Best Practices

1. **Never expose Key Secret** - Only Key ID on frontend
2. **Always verify payment** - Server-side signature verification is mandatory
3. **HTTPS Only** - Always use HTTPS in production
4. **Idempotency** - Use unique receipt IDs to prevent duplicate payments
5. **Error Logging** - Log all payment attempts for audit trail
6. **Webhook Integration** - Implement Razorpay webhooks for payment status updates

## Testing

### Test Cards (Test Mode)

- **Success:** `4111 1111 1111 1111`
- **Failure:** `4000 0000 0000 0002`
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **Name:** Any name

## Error Handling

The integration handles:
- SDK loading failures
- Payment initialization errors
- Payment failures
- Verification failures
- Network errors
- User cancellation

All errors show user-friendly modals with retry/fallback options.

## Production Checklist

- [ ] Replace test Razorpay key with live key
- [ ] Implement backend API endpoints
- [ ] Enable webhook for payment updates
- [ ] Set up payment logging/audit trail
- [ ] Test with actual payment methods
- [ ] Set up monitoring and alerts
- [ ] Implement rate limiting on payment endpoints
- [ ] Add fraud detection
- [ ] Enable payment analytics

## Support

For Razorpay issues:
- Documentation: https://razorpay.com/docs/
- Support: support@razorpay.com

For integration issues, check:
- Browser console for errors
- Network tab for API calls
- Backend logs for server-side errors

