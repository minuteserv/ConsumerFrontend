# 💳 Razorpay Configuration Guide

## 📋 **Current Status**

Razorpay keys are **NOT configured**. Payment features are disabled.

---

## 🔑 **How to Get Razorpay Keys**

### **Step 1: Create Account**
1. Visit: https://razorpay.com/
2. Click "Sign Up"
3. Complete registration

### **Step 2: Complete KYC (For Live Keys)**
- Test keys don't require KYC
- Live keys require KYC verification

### **Step 3: Get API Keys**
1. Login: https://dashboard.razorpay.com/
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Keys** (for development)
4. Copy **Key ID** and **Key Secret**

---

## 🔧 **Configuration Steps**

### **1. Update Backend `.env`**

```bash
cd minuteservbackend
```

Add to `.env`:
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
```

### **2. Update Frontend Constants**

Edit `src/lib/constants.js`:
```javascript
export const RAZORPAY_CONFIG = {
  keyId: 'rzp_test_xxxxxxxxxxxxx', // Your actual Razorpay Key ID
};
```

### **3. Restart Backend**

```bash
# Backend will automatically load new keys
npm run dev
```

---

## 🧪 **Testing**

### **Test Cards** (Test Mode Only)

**Successful Payment**:
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/25`)
- Name: Any name

**Failed Payment**:
- Card: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: Past date
- Will show payment failure

**More Test Cards**: https://razorpay.com/docs/payments/test-cards/

---

## ✅ **Verification**

After configuration, test payment flow:

1. Go through checkout
2. Select "Pay Online"
3. Use test card `4111 1111 1111 1111`
4. Payment should process successfully

---

## ⚠️ **Important Notes**

- **Test Keys**: Use for development/testing only
- **Live Keys**: Use for production only
- **Never Commit**: Keep keys in `.env` (already in `.gitignore`)
- **Security**: Rotate keys periodically
- **Webhooks**: Configure webhook URL in Razorpay dashboard

---

## 🔗 **Resources**

- Dashboard: https://dashboard.razorpay.com/
- Documentation: https://razorpay.com/docs/api/
- Test Cards: https://razorpay.com/docs/payments/test-cards/
- Webhooks: https://razorpay.com/docs/webhooks/

---

## ✅ **Status**

**Current**: ⚠️ Keys not configured  
**Action**: Add Razorpay keys to `.env`  
**Once Configured**: Payment flow fully functional

