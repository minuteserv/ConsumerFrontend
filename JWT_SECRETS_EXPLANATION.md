# JWT_SECRET and JWT_REFRESH_SECRET - What They're Used For

## 🔐 **What Are JWT Secrets?**

JWT (JSON Web Token) secrets are cryptographic keys used to **sign** and **verify** authentication tokens. They ensure that tokens haven't been tampered with and are authentic.

---

## 📋 **Current Usage in Your Backend**

### **JWT_SECRET** ✅ **Currently Used**
- **Location**: `src/utils/jwt.js`
- **Used For**: 
  - Signing access tokens (short-lived, 15 minutes)
  - Signing refresh tokens (long-lived, 7 days)
  - Verifying tokens in authentication middleware

### **JWT_REFRESH_SECRET** ⚠️ **Currently NOT Used**
- **Defined in**: `.env` file
- **Status**: Defined but not implemented in code
- **Should Be Used For**: 
  - Signing refresh tokens separately (better security practice)

---

## 🔍 **How They Work**

### **1. Token Generation (Login/OTP Verification)**

When a user logs in successfully:

```javascript
// In authController.js (line 121-130)
const tokenPayload = {
  userId: user.id,
  phone_number: user.phone_number
};

const accessToken = generateAccessToken(tokenPayload);    // Uses JWT_SECRET
const refreshToken = generateRefreshToken(tokenPayload);  // Uses JWT_SECRET (should use JWT_REFRESH_SECRET)
```

**Current Implementation:**
```javascript
// src/utils/jwt.js
function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); // ⚠️ Uses same secret
}
```

### **2. Token Verification (Protected Routes)**

When a user makes an authenticated request:

```javascript
// In middleware/auth.js (line 21)
const decoded = verifyToken(token); // Verifies using JWT_SECRET
```

**Current Implementation:**
```javascript
// src/utils/jwt.js
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET); // Verifies using JWT_SECRET
}
```

---

## 🎯 **Why Two Secrets? (Best Practice)**

### **Security Benefits:**
1. **Separate Keys**: If one secret is compromised, the other remains secure
2. **Different Lifetimes**: Access tokens (15 min) vs Refresh tokens (7 days)
3. **Revocation**: Can invalidate refresh tokens independently
4. **Rotation**: Can rotate secrets independently

### **Current Issue:**
- Both tokens use the same secret (`JWT_SECRET`)
- If access token secret is compromised, refresh tokens are also at risk

---

## 🔧 **Recommended Implementation**

### **Should Update Code To Use Separate Secrets:**

```javascript
// src/utils/jwt.js (recommended)
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' }); // ✅ Use separate secret
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET); // For access tokens
}

function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET); // For refresh tokens
}
```

---

## 📊 **Current Token Flow**

```
User Login
    ↓
OTP Verified
    ↓
Generate Access Token (JWT_SECRET) ✅
    ↓
Generate Refresh Token (JWT_SECRET) ⚠️ (should use JWT_REFRESH_SECRET)
    ↓
Return to Frontend
    ↓
Frontend stores tokens
    ↓
API Requests include Access Token
    ↓
Middleware verifies with JWT_SECRET ✅
```

---

## 🔐 **Security Best Practices**

### **1. Generate Strong Secrets:**
```bash
# Generate random 32-byte secret
openssl rand -base64 32
```

### **2. Use Different Secrets:**
- Access tokens: Short-lived, high-frequency use
- Refresh tokens: Long-lived, less frequent use

### **3. Store Securely:**
- Never commit secrets to Git
- Use environment variables
- Rotate secrets periodically

### **4. Current `.env` Values:**
```env
JWT_SECRET=your-jwt-secret-key-change-in-production ⚠️ Change this!
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key-change-in-production ⚠️ Change this!
```

**⚠️ These are placeholder values - MUST be changed in production!**

---

## ✅ **Summary**

### **JWT_SECRET:**
- ✅ **Currently Used** for signing and verifying ALL tokens
- ✅ **Needed** for authentication
- ⚠️ **Should** be a strong random string (32+ characters)

### **JWT_REFRESH_SECRET:**
- ⚠️ **Defined** in `.env` but not used in code
- ✅ **Should** be used for refresh tokens only
- ⚠️ **Should** be different from JWT_SECRET
- ✅ **Would improve** security if implemented

---

## 🚀 **Action Items**

1. **Change Current Secrets** (Production):
   ```bash
   openssl rand -base64 32  # Generate JWT_SECRET
   openssl rand -base64 32  # Generate JWT_REFRESH_SECRET
   ```

2. **Update Code** (Optional but recommended):
   - Use `JWT_REFRESH_SECRET` for refresh tokens
   - Add separate verification function

3. **Keep Secrets Secure**:
   - Never commit to Git
   - Use environment variables
   - Rotate periodically

---

## 📝 **Quick Answer**

**JWT_SECRET**: Used to sign and verify JWT tokens (authentication). Currently used for both access and refresh tokens.

**JWT_REFRESH_SECRET**: Defined but not currently used. Should be used for refresh tokens for better security.

**Both are required** for secure JWT authentication, but currently only `JWT_SECRET` is actively used.

