# 🧪 Manual Testing Guide

## 📋 **Port Information**

### **Backend API Server**
- **Port**: `3000`
- **URL**: `http://localhost:3000`
- **Health Check**: `http://localhost:3000/health`
- **API Base**: `http://localhost:3000/api/v1`

### **Consumer Frontend (Main Website)**
- **Port**: `5173` (Vite default)
- **URL**: `http://localhost:5173`

### **Admin Panel Frontend**
- **Port**: `5174` (or next available port if 5173 is in use)
- **URL**: `http://localhost:5174`

---

## 🔐 **Authentication Testing**

### **Option 1: Development Mode (Test OTP)**

In development mode, you can use **any phone number** with the hardcoded test OTP:

**Test OTP**: `123456`

**Steps**:
1. Go to `http://localhost:5173`
2. Click "Login" or go through checkout
3. Enter **any phone number** (e.g., `+919999999999`)
4. Click "Send OTP"
5. Enter OTP: `123456`
6. Click "Verify"

**Note**: The test OTP `123456` works for **any phone number** in development mode.

---

### **Option 2: Real OTP (Twilio SMS)**

For real OTP via SMS, you need to use a **verified phone number** in Twilio trial mode.

**Twilio Phone Number**: `+12513519160`

**Verified Numbers**:
- Check your Twilio Console: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
- Only verified numbers can receive SMS in trial mode

**Steps**:
1. Verify your phone number in Twilio Console first
2. Go to `http://localhost:5173`
3. Enter your **verified phone number** (with country code, e.g., `+919876543210`)
4. Click "Send OTP"
5. Check your phone for SMS
6. Enter the OTP received
7. Click "Verify"

---

## 🧪 **Manual Testing Checklist**

### **1. Authentication Flow**
- [ ] Open `http://localhost:5173`
- [ ] Try to checkout (should trigger login)
- [ ] Enter phone number
- [ ] Use OTP `123456` (dev mode)
- [ ] Verify login successful

### **2. Services**
- [ ] Browse services
- [ ] View service details
- [ ] Filter by category/tier

### **3. Cart & Checkout**
- [ ] Add services to cart
- [ ] Go to cart page
- [ ] Proceed to checkout
- [ ] Fill address details
- [ ] Select date & time
- [ ] Review order
- [ ] Complete booking (cash/online)

### **4. Admin Panel**
- [ ] Open `http://localhost:5174`
- [ ] Login with:
  - Username: `admin`
  - Password: `admin123`
- [ ] Check dashboard
- [ ] View bookings
- [ ] Manage services
- [ ] View customers

---

## 📱 **Phone Numbers for Testing**

### **Development Mode (Test OTP)**
Use **any phone number** with OTP `123456`:
- `+919999999999`
- `+919888777666`
- `+919777666555`
- Any format you want

### **Production Mode (Real OTP)**
Use **verified phone numbers** from Twilio:
1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Add your phone number
3. Verify it
4. Use that verified number for testing

---

## 🔧 **Quick Test Commands**

### **Test Backend Health**
```bash
curl http://localhost:3000/health
```

### **Test Authentication (Dev Mode)**
```bash
# Send OTP
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"+919999999999"}'

# Verify OTP (use test OTP 123456)
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"+919999999999","otp_code":"123456"}'
```

### **Test Services**
```bash
curl http://localhost:3000/api/v1/services/catalog
```

---

## ✅ **Recommended Testing Flow**

1. **Start Backend**:
   ```bash
   cd minuteservbackend
   npm run dev
   ```

2. **Start Frontend**:
   ```bash
   npm run dev
   # Usually runs on http://localhost:5173
   ```

3. **Start Admin Panel**:
   ```bash
   cd minuteservAdminFrontend
   npm run dev
   # Usually runs on http://localhost:5174
   ```

4. **Test Authentication**:
   - Use phone number: `+919999999999`
   - Use OTP: `123456`
   - Test login flow

5. **Test Booking**:
   - Add services to cart
   - Go through checkout
   - Complete booking

---

## ⚠️ **Important Notes**

- **Development Mode**: Test OTP `123456` works for any phone number
- **Production Mode**: Need verified Twilio numbers
- **Admin Panel**: Hardcoded login (username: `admin`, password: `admin123`)
- **Backend**: Must be running on port 3000
- **Frontend**: Check console for actual port (may vary)

---

## 🔗 **Quick Links**

- **Consumer App**: http://localhost:5173
- **Admin Panel**: http://localhost:5174
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Twilio Console**: https://console.twilio.com/
- **Verified Numbers**: https://console.twilio.com/us1/develop/phone-numbers/manage/verified

---

## ✅ **Status**

- ✅ Backend: Port 3000
- ✅ Consumer Frontend: Port 5173
- ✅ Admin Panel: Port 5174 (or next available)
- ✅ Test OTP: `123456` (works for any number in dev mode)
- ✅ Twilio: Configured (needs verified numbers for real SMS)

---

**Happy Testing! 🚀**

