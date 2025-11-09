# Authentication Strategy for User App (Customer-Facing)

## Recommendation: **HttpOnly Cookies + Persistent Login (YouTube-like)**

### Why This Approach?

1. **Security**: HttpOnly cookies are immune to XSS attacks (JavaScript can't access them)
2. **User Experience**: Persistent login like YouTube - users stay logged in for months
3. **Simplicity**: Cookies automatically sent with requests, no manual header management
4. **Mobile-Friendly**: Works seamlessly on mobile browsers

---

## Implementation Strategy

### Option 1: **HttpOnly Cookies (Recommended - Most Secure)**

```javascript
// Backend sets cookies automatically
res.cookie('access_token', token, {
  httpOnly: true,      // JavaScript cannot access (prevents XSS)
  secure: true,        // HTTPS only in production
  sameSite: 'strict',  // CSRF protection
  maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days (like YouTube)
  path: '/'
});
```

**Pros:**
- ✅ Most secure (XSS protection)
- ✅ Automatic token management
- ✅ CSRF protection with SameSite
- ✅ No manual token handling needed

**Cons:**
- ❌ Requires backend to set cookies
- ❌ Slightly more complex setup

---

### Option 2: **localStorage with Very Long Expiry (Current Approach - Simpler)**

```javascript
// Store in localStorage with 90-day expiry
{
  access_token: "...",
  refresh_token: "...",
  expires_at: Date.now() + (90 * 24 * 60 * 60 * 1000) // 90 days
}
```

**Pros:**
- ✅ Simpler implementation
- ✅ Works with current setup
- ✅ Easy to debug
- ✅ Cross-domain compatible

**Cons:**
- ❌ Vulnerable to XSS (if your site has XSS vulnerabilities)
- ❌ Need to manually add to headers

---

## **My Recommendation: Hybrid Approach**

For a customer-facing app like Minuteserv, use **HttpOnly Cookies** for tokens with **long expiry** (90 days):

### Backend Changes:

```javascript
// In authController.js - verifyOTPHandler
const token = generateToken(user.id);
const refreshToken = generateRefreshToken(user.id);

// Set HttpOnly cookies
res.cookie('access_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS in production
  sameSite: 'lax', // Allows cross-site requests for navigation
  maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
  path: '/'
});

res.cookie('refresh_token', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
  path: '/'
});

// Return user data only (no tokens in response)
return successResponse(res, {
  user: {
    id: user.id,
    phone_number: user.phone_number,
    name: user.name,
    email: user.email
  }
});
```

### Frontend Changes:

```javascript
// apiClient.js - No token management needed!
// Cookies are automatically sent with requests

// No need to:
// - Store tokens in localStorage
// - Add Authorization headers
// - Handle token expiry manually

// Just make requests - cookies are sent automatically!
```

---

## Token Expiry Strategy

### **YouTube-like: Long Expiry (Recommended)**

**Access Token**: 90 days (or even 1 year)
- Users stay logged in for months
- Better UX for mobile users
- No annoying re-logins

**Refresh Token**: 90 days (same as access token)
- Auto-refresh if needed
- Seamless experience

**Why No Expiry?**
- Mobile apps (like YouTube) keep users logged in for months
- Users expect persistent login
- OTP verification is already secure (phone number required)
- Can add "Remember Me" functionality later

---

## Security Considerations

### With HttpOnly Cookies:

1. **XSS Protection**: ✅ Tokens not accessible to JavaScript
2. **CSRF Protection**: ✅ SameSite attribute prevents CSRF
3. **Secure Transport**: ✅ Secure flag ensures HTTPS only
4. **Path Restriction**: ✅ Cookies only sent to your domain

### Additional Security:

1. **Rate Limiting**: Already implemented on OTP endpoints
2. **Phone Verification**: OTP ensures real phone number
3. **Session Management**: Can invalidate tokens on logout
4. **Device Tracking**: Optional - track devices for security

---

## Migration Path

### Step 1: Update Backend (Set Cookies)
- Modify `authController.js` to set HttpOnly cookies
- Remove token from response body

### Step 2: Update Frontend (Remove Token Handling)
- Remove localStorage token storage
- Remove Authorization header logic
- Simplify API client (cookies auto-sent)

### Step 3: Test
- Verify login works
- Verify API calls work
- Verify logout clears cookies

---

## Final Recommendation

**Use HttpOnly Cookies with 90-day expiry** for best security + UX.

**Why?**
- Most secure (XSS protection)
- YouTube-like UX (persistent login)
- Simpler frontend code
- Industry best practice

**When to use localStorage:**
- If you need cross-domain authentication
- If you're building a mobile app (React Native)
- If you need fine-grained control over tokens

---

## Code Example

### Backend (Express):
```javascript
res.cookie('access_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 90 * 24 * 60 * 60 * 1000
});
```

### Frontend (No changes needed - cookies auto-sent):
```javascript
// Just make API calls - cookies are sent automatically!
fetch('/api/v1/bookings')
  .then(res => res.json())
```

---

## Summary

✅ **Use HttpOnly Cookies** (most secure)
✅ **90-day expiry** (YouTube-like UX)
✅ **No manual token management** (cookies auto-sent)
✅ **Simple and secure** (best of both worlds)

This gives you security + great UX!

