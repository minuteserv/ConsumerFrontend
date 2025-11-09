# 🔗 Backend-Frontend Integration Guide
## Minuteserv - Complete Implementation Documentation

**Status:** ✅ Implementation in Progress  
**Engineer:** Google Engineering Standards  
**Last Updated:** Current

---

## 📋 Quick Start

### Prerequisites
- ✅ Backend running on `http://localhost:3000`
- ✅ Frontend running on `http://localhost:5173`
- ✅ Supabase configured
- ✅ Database tables created and seeded

### Setup
1. **Install dependencies** (if not already done):
   ```bash
   cd /Users/user/Desktop/MinServe
   npm install
   ```

2. **Configure environment** (optional):
   ```bash
   # Create .env file in frontend root
   VITE_API_BASE_URL=http://localhost:3000/api/v1
   ```

3. **Start backend** (if not running):
   ```bash
   cd minuteservbackend
   npm run dev
   ```

4. **Start frontend**:
   ```bash
   npm run dev
   ```

---

## 🏗️ Architecture Overview

### API Client Structure
```
src/lib/
├── apiClient.js          # Centralized API client (NEW)
├── constants.js           # API endpoints & config (UPDATED)
├── api.js                # Booking & Contact APIs (TO UPDATE)
├── otp.js                # OTP service (TO UPDATE)
└── payment.js            # Payment service (TO UPDATE)
```

### Integration Flow
```
Component → API Function → apiClient → Backend API → Response → Component State Update
```

---

## 📦 Implementation Status

### ✅ Part 1: API Client Setup (COMPLETED)
- [x] Created `src/lib/apiClient.js` - Centralized API client
- [x] Added request/response interceptors
- [x] Added token management (get, store, clear)
- [x] Added token refresh logic
- [x] Added error handling
- [x] Added request timeout
- [x] Updated `src/lib/constants.js` with all endpoints

**Files Created/Modified:**
- ✅ `src/lib/apiClient.js` (NEW)
- ✅ `src/lib/constants.js` (UPDATED)

---

### 🔄 Part 2: Authentication Integration (IN PROGRESS)
- [ ] Update `src/lib/otp.js` to use backend APIs
- [ ] Update `src/contexts/AuthContext.jsx` to store JWT tokens
- [ ] Update `src/components/LoginModal.jsx` to handle tokens

**Next Steps:**
1. Update OTP service to call backend
2. Store tokens in AuthContext
3. Add token to API requests automatically

---

### ⏳ Part 3: Services & Booking Integration (PENDING)
- [ ] Create service fetching function
- [ ] Update checkout flow
- [ ] Update booking creation

---

### ⏳ Part 4: Payment Integration (PENDING)
- [ ] Update Razorpay order creation
- [ ] Update payment verification

---

### ⏳ Part 5: Contact Form Integration (PENDING)
- [ ] Update contact API

---

### ⏳ Part 6: Dashboard Integration (PENDING)
- [ ] Create dashboard APIs
- [ ] Create bookings page

---

### ⏳ Part 7: Error Handling & UX (PENDING)
- [ ] Add error boundaries
- [ ] Add toast notifications
- [ ] Add loading states

---

## 🔧 API Client Usage

### Basic Usage
```javascript
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/constants';

// GET request
const services = await apiClient.get(API_ENDPOINTS.services);

// POST request
const booking = await apiClient.post(API_ENDPOINTS.bookings, {
  service_id: '123',
  date: '2024-01-01',
  time: '10:00'
});

// With error handling
try {
  const data = await apiClient.get(API_ENDPOINTS.dashboard);
  console.log('Dashboard data:', data);
} catch (error) {
  console.error('Error:', error.message);
  // Handle error
}
```

### Token Management
```javascript
import { getAccessToken, storeTokens, clearTokens } from '@/lib/apiClient';

// Store tokens after login
storeTokens(accessToken, refreshToken);

// Get current token
const token = getAccessToken();

// Clear tokens (logout)
clearTokens();
```

### Automatic Token Refresh
The API client automatically handles token refresh:
- If a request returns 401, it tries to refresh the token
- If refresh succeeds, it retries the original request
- If refresh fails, it clears tokens and triggers logout event

---

## 🔐 Authentication Flow

### Step 1: Send OTP
```javascript
// Frontend calls
POST /api/v1/auth/send-otp
Body: { phone_number: "+919876543210" }

// Response
{
  "success": true,
  "message": "OTP sent successfully",
  "expires_in": 300
}
```

### Step 2: Verify OTP
```javascript
// Frontend calls
POST /api/v1/auth/verify-otp
Body: { 
  phone_number: "+919876543210",
  otp_code: "123456"
}

// Response
{
  "success": true,
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "phone_number": "+919876543210",
    "name": "John Doe"
  }
}
```

### Step 3: Store Tokens
```javascript
// After successful OTP verification
storeTokens(response.access_token, response.refresh_token);
// Token is automatically added to all subsequent requests
```

---

## 📡 API Endpoints Reference

### Authentication
- `POST /api/v1/auth/send-otp` - Send OTP
- `POST /api/v1/auth/verify-otp` - Verify OTP
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Services
- `GET /api/v1/services` - Get all services
- `GET /api/v1/services/:id` - Get service details

### Checkout & Booking
- `POST /api/v1/checkout/prepare` - Prepare checkout (pricing, time slots)
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - Get user bookings
- `GET /api/v1/bookings/:id` - Get booking details
- `POST /api/v1/bookings/:id/cancel` - Cancel booking

### Payment
- `POST /api/v1/payments/verify` - Verify Razorpay payment

### Contact
- `POST /api/v1/contact` - Submit contact form

### Dashboard
- `GET /api/v1/dashboard` - Get user dashboard data

---

## ⚠️ Error Handling

### Error Types
1. **Network Errors** - No connection, timeout
2. **401 Unauthorized** - Token expired/invalid
3. **403 Forbidden** - Insufficient permissions
4. **404 Not Found** - Resource doesn't exist
5. **422 Validation Error** - Invalid input data
6. **500 Server Error** - Backend error

### Error Handling Example
```javascript
try {
  const response = await apiClient.post(API_ENDPOINTS.bookings, bookingData);
  // Success
} catch (error) {
  if (error.status === 401) {
    // Token expired - will auto-refresh
    console.log('Session expired, refreshing...');
  } else if (error.status === 422) {
    // Validation error
    console.error('Validation error:', error.data.errors);
  } else {
    // Other error
    console.error('Error:', error.message);
  }
}
```

---

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] Send OTP button works
- [ ] OTP is received (check backend console)
- [ ] OTP verification works
- [ ] Tokens are stored
- [ ] Tokens are sent in API requests
- [ ] Token refresh works
- [ ] Logout clears tokens

#### Services
- [ ] Services page loads services from backend
- [ ] Service details page works
- [ ] Filtering works

#### Booking
- [ ] Checkout prepare works
- [ ] Booking creation works
- [ ] Booking confirmation shows

#### Payment
- [ ] Razorpay order creation works
- [ ] Payment verification works
- [ ] Booking status updates after payment

---

## 🚀 Deployment

### Environment Variables
```env
# Frontend .env
VITE_API_BASE_URL=https://api.minuteserv.com/api/v1
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

### Production Checklist
- [ ] Update API_BASE_URL to production URL
- [ ] Configure CORS on backend
- [ ] Use Razorpay live keys
- [ ] Enable error tracking
- [ ] Test all API endpoints
- [ ] Verify token refresh works
- [ ] Test error handling

---

## 📝 Migration Guide

### From Mock APIs to Backend APIs

#### Step 1: Update OTP Service
```javascript
// OLD (mock)
import { sendOTP } from '@/lib/otp';

// NEW (backend)
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/constants';

const response = await apiClient.post(API_ENDPOINTS.sendOTP, {
  phone_number: phoneNumber
});
```

#### Step 2: Update Booking API
```javascript
// OLD (mock)
import { bookingAPI } from '@/lib/api';

// NEW (backend)
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/constants';

const response = await apiClient.post(API_ENDPOINTS.bookings, bookingData);
```

---

## 🔍 Debugging

### Check API Requests
```javascript
// Add to apiClient.js for debugging
console.log('API Request:', method, url, data);
console.log('API Response:', response);
```

### Check Tokens
```javascript
// In browser console
localStorage.getItem('minuteserv_auth');
// Should show: { access_token, refresh_token, timestamp }
```

### Check Network Tab
- Open DevTools → Network tab
- Filter by "Fetch/XHR"
- Check request headers (Authorization)
- Check response status and data

---

## 📚 Additional Resources

- **Backend API Docs:** `/minuteservbackend/README.md`
- **Integration Plan:** `/BACKEND_INTEGRATION_PLAN.md`
- **Backend Endpoints:** Check `minuteservbackend/server.js`

---

## ✅ Implementation Progress

- [x] **Part 1:** API Client Setup
- [ ] **Part 2:** Authentication Integration
- [ ] **Part 3:** Services & Booking Integration
- [ ] **Part 4:** Payment Integration
- [ ] **Part 5:** Contact Form Integration
- [ ] **Part 6:** Dashboard Integration
- [ ] **Part 7:** Error Handling & UX

**Current Status:** Part 1 Complete, Part 2 In Progress

---

## 🎯 Next Steps

1. ✅ Complete Part 1 (API Client)
2. 🔄 Complete Part 2 (Authentication)
3. ⏳ Complete Part 3 (Services & Booking)
4. ⏳ Complete Part 4 (Payment)
5. ⏳ Complete Part 5 (Contact)
6. ⏳ Complete Part 6 (Dashboard)
7. ⏳ Complete Part 7 (Error Handling)

---

**Last Updated:** Current  
**Status:** Implementation in Progress  
**Engineer:** Google Engineering Standards

