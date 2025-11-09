# 🧪 Edge Case Testing - Comprehensive Test Suite

## 📋 **Test Plan**

Testing all edge cases and error scenarios for robust API behavior.

---

## 🔍 **Edge Cases to Test**

### **1. Authentication Edge Cases**
- [ ] Invalid phone number format
- [ ] Missing phone number
- [ ] Expired OTP
- [ ] Invalid OTP
- [ ] Rate limiting (3 OTPs/hour)
- [ ] Invalid token
- [ ] Expired token
- [ ] Missing token

### **2. Services Edge Cases**
- [ ] Invalid service ID
- [ ] Inactive service
- [ ] Non-existent service
- [ ] Empty service list
- [ ] Duplicate service IDs

### **3. Checkout Edge Cases**
- [ ] Missing service IDs
- [ ] Invalid service IDs
- [ ] Missing address
- [ ] Invalid address ID
- [ ] Address not belonging to user
- [ ] Past booking date
- [ ] Invalid booking time
- [ ] Missing required fields
- [ ] Invalid promo code
- [ ] Expired promo code
- [ ] Invalid payment method

### **4. Payment Edge Cases**
- [ ] Missing Razorpay keys
- [ ] Invalid payment order
- [ ] Payment verification failure
- [ ] Duplicate payment
- [ ] Payment timeout

### **5. Booking Edge Cases**
- [ ] Booking cancellation after payment
- [ ] Booking cancellation before payment
- [ ] Invalid booking ID
- [ ] Booking not belonging to user
- [ ] Already cancelled booking

### **6. Address Edge Cases**
- [ ] Invalid address data
- [ ] Missing required address fields
- [ ] Invalid pincode
- [ ] Address not belonging to user

---

## 🧪 **Test Execution**

*Tests will be executed systematically*

