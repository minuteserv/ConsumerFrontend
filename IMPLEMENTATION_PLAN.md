# Minuteserv Backend - Complete Implementation Plan

**Responsibility:** 100% Production-Ready Implementation  
**Stack:** Supabase (PostgreSQL) + Node.js + Express  
**Developer:** Solo  
**Timeline:** 4-6 weeks (part-time)

---

## 📋 Table of Contents

1. [Pre-Implementation Setup](#pre-implementation-setup)
2. [Phase 1: Foundation & Authentication (Week 1)](#phase-1-foundation--authentication-week-1)
3. [Phase 2: Core Services & Database (Week 1-2)](#phase-2-core-services--database-week-1-2)
4. [Phase 3: Checkout & Booking System (Week 2-3)](#phase-3-checkout--booking-system-week-2-3)
5. [Phase 4: Payment Integration (Week 3-4)](#phase-4-payment-integration-week-3-4)
6. [Phase 5: Partner Assignment (Week 4)](#phase-5-partner-assignment-week-4)
7. [Phase 6: Admin Panel APIs (Week 5)](#phase-6-admin-panel-apis-week-5)
8. [Phase 7: Testing & Production Ready (Week 6)](#phase-7-testing--production-ready-week-6)
9. [Deployment Checklist](#deployment-checklist)
10. [Post-Launch Maintenance](#post-launch-maintenance)

---

## Pre-Implementation Setup

### ✅ Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] Razorpay account created (test mode)
- [ ] Code editor (VS Code recommended)
- [ ] Git repository initialized
- [ ] Postman/Insomnia for API testing

### 📦 Initial Project Setup

```bash
# Create backend directory
mkdir minuteserv-backend
cd minuteserv-backend

# Initialize project
npm init -y

# Install core dependencies
npm install express cors dotenv jsonwebtoken bcryptjs express-rate-limit
npm install @supabase/supabase-js razorpay
npm install --save-dev nodemon

# Create folder structure
mkdir -p src/{routes,controllers,services,middleware,utils,config}
mkdir -p src/{routes,controllers,services,middleware,utils,config}/admin
```

### 🔐 Environment Setup

Create `.env` file:
```env
# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# JWT
JWT_SECRET=generate-strong-random-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your-secret-key
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# OTP Service (MSG91 or Twilio)
OTP_API_KEY=your-otp-api-key
OTP_SENDER_ID=MINUTESERV

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 📝 package.json Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "lint": "eslint src/"
  }
}
```

---

## Phase 1: Foundation & Authentication (Week 1)

### 🎯 Goal
Set up project structure, database, and complete authentication system.

### 📝 Tasks

#### Day 1-2: Project Foundation

**1.1 Server Setup**
- [ ] Create `server.js` with Express
- [ ] Configure middleware (CORS, JSON, rate limiting)
- [ ] Setup error handling middleware
- [ ] Create basic health check endpoint

**1.2 Supabase Connection**
- [ ] Create `src/config/supabase.js`
- [ ] Test database connection
- [ ] Setup connection pooling

**1.3 Database Schema Creation**
- [ ] Create all 10 tables in Supabase SQL Editor
- [ ] Add indexes
- [ ] Setup Row Level Security (RLS) policies
- [ ] Test table creation

**Files to Create:**
```
src/config/supabase.js
src/config/database.js
server.js
```

#### Day 3-4: Authentication System

**1.4 OTP Service Integration**
- [ ] Create `src/services/otpService.js`
- [ ] Integrate MSG91 or Twilio
- [ ] Implement OTP generation (6-digit random)
- [ ] Implement OTP storage in database
- [ ] Add expiration logic (5 minutes)
- [ ] Add rate limiting (3 per hour per phone)

**1.5 JWT Authentication**
- [ ] Create `src/middleware/auth.js`
- [ ] Implement JWT token generation
- [ ] Implement token refresh logic
- [ ] Create token verification middleware

**1.6 Auth Controllers & Routes**
- [ ] Create `src/controllers/authController.js`
- [ ] Create `src/routes/auth.js`
- [ ] Implement `POST /auth/send-otp`
- [ ] Implement `POST /auth/verify-otp`
- [ ] Implement `POST /auth/refresh-token`
- [ ] Implement `POST /auth/logout`
- [ ] Implement `GET /auth/me`

**Files to Create:**
```
src/services/otpService.js
src/middleware/auth.js
src/controllers/authController.js
src/routes/auth.js
src/utils/jwt.js
```

**1.7 Testing Authentication**
- [ ] Test OTP sending
- [ ] Test OTP verification
- [ ] Test token generation
- [ ] Test token refresh
- [ ] Test protected routes

**Test Cases:**
```javascript
// Test 1: Send OTP
POST /api/v1/auth/send-otp
Body: { "phone_number": "+911234567890" }
Expected: OTP sent, stored in database

// Test 2: Verify OTP
POST /api/v1/auth/verify-otp
Body: { "phone_number": "+911234567890", "otp_code": "123456" }
Expected: JWT token returned, user created/updated

// Test 3: Get Current User
GET /api/v1/auth/me
Headers: { "Authorization": "Bearer <token>" }
Expected: User data returned
```

### ✅ Phase 1 Completion Checklist

- [ ] Server running on port 3000
- [ ] Database connection working
- [ ] All tables created
- [ ] OTP sending working
- [ ] OTP verification working
- [ ] JWT tokens generated
- [ ] Protected routes working
- [ ] All tests passing

---

## Phase 2: Core Services & Database (Week 1-2)

### 🎯 Goal
Set up services catalog, user addresses, and basic CRUD operations.

### 📝 Tasks

#### Day 5-6: Services Management

**2.1 Services Controller**
- [ ] Create `src/controllers/serviceController.js`
- [ ] Create `src/routes/services.js`
- [ ] Implement `GET /services/catalog`
- [ ] Add caching logic (in-memory or Redis)
- [ ] Implement service filtering by category/tier

**2.2 Services Data Seeding**
- [ ] Create `src/utils/seedServices.js`
- [ ] Import services from JSON data
- [ ] Run seed script to populate database

**Files to Create:**
```
src/controllers/serviceController.js
src/routes/services.js
src/utils/seedServices.js
```

#### Day 7-8: User Address Management

**2.3 Address Controller**
- [ ] Create `src/controllers/addressController.js`
- [ ] Create `src/routes/addresses.js`
- [ ] Implement `GET /addresses`
- [ ] Implement `POST /addresses`
- [ ] Implement `PUT /addresses/:id`
- [ ] Implement `DELETE /addresses/:id`
- [ ] Implement `PATCH /addresses/:id/set-default`
- [ ] Add validation (all fields required except address_line2)

**2.4 Dashboard Endpoint**
- [ ] Create `src/controllers/dashboardController.js`
- [ ] Implement `GET /dashboard`
- [ ] Combine: user data + addresses + recent bookings
- [ ] Add caching (5 minutes)

**Files to Create:**
```
src/controllers/addressController.js
src/routes/addresses.js
src/controllers/dashboardController.js
src/routes/dashboard.js
src/utils/validation.js
```

**2.5 Testing**
- [ ] Test service catalog endpoint
- [ ] Test address CRUD operations
- [ ] Test dashboard endpoint
- [ ] Test data validation

**Test Cases:**
```javascript
// Test 1: Get Services Catalog
GET /api/v1/services/catalog
Expected: All services grouped by category

// Test 2: Create Address
POST /api/v1/addresses
Body: { "name": "Home", "address_line1": "123 Main St", ... }
Headers: { "Authorization": "Bearer <token>" }
Expected: Address created with user_id

// Test 3: Get Dashboard
GET /api/v1/dashboard
Headers: { "Authorization": "Bearer <token>" }
Expected: User + addresses + bookings
```

### ✅ Phase 2 Completion Checklist

- [ ] Services catalog endpoint working
- [ ] Services data seeded
- [ ] Address CRUD operations working
- [ ] Dashboard endpoint returning combined data
- [ ] All validations working
- [ ] Tests passing

---

## Phase 3: Checkout & Booking System (Week 2-3)

### 🎯 Goal
Implement complete checkout flow and booking creation.

### 📝 Tasks

#### Day 9-10: Checkout Preparation

**3.1 Promo Code Service**
- [ ] Create `src/services/promoService.js`
- [ ] Implement promo code validation
- [ ] Calculate discount (percentage/fixed)
- [ ] Check usage limits
- [ ] Check validity dates

**3.2 Checkout Controller - Prepare**
- [ ] Create `src/controllers/checkoutController.js`
- [ ] Implement `POST /checkout/prepare`
- [ ] Fetch services from database
- [ ] Calculate pricing (subtotal, savings, discount, tax, total)
- [ ] Validate promo code
- [ ] Generate time slots for selected date
- [ ] Return preview data (2 min TTL)

**Files to Create:**
```
src/services/promoService.js
src/controllers/checkoutController.js
src/routes/checkout.js
src/utils/pricing.js
src/utils/timeSlots.js
```

**3.3 Pricing Calculation Logic**
```javascript
// src/utils/pricing.js
function calculatePricing(services, promoCode) {
  // 1. Calculate subtotal from services
  // 2. Calculate savings (market_price - product_cost)
  // 3. Apply promo discount
  // 4. Calculate tax (18% GST)
  // 5. Calculate grand total
  // Return all values
}
```

#### Day 11-12: Booking Creation

**3.4 Booking Controller - Confirm**
- [ ] Implement `POST /checkout/confirm`
- [ ] Validate preview data
- [ ] Validate address
- [ ] Generate booking number
- [ ] Create booking record
- [ ] Store services as JSON
- [ ] Handle payment method (cash vs online)
- [ ] Return booking data

**3.5 Booking Service**
- [ ] Create `src/services/bookingService.js`
- [ ] Implement booking number generation
- [ ] Implement booking validation
- [ ] Handle booking status updates

**3.6 Booking Routes**
- [ ] Create `src/routes/bookings.js`
- [ ] Implement `GET /bookings`
- [ ] Implement `GET /bookings/:id`
- [ ] Implement `POST /bookings/:id/cancel`
- [ ] Add filtering (status, date range)
- [ ] Add pagination

**Files to Create:**
```
src/services/bookingService.js
src/controllers/bookingController.js
src/routes/bookings.js
src/utils/bookingNumber.js
```

**3.7 Booking Validation**
- [ ] Validate booking date (not in past)
- [ ] Validate booking time (within working hours)
- [ ] Validate services exist
- [ ] Validate address belongs to user
- [ ] Validate customer details

#### Day 13-14: Testing Checkout Flow

**3.8 Complete Flow Testing**
- [ ] Test checkout prepare endpoint
- [ ] Test checkout confirm (cash payment)
- [ ] Test checkout confirm (online payment - without Razorpay)
- [ ] Test booking retrieval
- [ ] Test booking cancellation
- [ ] Test error handling

**Test Cases:**
```javascript
// Test 1: Prepare Checkout
POST /api/v1/checkout/prepare
Body: {
  "service_ids": ["uuid1", "uuid2"],
  "promo_code": "SAVE10"
}
Expected: Pricing calculated, preview_id returned

// Test 2: Confirm Booking (Cash)
POST /api/v1/checkout/confirm
Body: {
  "preview_id": "preview_xxx",
  "payment_method": "cash",
  "address_id": "uuid",
  "booking_date": "2024-02-01",
  "booking_time": "10:00 AM",
  "customer_name": "John Doe",
  "customer_phone": "+911234567890"
}
Expected: Booking created, status: pending

// Test 3: Get Bookings
GET /api/v1/bookings?status=pending
Expected: List of user's bookings
```

### ✅ Phase 3 Completion Checklist

- [ ] Checkout prepare endpoint working
- [ ] Pricing calculation accurate
- [ ] Promo code validation working
- [ ] Booking creation working (cash payment)
- [ ] Booking retrieval working
- [ ] Booking cancellation working
- [ ] All validations in place
- [ ] Error handling complete

---

## Phase 4: Payment Integration (Week 3-4)

### 🎯 Goal
Complete Razorpay integration with webhook handling and payment verification.

### 📝 Tasks

#### Day 15-16: Razorpay Setup

**4.1 Razorpay Service**
- [ ] Create `src/services/razorpayService.js`
- [ ] Initialize Razorpay client
- [ ] Implement order creation
- [ ] Implement payment verification
- [ ] Implement signature verification

**4.2 Payment Controller**
- [ ] Create `src/controllers/paymentController.js`
- [ ] Create `src/routes/payments.js`
- [ ] Update checkout confirm to create Razorpay order
- [ ] Implement `POST /payments/verify`
- [ ] Handle payment success/failure

**Files to Create:**
```
src/services/razorpayService.js
src/controllers/paymentController.js
src/routes/payments.js
src/utils/paymentValidation.js
```

**4.3 Payment Integration in Checkout**
- [ ] Update `checkoutController.js` confirm method
- [ ] Create Razorpay order when payment_method = "online"
- [ ] Store order_id in payments table
- [ ] Return order data to frontend
- [ ] Handle errors gracefully

**Code Implementation:**
```javascript
// In checkoutController.js confirm method
if (paymentMethod === 'online') {
  // Create Razorpay order
  const order = await razorpay.orders.create({
    amount: grandTotal * 100, // in paise
    currency: 'INR',
    receipt: bookingNumber,
    notes: {
      booking_id: booking.id,
      booking_number: bookingNumber
    }
  });

  // Store in payments table
  await supabase.from('payments').insert({
    booking_id: booking.id,
    razorpay_order_id: order.id,
    amount: grandTotal,
    status: 'pending'
  });

  // Update booking with order_id
  await supabase
    .from('bookings')
    .update({ razorpay_order_id: order.id })
    .eq('id', booking.id);

  return {
    booking: bookingData,
    payment: {
      order_id: order.id,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID
    }
  };
}
```

#### Day 17-18: Payment Webhook

**4.4 Webhook Handler**
- [ ] Implement `POST /payments/webhook`
- [ ] Verify Razorpay signature
- [ ] Handle idempotency (prevent duplicate processing)
- [ ] Process payment.captured event
- [ ] Process payment.failed event
- [ ] Update booking status
- [ ] Update payment status
- [ ] Trigger partner assignment (if payment successful)

**4.5 Webhook Security**
- [ ] Verify webhook signature
- [ ] Validate webhook payload
- [ ] Check for duplicate webhooks
- [ ] Log all webhook events

**Code Implementation:**
```javascript
// src/controllers/paymentController.js
exports.handleWebhook = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const payload = JSON.stringify(req.body);

  // Verify signature
  const isValid = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex') === signature;

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const event = req.body.event;
  const paymentData = req.body.payload.payment.entity;

  // Check if already processed (idempotency)
  const { data: existing } = await supabase
    .from('payments')
    .select('*')
    .eq('razorpay_payment_id', paymentData.id)
    .single();

  if (existing && existing.status === 'success') {
    return res.json({ success: true, message: 'Already processed' });
  }

  // Process event
  if (event === 'payment.captured') {
    // Update payment status
    await supabase
      .from('payments')
      .update({
        status: 'success',
        razorpay_payment_id: paymentData.id,
        payment_method: paymentData.method
      })
      .eq('razorpay_order_id', paymentData.order_id);

    // Update booking status
    const { data: payment } = await supabase
      .from('payments')
      .select('booking_id')
      .eq('razorpay_order_id', paymentData.order_id)
      .single();

    await supabase
      .from('bookings')
      .update({
        payment_status: 'paid',
        status: 'pending', // Ready for partner assignment
        razorpay_payment_id: paymentData.id
      })
      .eq('id', payment.booking_id);

    // Trigger partner assignment
    await assignPartner(payment.booking_id);
  } else if (event === 'payment.failed') {
    // Handle payment failure
    await supabase
      .from('payments')
      .update({
        status: 'failed',
        failure_reason: paymentData.error_description
      })
      .eq('razorpay_order_id', paymentData.order_id);
  }

  res.json({ success: true });
};
```

#### Day 19-20: Payment Verification

**4.6 Payment Verification Endpoint**
- [ ] Implement `POST /payments/verify`
- [ ] Verify Razorpay signature
- [ ] Check payment status with Razorpay API
- [ ] Update local payment record
- [ ] Update booking status
- [ ] Return verification result

**4.7 Payment Status Endpoint**
- [ ] Implement `GET /payments/:id/status`
- [ ] Return payment details
- [ ] Return booking status
- [ ] Handle pending payments

**4.8 Testing Payment Flow**

**Complete Payment Flow Test:**
```javascript
// Test 1: Create Booking with Online Payment
POST /api/v1/checkout/confirm
Body: { "payment_method": "online", ... }
Expected: Booking created + Razorpay order returned

// Test 2: Simulate Webhook (payment.captured)
POST /api/v1/payments/webhook
Headers: { "x-razorpay-signature": "..." }
Body: { Razorpay webhook payload }
Expected: Payment status updated, booking status updated

// Test 3: Verify Payment (manual verification)
POST /api/v1/payments/verify
Body: {
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature"
}
Expected: Payment verified, status updated
```

**4.9 Error Handling**
- [ ] Handle Razorpay API errors
- [ ] Handle webhook failures
- [ ] Handle payment timeouts
- [ ] Implement retry logic for webhooks
- [ ] Log all payment errors

### ✅ Phase 4 Completion Checklist

- [ ] Razorpay order creation working
- [ ] Payment webhook handler working
- [ ] Signature verification working
- [ ] Payment verification endpoint working
- [ ] Booking status updates on payment
- [ ] Error handling complete
- [ ] All payment flows tested
- [ ] Webhook idempotency working

---

## Phase 5: Partner Assignment (Week 4)

### 🎯 Goal
Implement partner assignment system for bookings.

### 📝 Tasks

#### Day 21-22: Partner Assignment Logic

**5.1 Partner Service**
- [ ] Create `src/services/partnerService.js`
- [ ] Implement partner search (by category, availability)
- [ ] Implement partner scoring algorithm
- [ ] Implement partner assignment

**5.2 Partner Assignment Algorithm**
```javascript
// src/services/partnerService.js
async function assignPartner(bookingId) {
  // 1. Get booking details
  const booking = await getBooking(bookingId);
  
  // 2. Extract service categories
  const categories = extractCategories(booking.services);
  
  // 3. Find available partners
  const partners = await findAvailablePartners({
    categories,
    bookingDate: booking.booking_date,
    bookingTime: booking.booking_time,
    addressLat: booking.address.lat,
    addressLng: booking.address.lng
  });
  
  // 4. Score partners
  const scoredPartners = partners.map(p => ({
    ...p,
    score: calculateScore(p, booking)
  }));
  
  // 5. Sort by score
  scoredPartners.sort((a, b) => b.score - a.score);
  
  // 6. Assign top partner
  if (scoredPartners.length > 0) {
    await assignPartnerToBooking(bookingId, scoredPartners[0].id);
  } else {
    // Queue for manual assignment
    await queueForManualAssignment(bookingId);
  }
}

function calculateScore(partner, booking) {
  let score = 0;
  
  // Rating (0-50 points)
  score += partner.rating * 10;
  
  // Distance (0-30 points, closer = higher)
  const distance = calculateDistance(partner, booking.address);
  score += Math.max(0, 30 - (distance * 2));
  
  // Availability (0-20 points)
  score += partner.is_available ? 20 : 0;
  
  return score;
}
```

**5.3 Partner Assignment Endpoints**
- [ ] Create `src/controllers/partnerController.js`
- [ ] Implement auto-assignment (triggered on booking creation)
- [ ] Implement manual assignment endpoint
- [ ] Update booking status on assignment

**5.4 Partner Routes**
- [ ] Create `src/routes/partners.js`
- [ ] Implement `GET /partners` (for admin)
- [ ] Implement assignment endpoints

**Files to Create:**
```
src/services/partnerService.js
src/controllers/partnerController.js
src/routes/partners.js
src/utils/distance.js
```

#### Day 23-24: Partner Acceptance Flow

**5.5 Partner Acceptance**
- [ ] Implement partner notification (push/email)
- [ ] Implement partner acceptance endpoint
- [ ] Implement partner rejection endpoint
- [ ] Auto-reassign if rejected
- [ ] Update booking status

**5.6 Testing Partner Assignment**
- [ ] Test auto-assignment
- [ ] Test partner acceptance
- [ ] Test partner rejection
- [ ] Test auto-reassignment
- [ ] Test manual assignment

**Test Cases:**
```javascript
// Test 1: Auto-assign Partner
POST /api/v1/checkout/confirm (cash payment)
Expected: Booking created, partner assigned automatically

// Test 2: Partner Accepts
POST /api/v1/partners/bookings/:id/accept
Expected: Booking status: confirmed

// Test 3: Partner Rejects
POST /api/v1/partners/bookings/:id/reject
Expected: Next partner assigned automatically
```

### ✅ Phase 5 Completion Checklist

- [ ] Partner assignment algorithm working
- [ ] Auto-assignment on booking creation
- [ ] Partner acceptance flow working
- [ ] Partner rejection flow working
- [ ] Auto-reassignment working
- [ ] Manual assignment endpoint working
- [ ] All tests passing

---

## Phase 6: Admin Panel APIs (Week 5)

### 🎯 Goal
Implement admin APIs for managing bookings, partners, and services.

### 📝 Tasks

#### Day 25-26: Admin Authentication

**6.1 Admin Auth**
- [ ] Create `src/middleware/adminAuth.js`
- [ ] Create `src/controllers/adminAuthController.js`
- [ ] Implement `POST /admin/auth/login`
- [ ] Implement admin JWT tokens
- [ ] Add role-based access control

**6.2 Admin Routes Setup**
- [ ] Create `src/routes/admin/index.js`
- [ ] Create admin sub-routes
- [ ] Add admin authentication middleware

**Files to Create:**
```
src/middleware/adminAuth.js
src/controllers/adminAuthController.js
src/routes/admin/index.js
```

#### Day 27-28: Admin Booking Management

**6.3 Admin Booking Controller**
- [ ] Create `src/controllers/admin/bookingController.js`
- [ ] Implement `GET /admin/bookings`
- [ ] Implement `GET /admin/bookings/:id`
- [ ] Implement `PATCH /admin/bookings/:id/status`
- [ ] Implement `POST /admin/bookings/:id/assign-partner`
- [ ] Implement `POST /admin/bookings/:id/cancel`
- [ ] Add filtering and pagination

**6.4 Admin Booking Routes**
- [ ] Create `src/routes/admin/bookings.js`
- [ ] Wire up all endpoints
- [ ] Add validation

**Files to Create:**
```
src/controllers/admin/bookingController.js
src/routes/admin/bookings.js
```

#### Day 29-30: Admin Partner & Service Management

**6.5 Admin Partner Controller**
- [ ] Create `src/controllers/admin/partnerController.js`
- [ ] Implement `GET /admin/partners`
- [ ] Implement `GET /admin/partners/:id`
- [ ] Implement `POST /admin/partners`
- [ ] Implement `PATCH /admin/partners/:id`
- [ ] Implement partner earnings endpoint

**6.6 Admin Service Controller**
- [ ] Create `src/controllers/admin/serviceController.js`
- [ ] Implement `GET /admin/services`
- [ ] Implement `POST /admin/services`
- [ ] Implement `PUT /admin/services/:id`
- [ ] Implement `DELETE /admin/services/:id`

**6.7 Admin Dashboard**
- [ ] Create `src/controllers/admin/dashboardController.js`
- [ ] Implement `GET /admin/dashboard`
- [ ] Calculate stats (bookings, revenue, partners)
- [ ] Return recent bookings and alerts

**Files to Create:**
```
src/controllers/admin/partnerController.js
src/controllers/admin/serviceController.js
src/controllers/admin/dashboardController.js
src/routes/admin/partners.js
src/routes/admin/services.js
src/routes/admin/dashboard.js
```

#### Day 31-32: Admin Testing

**6.8 Testing Admin APIs**
- [ ] Test admin authentication
- [ ] Test booking management
- [ ] Test partner management
- [ ] Test service management
- [ ] Test dashboard

**Test Cases:**
```javascript
// Test 1: Admin Login
POST /api/v1/admin/auth/login
Body: { "email": "admin@minuteserv.com", "password": "..." }
Expected: Admin JWT token

// Test 2: Get All Bookings
GET /api/v1/admin/bookings?status=pending
Headers: { "Authorization": "Bearer <admin_token>" }
Expected: List of all bookings

// Test 3: Assign Partner
POST /api/v1/admin/bookings/:id/assign-partner
Body: { "partner_id": "uuid" }
Expected: Partner assigned to booking
```

### ✅ Phase 6 Completion Checklist

- [ ] Admin authentication working
- [ ] Admin booking management working
- [ ] Admin partner management working
- [ ] Admin service management working
- [ ] Admin dashboard working
- [ ] All admin endpoints tested

---

## Phase 7: Testing & Production Ready (Week 6)

### 🎯 Goal
Complete testing, error handling, and production deployment.

### 📝 Tasks

#### Day 33-34: Comprehensive Testing

**7.1 Integration Testing**
- [ ] Test complete booking flow (cash)
- [ ] Test complete booking flow (online)
- [ ] Test payment webhook flow
- [ ] Test partner assignment flow
- [ ] Test cancellation flow
- [ ] Test promo code flow

**7.2 Error Handling**
- [ ] Add try-catch to all controllers
- [ ] Implement error logging
- [ ] Create error response format
- [ ] Handle database errors
- [ ] Handle Razorpay API errors
- [ ] Handle validation errors

**7.3 Input Validation**
- [ ] Validate all request bodies
- [ ] Validate query parameters
- [ ] Validate route parameters
- [ ] Add sanitization
- [ ] Prevent SQL injection
- [ ] Prevent XSS attacks

**Files to Create:**
```
src/middleware/errorHandler.js
src/utils/validation.js
src/utils/logger.js
src/utils/response.js
```

#### Day 35-36: Security & Performance

**7.4 Security Hardening**
- [ ] Add rate limiting (per endpoint)
- [ ] Add CORS configuration
- [ ] Add helmet.js for security headers
- [ ] Validate JWT tokens properly
- [ ] Secure environment variables
- [ ] Add request logging

**7.5 Performance Optimization**
- [ ] Add database query optimization
- [ ] Add response caching
- [ ] Optimize API endpoints
- [ ] Add connection pooling
- [ ] Add request compression

**7.6 Documentation**
- [ ] Create API documentation (Swagger/Postman)
- [ ] Document all endpoints
- [ ] Document request/response formats
- [ ] Document error codes
- [ ] Create deployment guide

**Files to Create:**
```
src/middleware/rateLimiter.js
src/config/security.js
docs/API_DOCUMENTATION.md
docs/DEPLOYMENT.md
```

#### Day 37-38: Production Deployment

**7.7 Production Setup**
- [ ] Setup production environment variables
- [ ] Configure production database
- [ ] Setup Razorpay production keys
- [ ] Configure webhook URL
- [ ] Setup error monitoring (Sentry)
- [ ] Setup logging (Winston/Pino)

**7.8 Deployment**
- [ ] Choose hosting (Railway/Render/AWS)
- [ ] Setup CI/CD pipeline
- [ ] Configure domain
- [ ] Setup SSL certificate
- [ ] Configure environment variables
- [ ] Deploy application

**7.9 Post-Deployment**
- [ ] Test production endpoints
- [ ] Monitor error logs
- [ ] Monitor performance
- [ ] Setup backups
- [ ] Setup alerts

### ✅ Phase 7 Completion Checklist

- [ ] All integration tests passing
- [ ] Error handling complete
- [ ] Security measures in place
- [ ] Performance optimized
- [ ] API documentation complete
- [ ] Production deployment successful
- [ ] Monitoring setup
- [ ] Backups configured

---

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Supabase RLS policies configured
- [ ] Razorpay webhook URL configured
- [ ] Error monitoring setup
- [ ] Logging configured
- [ ] SSL certificate installed
- [ ] Domain configured

### Deployment Steps

1. **Database Setup**
   ```sql
   -- Run all table creation scripts
   -- Setup indexes
   -- Configure RLS policies
   ```

2. **Environment Configuration**
   ```env
   NODE_ENV=production
   PORT=3000
   SUPABASE_URL=...
   RAZORPAY_KEY_ID=... (production)
   ```

3. **Deploy Application**
   ```bash
   # Build application
   npm install --production
   
   # Start application
   npm start
   ```

4. **Verify Deployment**
   - [ ] Health check endpoint working
   - [ ] Authentication working
   - [ ] Booking creation working
   - [ ] Payment processing working
   - [ ] Webhook receiving requests

### Post-Deployment

- [ ] Monitor error logs
- [ ] Monitor payment success rate
- [ ] Monitor booking creation rate
- [ ] Setup automated backups
- [ ] Configure alerts

---

## Post-Launch Maintenance

### Daily Tasks

- [ ] Check error logs
- [ ] Monitor payment webhooks
- [ ] Check booking status
- [ ] Monitor partner assignments

### Weekly Tasks

- [ ] Review performance metrics
- [ ] Check database performance
- [ ] Review error trends
- [ ] Update dependencies

### Monthly Tasks

- [ ] Review and optimize queries
- [ ] Update security patches
- [ ] Review and update documentation
- [ ] Analyze usage patterns

---

## Critical Path Items (Must Have)

### Week 1-2: Foundation
1. ✅ Authentication system
2. ✅ Database setup
3. ✅ Services catalog

### Week 3: Core Features
4. ✅ Checkout flow
5. ✅ Booking creation
6. ✅ Payment integration (online)

### Week 4: Payment & Partners
7. ✅ Payment webhook
8. ✅ Partner assignment

### Week 5-6: Admin & Polish
9. ✅ Admin APIs
10. ✅ Testing & deployment

---

## Risk Mitigation

### High Priority Risks

1. **Payment Webhook Failures**
   - Solution: Implement retry logic, manual verification endpoint
   
2. **Partner Assignment Failures**
   - Solution: Queue for manual assignment, fallback logic
   
3. **Database Performance**
   - Solution: Add indexes, optimize queries, use connection pooling
   
4. **Security Vulnerabilities**
   - Solution: Regular security audits, dependency updates

---

## Success Metrics

### Technical Metrics
- API response time < 200ms
- Payment success rate > 99%
- Webhook processing < 1 second
- Zero security vulnerabilities

### Business Metrics
- Booking creation working
- Payment processing working
- Partner assignment working
- Admin management working

---

## Support & Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs)
- [Express.js Documentation](https://expressjs.com/)

### Tools
- Postman for API testing
- Supabase Dashboard for database management
- Razorpay Dashboard for payment monitoring

---

## Notes

- **Solo Developer Tips:**
  - Focus on one phase at a time
  - Test thoroughly before moving to next phase
  - Keep code simple and maintainable
  - Document as you go
  
- **When Stuck:**
  - Check Supabase logs
  - Check Razorpay dashboard
  - Review error logs
  - Test in isolation

---

**This implementation plan ensures 100% production-ready backend with complete payment and booking functionality.**

**Estimated Timeline:** 4-6 weeks (part-time) or 2-3 weeks (full-time)

**Next Step:** Start with Phase 1, Day 1 tasks.

