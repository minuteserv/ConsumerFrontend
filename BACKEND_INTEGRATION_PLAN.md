# 🚀 Backend-Frontend Integration Plan
## Minuteserv - Complete API Integration Guide

**Status:** Ready for Implementation  
**Responsibility:** 100% - Google Engineering Standards  
**Backend URL:** `http://localhost:3000/api/v1`  
**Frontend URL:** `http://localhost:5173`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Integration Parts](#integration-parts)
4. [Implementation Steps](#implementation-steps)
5. [API Endpoints Mapping](#api-endpoints-mapping)
6. [Authentication Flow](#authentication-flow)
7. [Error Handling](#error-handling)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Considerations](#deployment-considerations)

---

## 🎯 Overview

### Current State
- ✅ Backend API running on `http://localhost:3000`
- ✅ Frontend React app running on `http://localhost:5173`
- ⚠️ Frontend using **mock APIs** (commented out)
- ⚠️ No authentication token management
- ⚠️ No centralized API client

### Target State
- ✅ All API calls connected to backend
- ✅ JWT token-based authentication
- ✅ Centralized API client with error handling
- ✅ Request/response interceptors
- ✅ Proper error handling and user feedback
- ✅ Loading states and optimistic updates

---

## 🏗️ Architecture

### API Client Architecture
```
Frontend Components
    ↓
API Client (centralized)
    ↓
Request Interceptors (add token, handle CORS)
    ↓
Backend API (http://localhost:3000/api/v1)
    ↓
Response Interceptors (handle errors, refresh tokens)
    ↓
Components (update UI)
```

### Data Flow
```
User Action → Component → API Client → Backend → Database
                ↓
         Update UI State
                ↓
         Show Success/Error
```

---

## 📦 Integration Parts

### **Part 1: API Client Setup** ⭐ Priority: HIGH
**Files to Create/Modify:**
- `src/lib/apiClient.js` (NEW) - Centralized API client
- `src/lib/constants.js` (MODIFY) - Update API endpoints
- `vite.config.js` (MODIFY) - Add proxy for development

**Tasks:**
- [ ] Create API client with axios/fetch wrapper
- [ ] Add request interceptors (auth token, headers)
- [ ] Add response interceptors (error handling, token refresh)
- [ ] Configure base URL from environment
- [ ] Add request timeout and retry logic

**Estimated Time:** 2-3 hours

---

### **Part 2: Authentication Integration** ⭐ Priority: HIGH
**Files to Create/Modify:**
- `src/lib/otp.js` (MODIFY) - Connect to backend OTP APIs
- `src/contexts/AuthContext.jsx` (MODIFY) - Store JWT tokens
- `src/lib/apiClient.js` (MODIFY) - Add token to requests

**Tasks:**
- [ ] Update `sendOTP()` to call `/api/v1/auth/send-otp`
- [ ] Update `verifyOTP()` to call `/api/v1/auth/verify-otp`
- [ ] Store JWT tokens (access + refresh) in AuthContext
- [ ] Add token refresh logic
- [ ] Update login flow to save tokens
- [ ] Add logout to clear tokens

**Estimated Time:** 3-4 hours

---

### **Part 3: Services & Booking Integration** ⭐ Priority: HIGH
**Files to Create/Modify:**
- `src/lib/api.js` (MODIFY) - Connect booking API
- `src/pages/Checkout.jsx` (MODIFY) - Use backend checkout
- `src/pages/Services.jsx` (MODIFY) - Fetch services from backend

**Tasks:**
- [ ] Create service to fetch all services from `/api/v1/services`
- [ ] Update booking API to use `/api/v1/checkout/prepare`
- [ ] Update checkout flow to create booking via `/api/v1/bookings`
- [ ] Handle booking confirmation response
- [ ] Update services page to use backend data

**Estimated Time:** 4-5 hours

---

### **Part 4: Payment Integration** ⭐ Priority: MEDIUM
**Files to Create/Modify:**
- `src/lib/payment.js` (MODIFY) - Connect Razorpay backend
- `src/pages/Checkout.jsx` (MODIFY) - Payment flow

**Tasks:**
- [ ] Update `createRazorpayOrder()` to call `/api/v1/checkout/prepare`
- [ ] Update `verifyPayment()` to call `/api/v1/payments/verify`
- [ ] Handle payment success/failure responses
- [ ] Update booking status after payment
- [ ] Add payment webhook handling (if needed)

**Estimated Time:** 3-4 hours

---

### **Part 5: Contact Form Integration** ⭐ Priority: LOW
**Files to Create/Modify:**
- `src/lib/api.js` (MODIFY) - Connect contact API

**Tasks:**
- [ ] Update `contactUsAPI()` to call `/api/v1/contact`
- [ ] Handle success/error responses
- [ ] Add form validation

**Estimated Time:** 1 hour

---

### **Part 6: Dashboard & User Data** ⭐ Priority: MEDIUM
**Files to Create/Modify:**
- `src/lib/api.js` (NEW methods) - User dashboard APIs
- `src/pages/Bookings.jsx` (NEW/MODIFY) - User bookings page

**Tasks:**
- [ ] Create API to fetch user dashboard: `/api/v1/dashboard`
- [ ] Create API to fetch user bookings: `/api/v1/bookings`
- [ ] Create API to cancel booking: `/api/v1/bookings/:id/cancel`
- [ ] Display bookings in user dashboard
- [ ] Add booking status management

**Estimated Time:** 3-4 hours

---

### **Part 7: Error Handling & UX** ⭐ Priority: MEDIUM
**Files to Create/Modify:**
- `src/lib/apiClient.js` (MODIFY) - Error handling
- `src/components/ErrorBoundary.jsx` (NEW) - Global error handling
- `src/components/Toast.jsx` (NEW/MODIFY) - User notifications

**Tasks:**
- [ ] Create error handling utility
- [ ] Add user-friendly error messages
- [ ] Add loading states for all API calls
- [ ] Add toast notifications for success/error
- [ ] Handle network errors gracefully
- [ ] Add retry logic for failed requests

**Estimated Time:** 2-3 hours

---

## 🔧 Implementation Steps

### Step 1: Setup API Client (Part 1)
1. Create `src/lib/apiClient.js` with:
   - Base URL configuration
   - Request/response interceptors
   - Token management
   - Error handling

2. Update `src/lib/constants.js`:
   - Add `API_BASE_URL` constant
   - Update all endpoint paths

3. Update `vite.config.js`:
   - Add proxy for `/api` routes (optional, for CORS)

### Step 2: Authentication (Part 2)
1. Update `src/lib/otp.js`:
   - Replace mock functions with real API calls
   - Handle JWT tokens in response

2. Update `src/contexts/AuthContext.jsx`:
   - Store access_token and refresh_token
   - Add token refresh logic
   - Add token expiration check

3. Update `src/components/LoginModal.jsx`:
   - Save tokens after OTP verification
   - Update user state with backend response

### Step 3: Services & Booking (Part 3)
1. Create service fetching function:
   - `fetchServices()` in `src/lib/api.js`
   - Update `src/pages/Services.jsx` to use it

2. Update booking flow:
   - `checkoutPrepare()` - Call `/api/v1/checkout/prepare`
   - `createBooking()` - Call `/api/v1/bookings`
   - Update `src/pages/Checkout.jsx` to use new APIs

### Step 4: Payment (Part 4)
1. Update `src/lib/payment.js`:
   - `createRazorpayOrder()` - Call backend
   - `verifyPayment()` - Call backend
   - Handle payment responses

2. Update checkout flow:
   - Integrate payment with booking creation
   - Handle payment success/failure

### Step 5: Contact Form (Part 5)
1. Update `contactUsAPI()` in `src/lib/api.js`:
   - Call `/api/v1/contact`
   - Handle response

### Step 6: Dashboard (Part 6)
1. Create dashboard APIs:
   - `fetchDashboard()` - Get user dashboard data
   - `fetchBookings()` - Get user bookings
   - `cancelBooking()` - Cancel a booking

2. Create/update bookings page:
   - Display user bookings
   - Add booking management

### Step 7: Polish (Part 7)
1. Add error handling:
   - Global error handler
   - User-friendly messages
   - Retry logic

2. Add UX improvements:
   - Loading states
   - Toast notifications
   - Optimistic updates

---

## 🔗 API Endpoints Mapping

### Authentication
| Frontend Function | Backend Endpoint | Method | Status |
|------------------|------------------|--------|--------|
| `sendOTP()` | `/api/v1/auth/send-otp` | POST | ✅ Ready |
| `verifyOTP()` | `/api/v1/auth/verify-otp` | POST | ✅ Ready |
| `refreshToken()` | `/api/v1/auth/refresh` | POST | ✅ Ready |
| `logout()` | `/api/v1/auth/logout` | POST | ✅ Ready |

### Services
| Frontend Function | Backend Endpoint | Method | Status |
|------------------|------------------|--------|--------|
| `fetchServices()` | `/api/v1/services` | GET | ✅ Ready |
| `fetchService(id)` | `/api/v1/services/:id` | GET | ✅ Ready |

### Checkout & Booking
| Frontend Function | Backend Endpoint | Method | Status |
|------------------|------------------|--------|--------|
| `checkoutPrepare()` | `/api/v1/checkout/prepare` | POST | ✅ Ready |
| `createBooking()` | `/api/v1/bookings` | POST | ✅ Ready |
| `fetchBooking(id)` | `/api/v1/bookings/:id` | GET | ✅ Ready |
| `cancelBooking(id)` | `/api/v1/bookings/:id/cancel` | POST | ✅ Ready |

### Payment
| Frontend Function | Backend Endpoint | Method | Status |
|------------------|------------------|--------|--------|
| `createRazorpayOrder()` | `/api/v1/checkout/prepare` | POST | ✅ Ready |
| `verifyPayment()` | `/api/v1/payments/verify` | POST | ✅ Ready |

### Contact
| Frontend Function | Backend Endpoint | Method | Status |
|------------------|------------------|--------|--------|
| `contactUsAPI()` | `/api/v1/contact` | POST | ✅ Ready |

### Dashboard
| Frontend Function | Backend Endpoint | Method | Status |
|------------------|------------------|--------|--------|
| `fetchDashboard()` | `/api/v1/dashboard` | GET | ✅ Ready |

---

## 🔐 Authentication Flow

### Login Flow
```
1. User enters phone number
2. Frontend calls: POST /api/v1/auth/send-otp
3. Backend sends OTP (logs to console in dev)
4. User enters OTP
5. Frontend calls: POST /api/v1/auth/verify-otp
6. Backend returns: { access_token, refresh_token, user }
7. Frontend stores tokens in AuthContext + localStorage
8. User is logged in
```

### Token Management
```javascript
// Token storage
localStorage.setItem('access_token', token);
localStorage.setItem('refresh_token', refreshToken);

// Token in requests
headers: {
  'Authorization': `Bearer ${access_token}`
}

// Token refresh (when 401)
if (response.status === 401) {
  const newToken = await refreshToken();
  // Retry original request
}
```

### Token Refresh Flow
```
1. API request fails with 401
2. Check if refresh_token exists
3. Call: POST /api/v1/auth/refresh
4. Get new access_token
5. Retry original request
6. If refresh fails → logout user
```

---

## ⚠️ Error Handling

### Error Types
1. **Network Errors** - No internet, server down
2. **4xx Errors** - Client errors (validation, auth)
3. **5xx Errors** - Server errors
4. **Timeout Errors** - Request timeout

### Error Handling Strategy
```javascript
try {
  const response = await apiClient.post('/endpoint', data);
  return response.data;
} catch (error) {
  if (error.response) {
    // Server responded with error
    const status = error.response.status;
    const message = error.response.data.message;
    
    switch (status) {
      case 401:
        // Unauthorized - refresh token or logout
        break;
      case 403:
        // Forbidden
        break;
      case 404:
        // Not found
        break;
      case 422:
        // Validation error
        break;
      case 500:
        // Server error
        break;
    }
  } else if (error.request) {
    // Network error
    showError('Network error. Please check your connection.');
  } else {
    // Other error
    showError('An unexpected error occurred.');
  }
}
```

---

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] **Authentication**
  - [ ] Send OTP works
  - [ ] Verify OTP works
  - [ ] Token is stored correctly
  - [ ] Token is sent in requests
  - [ ] Token refresh works
  - [ ] Logout clears tokens

- [ ] **Services**
  - [ ] Services page loads services
  - [ ] Service details page works
  - [ ] Filtering works

- [ ] **Checkout**
  - [ ] Checkout prepare works
  - [ ] Booking creation works
  - [ ] Payment integration works
  - [ ] Payment verification works

- [ ] **Error Handling**
  - [ ] Network errors handled
  - [ ] 401 errors trigger refresh
  - [ ] User-friendly error messages
  - [ ] Loading states work

### Test Scenarios
1. **Happy Path:**
   - User logs in → Browses services → Adds to cart → Checks out → Pays → Booking confirmed

2. **Error Scenarios:**
   - Network failure during checkout
   - Invalid OTP
   - Payment failure
   - Token expiration

---

## 🚀 Deployment Considerations

### Environment Variables
```env
# Frontend .env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### Production Configuration
- Update `API_BASE_URL` to production backend URL
- Enable CORS on backend for frontend domain
- Configure Razorpay live keys
- Set up error tracking (Sentry, etc.)
- Enable request logging

### CORS Setup
Backend already configured for:
- Origin: `http://localhost:5173` (development)
- Update for production domain

---

## 📝 Implementation Checklist

### Phase 1: Foundation (Day 1)
- [x] Backend API running
- [ ] Create API client
- [ ] Setup authentication flow
- [ ] Test authentication

### Phase 2: Core Features (Day 2)
- [ ] Integrate services API
- [ ] Integrate booking API
- [ ] Integrate payment API
- [ ] Test checkout flow

### Phase 3: Additional Features (Day 3)
- [ ] Integrate contact form
- [ ] Integrate dashboard
- [ ] Add error handling
- [ ] Add loading states

### Phase 4: Polish (Day 4)
- [ ] Add toast notifications
- [ ] Improve error messages
- [ ] Add retry logic
- [ ] Final testing

---

## 🎯 Success Criteria

✅ All API calls connected to backend  
✅ Authentication works end-to-end  
✅ Booking creation works  
✅ Payment integration works  
✅ Error handling implemented  
✅ User experience is smooth  
✅ No console errors  
✅ Production-ready code

---

## 📚 Additional Resources

- Backend API Documentation: `/minuteservbackend/README.md`
- Backend Endpoints: Check `server.js` routes
- Supabase Docs: https://supabase.com/docs
- Razorpay Docs: https://razorpay.com/docs

---

**Status:** Ready for Implementation  
**Next Step:** Start with Part 1 - API Client Setup

