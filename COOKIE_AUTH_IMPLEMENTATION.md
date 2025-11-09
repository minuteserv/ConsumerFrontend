# Cookie-Based Authentication Implementation

## ✅ Implementation Complete

Authentication has been migrated from localStorage to HttpOnly cookies for enhanced security and session persistence.

---

## 🔐 Security Improvements

### HttpOnly Cookies
- Tokens are stored in HttpOnly cookies, not accessible via JavaScript
- Prevents XSS attacks from stealing tokens
- Cookies are automatically sent with requests

### Cookie Configuration
- **httpOnly**: `true` - Not accessible via `document.cookie`
- **secure**: `true` in production (HTTPS only)
- **sameSite**: `'lax'` - CSRF protection
- **maxAge**: 
  - Access token: 15 minutes
  - Refresh token: 7 days

---

## 📝 Backend Changes

### 1. Installed Dependencies
- `cookie-parser` - Parse cookies from requests

### 2. Updated Files

#### `server.js`
- Added `cookie-parser` middleware
- Configured CORS with `credentials: true`

#### `src/controllers/authController.js`
- **verifyOTPHandler**: Sets HttpOnly cookies instead of returning tokens
- **refreshTokenHandler**: Reads refresh token from cookie, sets new access token cookie
- **logoutHandler**: Clears both cookies

#### `src/middleware/auth.js`
- Reads token from cookie (preferred) or Authorization header (backward compatibility)

---

## 📝 Frontend Changes

### 1. Updated Files

#### `src/lib/apiClient.js`
- All requests include `credentials: 'include'` to send cookies
- Removed localStorage token management functions (now no-ops)
- Token refresh uses cookies automatically

#### `src/contexts/AuthContext.jsx`
- On mount: Calls `/auth/me` to verify authentication status
- No longer reads tokens from localStorage on initialization
- User data cached in localStorage (backup only)
- Logout calls backend to clear cookies

#### `src/components/LoginModal.jsx`
- Removed token references from login call
- Only passes user data (tokens in cookies)

#### `src/lib/otp.js`
- Removed token fields from verifyOTP response

---

## 🚀 How It Works

### Login Flow
1. User enters phone number → OTP sent
2. User enters OTP → Backend verifies
3. Backend sets `access_token` and `refresh_token` in HttpOnly cookies
4. Backend returns user data only
5. Frontend updates AuthContext with user data

### Session Persistence
1. On page load/reload: AuthContext calls `/auth/me`
2. Browser automatically sends cookies with request
3. Backend verifies token from cookie
4. If valid: Returns user data, AuthContext sets authenticated state
5. If invalid: Returns 401, AuthContext sets unauthenticated state

### Token Refresh
1. When access token expires (401 response)
2. apiClient automatically calls `/auth/refresh-token`
3. Browser sends refresh token cookie automatically
4. Backend issues new access token cookie
5. Original request is retried

### Logout
1. User clicks logout
2. Frontend calls `/auth/logout`
3. Backend clears both cookies
4. Frontend clears user data from state

---

## ✅ Benefits

1. **Security**: HttpOnly cookies prevent XSS token theft
2. **Persistence**: Session persists across page refreshes
3. **Automatic**: Cookies sent automatically with requests
4. **No Manual Management**: No need to manually store/retrieve tokens
5. **CSRF Protection**: SameSite: lax prevents CSRF attacks

---

## 🧪 Testing

1. **Login**: Enter phone → OTP → Verify
2. **Refresh**: Reload page → Should stay logged in
3. **API Calls**: Should work automatically (cookies sent)
4. **Logout**: Click logout → Cookies cleared → Not authenticated

---

## 📌 Important Notes

- Cookies are domain-specific (localhost:3000 for backend)
- In production, ensure frontend and backend share the same domain or configure CORS properly
- Refresh token endpoint is public (no auth required)
- `/auth/me` endpoint requires authentication (protected route)

---

## 🔧 Troubleshooting

### Issue: Session not persisting after refresh
- **Check**: Browser DevTools → Application → Cookies
- **Verify**: `access_token` and `refresh_token` cookies exist
- **Check**: Backend CORS configuration includes frontend origin

### Issue: 401 Unauthorized errors
- **Check**: Cookies are being sent (Network tab → Request Headers)
- **Verify**: Cookie domain/path matches backend
- **Check**: Token expiration (15 minutes for access token)

### Issue: CORS errors
- **Verify**: Backend CORS allows frontend origin
- **Check**: `credentials: true` in CORS config
- **Verify**: Frontend requests include `credentials: 'include'`

---

## ✨ Status: READY FOR PRODUCTION

All authentication flows are implemented and tested. The system is ready for use.
