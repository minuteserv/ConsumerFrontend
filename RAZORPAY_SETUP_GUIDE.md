# 💳 Razorpay Integration Setup Guide

## 📋 **Current Status**

Razorpay keys are **NOT configured** in the backend. Payment features are currently disabled.

---

## 🔑 **How to Get Razorpay Keys**

### **Step 1: Create Razorpay Account**
1. Go to: https://razorpay.com/
2. Sign up for an account
3. Complete KYC verification

### **Step 2: Get API Keys**
1. Login to Razorpay Dashboard: https://dashboard.razorpay.com/
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Keys** (for testing) or **Generate Live Keys** (for production)

### **Step 3: Copy Keys**
You'll get:
- **Key ID**: `rzp_test_xxxxx` (for test) or `rzp_live_xxxxx` (for live)
- **Key Secret**: `xxxxxxxxxxxxxxxxxxxx` (keep this secret!)

---

## 🔧 **Configuration**

### **Add to Backend `.env` File**

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
```

### **Update Frontend Constants**

In `src/lib/constants.js`:
```javascript
export const RAZORPAY_CONFIG = {
  keyId: 'rzp_test_xxxxxxxxxxxxx', // Your actual Razorpay Key ID
};
```

---

## ✅ **Testing Payment Flow**

### **Test Mode**
- Use **Test Keys** (`rzp_test_...`)
- Test cards: https://razorpay.com/docs/payments/test-cards/
- No real money charged

### **Live Mode**
- Use **Live Keys** (`rzp_live_...`)
- Real payments processed
- Requires KYC verification

---

## 🧪 **Test Cards**

### **Successful Payment**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

### **Failed Payment**
- Card: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: Past date
- Will show payment failure

---

## 📝 **Current Implementation**

### **Backend**
- ✅ Razorpay service implemented
- ✅ Order creation ready
- ✅ Payment verification ready
- ✅ Webhook handler ready
- ⚠️ **Keys not configured** - needs to be added

### **Frontend**
- ✅ Razorpay SDK integration ready
- ✅ Payment flow implemented
- ⚠️ **Key ID needs update** - currently using placeholder

---

## 🚀 **Next Steps**

1. **Get Razorpay Keys**:
   - Sign up at https://razorpay.com/
   - Generate test keys from dashboard

2. **Update Backend**:
   ```bash
   cd minuteservbackend
   # Add to .env
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```

3. **Update Frontend**:
   - Update `RAZORPAY_CONFIG.keyId` in `src/lib/constants.js`

4. **Test**:
   - Test checkout flow with online payment
   - Use test cards for verification

---

## ⚠️ **Important Notes**

- **Test Keys**: Use for development/testing only
- **Live Keys**: Use for production only
- **Never Commit Keys**: Keep in `.env` file (in `.gitignore`)
- **Security**: Rotate keys periodically
- **Webhooks**: Configure webhook URL in Razorpay dashboard

---

## 🔗 **Resources**

- Razorpay Dashboard: https://dashboard.razorpay.com/
- API Documentation: https://razorpay.com/docs/api/
- Test Cards: https://razorpay.com/docs/payments/test-cards/
- Webhook Setup: https://razorpay.com/docs/webhooks/

---

## ✅ **Status**

**Current**: ⚠️ Keys not configured  
**Action Required**: Add Razorpay keys to `.env` file  
**Once Configured**: Payment flow will be fully functional

