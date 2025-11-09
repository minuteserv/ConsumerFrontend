# Cookie-Based Authentication - Testing Checklist

## ✅ Implementation Status

### Backend
- [x] cookie-parser installed
- [x] Cookie middleware configured
- [x] CORS configured with credentials: true
- [x] Auth controllers set HttpOnly cookies
- [x] Auth middleware reads from cookies
- [x] Refresh token uses cookies
- [x] Logout clears cookies

### Frontend
- [x] apiClient sends credentials: 'include'
- [x] AuthContext verifies auth on mount via /auth/me
- [x] LoginModal updated for cookies
- [x] OTP flow updated

## 🧪 Testing Steps

### 1. Backend Server
```bash
cd minuteservbackend
npm run dev
```
Expected: Server starts on port 3000

### 2. Frontend Server
```bash
npm run dev
```
Expected: Frontend starts on port 5173

### 3. Login Flow Test
1. Open browser to http://localhost:5173
2. Click login
3. Enter phone number: 7003848501
4. Request OTP
5. Enter OTP received via SMS
6. Verify: User logged in, cookies set

### 4. Session Persistence Test
1. After login, refresh page (F5)
2. Verify: User stays logged in
3. Check DevTools → Application → Cookies
4. Verify: access_token and refresh_token cookies exist

### 5. API Call Test
1. While logged in, navigate to any protected page
2. Verify: API calls succeed (cookies sent automatically)
3. Check Network tab → Request Headers
4. Verify: Cookie header includes tokens

### 6. Logout Test
1. Click logout
2. Verify: Cookies cleared
3. Verify: User logged out
4. Refresh page
5. Verify: User remains logged out

## 🔍 Debugging

### Check Cookies in Browser
1. Open DevTools (F12)
2. Application → Cookies → http://localhost:3000
3. Look for:
   - access_token (HttpOnly, expires in 15 min)
   - refresh_token (HttpOnly, expires in 7 days)

### Check Network Requests
1. Network tab
2. Filter: XHR/Fetch
3. Click any request
4. Check Request Headers → Cookie header
5. Verify cookies are being sent

### Check Console
- No errors in console
- AuthContext logs (if any)
- API client logs

## ✅ Expected Behavior

1. **Login**: User enters OTP → Cookies set → User logged in
2. **Refresh**: Page reload → /auth/me called → User stays logged in
3. **API Calls**: All requests include cookies automatically
4. **Token Refresh**: Automatic when access token expires
5. **Logout**: Cookies cleared → User logged out

## 🚨 Common Issues

### Issue: Cookies not being set
- Check: Backend CORS allows frontend origin
- Check: credentials: true in CORS config
- Check: Backend sets cookies correctly

### Issue: Session not persisting
- Check: Cookies exist in browser
- Check: /auth/me endpoint works
- Check: AuthContext calls /auth/me on mount

### Issue: CORS errors
- Check: Backend CORS allows frontend origin
- Check: credentials: 'include' in frontend requests
- Check: CORS credentials: true in backend

