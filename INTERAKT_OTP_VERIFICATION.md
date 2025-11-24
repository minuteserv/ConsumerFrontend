# Interakt OTP Verification - Complete Implementation Plan

## 🎯 Executive Summary

**Status**: Ready for Implementation  
**Engineer Responsibility**: 100% Accountability  
**OTP Format**: 4-digit (changed from 6-digit)  
**Channel**: RCS (Rich Communication Services) only - No SMS fallback, No DLT required  
**Twilio**: Completely removed  
**Webhook**: Not implemented (optional feature)

---

## 📋 Overview

This document provides a **complete implementation plan** for migrating from Twilio SMS OTP to Interakt RCS OTP verification. The implementation will:

1. ✅ **Remove Twilio completely** from the codebase
2. ✅ **Change OTP from 6-digit to 4-digit**
3. ✅ **Use Interakt RCS only** (no SMS fallback, no DLT registration needed)
4. ✅ **Update both backend and frontend** with all necessary changes
5. ✅ **Maintain 100% backward compatibility** with existing API endpoints

### Key Changes Summary

| Aspect | Before (Twilio) | After (Interakt) |
|--------|----------------|------------------|
| **OTP Length** | 6 digits | 4 digits |
| **Channel** | SMS only | RCS (Rich Communication Services) |
| **Provider** | Twilio | Interakt |
| **DLT Required** | No | No (RCS doesn't require DLT) |
| **SMS Fallback** | N/A | Not implemented |
| **Webhook** | Not used | Not implemented |

---

## 🔄 Complete OTP Flow

### New Flow (Interakt RCS - 4-digit OTP)

```
User Request OTP
    ↓
Backend generates 4-digit OTP
    ↓
OTP stored in database (10 min expiry)
    ↓
Interakt API called with RCS card
    ↓
User receives rich RCS card with OTP
    ↓
User enters 4-digit OTP in app
    ↓
Backend verifies OTP
    ↓
User logged in
```

**Note**: RCS (Rich Communication Services) works on Android phones and provides a rich card experience similar to WhatsApp. It doesn't require DLT registration as it's not SMS.

---

## 🔧 How Interakt RCS Works

### RCS Message Structure

Interakt sends OTP in a rich card format:
- **Card Title**: "Your OTP Code"
- **Card Description**: "Your OTP for MinServe is 1234. Valid for 10 minutes."
- **No SMS Fallback**: RCS-only delivery (no DLT needed)
- **Rich Experience**: Interactive card format on supported Android devices

### Why RCS Only?

- ✅ **No DLT Registration**: RCS is not SMS, so DLT registration is not required
- ✅ **Better UX**: Rich card format instead of plain text
- ✅ **Simpler Setup**: No need for DLT templates, PE IDs, etc.
- ✅ **Cost Effective**: RCS messages are typically cheaper than SMS
- ⚠️ **Android Only**: RCS works primarily on Android devices (Google Messages)

---

## 📊 Implementation Checklist

### Phase 1: Backend Changes ✅

#### 1.1 Remove Twilio Dependencies
- [ ] Remove `twilio` package from `package.json`
- [ ] Remove Twilio environment variables from `.env`
- [ ] Remove Twilio initialization code
- [ ] Remove all Twilio-related error handling

#### 1.2 Create Interakt OTP Service
- [ ] Create `minuteservbackend/src/services/interaktOTPService.js`
- [ ] Implement 4-digit OTP generation
- [ ] Implement Interakt API integration
- [ ] Implement rate limiting (3 OTPs per hour)
- [ ] Implement OTP storage and verification

#### 1.3 Update Auth Controller
- [ ] Update `authController.js` to use Interakt service
- [ ] Ensure API endpoints remain unchanged
- [ ] Update error messages if needed

#### 1.4 Environment Variables
- [ ] Add `INTERAKT_API_KEY` to `.env`
- [ ] Add `INTERAKT_BASE_URL` to `.env`
- [ ] Remove Twilio variables

### Phase 2: Frontend Changes ✅

#### 2.1 Update OTP Input Component
- [ ] Change OTP array from 6 to 4 digits
- [ ] Update OTP input validation (4 digits instead of 6)
- [ ] Update UI text ("4-digit OTP" instead of "6-digit OTP")
- [ ] Update paste handler for 4 digits
- [ ] Update auto-submit logic for 4 digits

#### 2.2 Update LoginModal Component
- [ ] Change `otp` state from `['', '', '', '', '', '']` to `['', '', '', '']`
- [ ] Update all references to 6-digit OTP
- [ ] Update error messages
- [ ] Update UI labels and descriptions

#### 2.3 Update OTP Service (Frontend)
- [ ] No changes needed (uses backend API)
- [ ] Verify error handling works correctly

### Phase 3: Testing ✅

#### 3.1 Backend Testing
- [ ] Test OTP generation (4-digit)
- [ ] Test Interakt API integration
- [ ] Test rate limiting
- [ ] Test OTP verification
- [ ] Test error handling

#### 3.2 Frontend Testing
- [ ] Test OTP input (4 digits)
- [ ] Test paste functionality
- [ ] Test auto-submit
- [ ] Test error messages
- [ ] Test resend OTP

#### 3.3 Integration Testing
- [ ] Test complete flow (send → receive → verify)
- [ ] Test with real phone numbers
- [ ] Test rate limiting behavior
- [ ] Test expired OTP handling

---

## 💻 Complete Code Implementation

### Backend: Interakt OTP Service

**File**: `minuteservbackend/src/services/interaktOTPService.js`

```javascript
const axios = require('axios');
const supabase = require('../config/supabase');
const logger = require('../utils/logger');

const INTERAKT_BASE_URL = process.env.INTERAKT_BASE_URL || 'https://api.interakt.ai/v1/public';
const INTERAKT_API_KEY = process.env.INTERAKT_API_KEY;

/**
 * Generate 4-digit OTP
 * Changed from 6-digit to 4-digit
 */
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Format phone number for Interakt API
 * Input: "+919876543210"
 * Output: { countryCode: "+91", phoneNumber: "9876543210" }
 */
function formatPhoneNumber(phoneNumber) {
  // Remove any spaces or dashes
  let cleaned = phoneNumber.replace(/[\s-]/g, '');
  
  // Extract country code (assume +91 for India)
  if (cleaned.startsWith('+91')) {
    return {
      countryCode: '+91',
      phoneNumber: cleaned.substring(3)
    };
  } else if (cleaned.startsWith('91')) {
    return {
      countryCode: '+91',
      phoneNumber: cleaned.substring(2)
    };
  } else if (cleaned.startsWith('0')) {
    return {
      countryCode: '+91',
      phoneNumber: cleaned.substring(1)
    };
  } else {
    // Default to India
    return {
      countryCode: '+91',
      phoneNumber: cleaned
    };
  }
}

/**
 * Send OTP via Interakt RCS (no SMS fallback, no DLT)
 * @param {string} phoneNumber - Full phone number with country code
 * @returns {Promise<Object>} Result with OTP code and expiry
 */
async function sendOTP(phoneNumber) {
  try {
    // Check rate limit (3 per hour per phone)
    const maxOTPsPerHour = process.env.NODE_ENV === 'development' ? 10 : 3;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const { data: recentOTPs } = await supabase
      .from('otp_verifications')
      .select('id')
      .eq('phone_number', phoneNumber)
      .gte('created_at', oneHourAgo.toISOString());

    if (recentOTPs && recentOTPs.length >= maxOTPsPerHour) {
      throw new Error(`OTP limit exceeded. Please try again after 1 hour. (${recentOTPs.length}/${maxOTPsPerHour} used)`);
    }

    // Generate 4-digit OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database first
    const { data: otpRecord, error: dbError } = await supabase
      .from('otp_verifications')
      .insert({
        phone_number: phoneNumber,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        is_verified: false
      })
      .select()
      .single();

    if (dbError) {
      logger.error('Error storing OTP:', dbError);
      throw new Error('Failed to send OTP');
    }

    // Format phone number for Interakt
    const { countryCode, phoneNumber: number } = formatPhoneNumber(phoneNumber);

    // Prepare Interakt API payload (RCS only, no SMS fallback)
    const payload = {
      countryCode,
      phoneNumber: number,
      message: {
        richCardDetails: {
          standalone: {
            cardOrientation: "VERTICAL",
            content: {
              cardTitle: "Your OTP Code",
              cardDescription: `Your OTP for MinServe is ${otpCode}. Valid for 10 minutes.`
            }
          }
        }
      },
      type: "STANDALONE_CAROUSEL"
      // No fallback array - RCS only
    };

    // Send via Interakt API
    try {
      const response = await axios.post(
        `${INTERAKT_BASE_URL}/rcs/message/`,
        payload,
        {
          headers: {
            'Authorization': `Basic ${INTERAKT_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`✅ OTP sent via Interakt RCS to ${phoneNumber}. Message ID: ${response.data.id}`);
      
      return {
        success: true,
        expires_in: 600, // 10 minutes in seconds
        message_id: response.data.id,
        // Only return OTP in development mode
        ...(process.env.NODE_ENV === 'development' && { otp_code: otpCode })
      };
    } catch (interaktError) {
      logger.error('Interakt API error:', interaktError.response?.data || interaktError.message);
      
      // Handle rate limiting
      if (interaktError.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please retry after some time.');
      }
      
      // Even if Interakt fails, OTP is stored in database
      logger.warn(`Interakt failed but OTP stored: ${otpCode}`);
      
      throw new Error('Failed to send OTP via Interakt. Please try again.');
    }
  } catch (error) {
    logger.error('Send OTP error:', error);
    throw error;
  }
}

/**
 * Verify OTP
 * @param {string} phoneNumber - Full phone number with country code
 * @param {string} otpCode - 4-digit OTP code to verify
 * @returns {Promise<Object>} Verification result
 */
async function verifyOTP(phoneNumber, otpCode) {
  try {
    // Validate OTP format (4 digits)
    if (!/^\d{4}$/.test(otpCode)) {
      throw new Error('OTP must be 4 digits');
    }

    // Find valid OTP
    const { data: otpRecord, error: findError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('otp_code', otpCode)
      .eq('is_verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (findError || !otpRecord) {
      throw new Error('Invalid or expired OTP');
    }

    // Mark OTP as verified
    await supabase
      .from('otp_verifications')
      .update({ is_verified: true })
      .eq('id', otpRecord.id);

    return {
      success: true,
      verified: true
    };
  } catch (error) {
    logger.error('Verify OTP error:', error);
    throw error;
  }
}

/**
 * Clean up expired OTPs (run periodically)
 */
async function cleanupExpiredOTPs() {
  try {
    const { error } = await supabase
      .from('otp_verifications')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      logger.error('Cleanup OTP error:', error);
    }
  } catch (error) {
    logger.error('Cleanup OTP error:', error);
  }
}

module.exports = {
  sendOTP,
  verifyOTP,
  generateOTP,
  cleanupExpiredOTPs
};
```

### Backend: Update Auth Controller

**File**: `minuteservbackend/src/controllers/authController.js`

**Changes Required**:
1. Replace `require('../services/otpService')` with `require('../services/interaktOTPService')`
2. No other changes needed (API endpoints remain the same)

```javascript
// CHANGE THIS LINE:
// const { sendOTP, verifyOTP } = require('../services/otpService');

// TO THIS:
const { sendOTP, verifyOTP } = require('../services/interaktOTPService');

// Rest of the file remains unchanged
```

### Backend: Remove Twilio from package.json

**File**: `minuteservbackend/package.json`

**Action**: Remove `twilio` from dependencies

```bash
npm uninstall twilio
```

### Backend: Update Environment Variables

**File**: `minuteservbackend/.env`

**Remove**:
```env
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

**Add**:
```env
INTERAKT_API_KEY=your_api_key_here
INTERAKT_BASE_URL=https://api.interakt.ai/v1/public
```

### Frontend: Update LoginModal Component

**File**: `src/components/LoginModal.jsx`

**Changes Required**:

1. **Change OTP state from 6 to 4 digits**:
```javascript
// CHANGE THIS:
const [otp, setOtp] = useState(['', '', '', '', '', '']);

// TO THIS:
const [otp, setOtp] = useState(['', '', '', '']);
```

2. **Update OTP input validation**:
```javascript
// CHANGE THIS (line 53):
if (value && index < 5) {

// TO THIS:
if (value && index < 3) {
```

3. **Update paste handler**:
```javascript
// CHANGE THIS (line 74):
if (pastedData.length === 6) {

// TO THIS:
if (pastedData.length === 4) {
```

4. **Update paste handler focus**:
```javascript
// CHANGE THIS (line 78):
otpInputRefs.current[5]?.focus();

// TO THIS:
otpInputRefs.current[3]?.focus();
```

5. **Update verify OTP validation**:
```javascript
// CHANGE THIS (line 121):
if (otpValue.length !== 6) {
  setError('Please enter 6-digit OTP');
  return;
}

// TO THIS:
if (otpValue.length !== 4) {
  setError('Please enter 4-digit OTP');
  return;
}
```

6. **Update reset OTP**:
```javascript
// CHANGE THIS (line 151, 156, 173, 184):
setOtp(['', '', '', '', '', '']);

// TO THIS:
setOtp(['', '', '', '']);
```

7. **Update UI text**:
```javascript
// CHANGE THIS (line 354):
We'll send a 6-digit OTP to verify your number

// TO THIS:
We'll send a 4-digit OTP to verify your number
```

8. **Update label**:
```javascript
// CHANGE THIS (line 468):
Enter 6-digit OTP

// TO THIS:
Enter 4-digit OTP
```

9. **Update OTP input rendering**:
```javascript
// CHANGE THIS (line 478):
{otp.map((digit, index) => (

// No change needed, but ensure it renders 4 inputs
// The array length will automatically be 4 now
```

**Complete Updated LoginModal.jsx** (Key sections only):

```javascript
// Line 20: Change OTP state
const [otp, setOtp] = useState(['', '', '', '']); // Changed from 6 to 4

// Line 44-60: Update OTP change handler
const handleOtpChange = (index, value) => {
  if (!/^\d*$/.test(value)) return;

  const newOtp = [...otp];
  newOtp[index] = value.slice(-1);
  setOtp(newOtp);
  setError('');

  // Auto-focus next input (changed from index < 5 to index < 3)
  if (value && index < 3) {
    otpInputRefs.current[index + 1]?.focus();
  }

  // Auto-submit when all 4 digits are filled
  if (newOtp.every((digit) => digit !== '') && value) {
    handleVerifyOTP(newOtp.join(''));
  }
};

// Line 71-82: Update paste handler
const handleOtpPaste = (e) => {
  e.preventDefault();
  const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
  if (pastedData.length === 4) { // Changed from 6 to 4
    const newOtp = pastedData.split('');
    setOtp(newOtp);
    // Focus last input (changed from index 5 to index 3)
    otpInputRefs.current[3]?.focus();
    // Auto-verify
    setTimeout(() => handleVerifyOTP(pastedData), 100);
  }
};

// Line 120-124: Update verify validation
const handleVerifyOTP = async (otpValue = otp.join('')) => {
  if (otpValue.length !== 4) { // Changed from 6 to 4
    setError('Please enter 4-digit OTP'); // Changed message
    return;
  }
  // ... rest of function
};

// Line 151, 156, 173, 184: Update reset OTP
setOtp(['', '', '', '']); // Changed from 6 to 4

// Line 354: Update UI text
We'll send a 4-digit OTP to verify your number

// Line 468: Update label
Enter 4-digit OTP
```

---

## 🧪 Testing Plan

### Test 1: Backend - Send 4-digit OTP

```bash
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+919876543210"}'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "expires_in": 600
  }
}
```

**Verify**:
- ✅ OTP is 4 digits (check database or logs in dev mode)
- ✅ OTP stored in database
- ✅ Interakt API called successfully
- ✅ Rate limiting works

### Test 2: Backend - Verify 4-digit OTP

```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+919876543210",
    "otp_code": "1234"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "verified": true,
  "user": {
    "id": "user_123",
    "phone_number": "+919876543210"
  }
}
```

**Verify**:
- ✅ 4-digit OTP accepted
- ✅ 6-digit OTP rejected (if tested)
- ✅ Invalid OTP rejected
- ✅ Expired OTP rejected

### Test 3: Frontend - OTP Input

**Manual Testing**:
1. Open login modal
2. Enter phone number
3. Click "Send OTP"
4. Verify only 4 input boxes appear
5. Enter 4-digit OTP
6. Verify auto-submit works
7. Test paste functionality (paste 4 digits)
8. Test backspace navigation
9. Verify error messages show "4-digit OTP"

### Test 4: Integration - Complete Flow

1. User enters phone number
2. Clicks "Send OTP"
3. Receives RCS message with 4-digit OTP
4. Enters OTP in app
5. Verifies successfully
6. User logged in

---

## ⚠️ Important Notes & Considerations

### 1. RCS Availability

- ✅ **Android**: RCS works on Android devices with Google Messages
- ⚠️ **iOS**: RCS is not available on iOS (Apple uses iMessage)
- ⚠️ **Fallback**: If RCS is not available, message may not be delivered
- 💡 **Recommendation**: Monitor delivery rates and consider adding SMS fallback later if needed

### 2. OTP Security (4-digit vs 6-digit)

- ⚠️ **4-digit OTP**: 10,000 possible combinations (less secure)
- ✅ **Mitigation**: 
  - Rate limiting (3 OTPs per hour)
  - 10-minute expiry
  - One-time use (marked as verified)
  - IP-based rate limiting (if needed)

### 3. Migration Strategy

- ✅ **Backward Compatible**: API endpoints remain the same
- ✅ **Database**: No schema changes needed
- ✅ **Frontend**: Only UI changes (OTP input)
- ⚠️ **Testing**: Test thoroughly before production

### 4. Error Handling

- ✅ **Interakt API failures**: OTP still stored, user can retry
- ✅ **Rate limiting**: Clear error messages
- ✅ **Invalid OTP**: Clear error messages
- ✅ **Network errors**: Retry logic in frontend

---

## 📋 Pre-Implementation Checklist

### Account Setup
- [ ] Get Interakt account (Growth plan or higher)
- [ ] Get API key from Settings > Developer Settings
- [ ] Test API key with a test request
- [ ] Verify RCS messaging is enabled

### Code Preparation
- [ ] Review all code changes in this document
- [ ] Prepare environment variables
- [ ] Backup current Twilio implementation (git branch)
- [ ] Prepare rollback plan

### Testing Preparation
- [ ] Prepare test phone numbers
- [ ] Ensure test numbers have RCS enabled
- [ ] Prepare test scenarios
- [ ] Set up monitoring/logging

---

## 🚀 Implementation Steps (In Order)

### Step 1: Backend Setup (15 minutes)
1. Install/verify `axios` package (if not already installed)
2. Create `interaktOTPService.js` file
3. Update `authController.js` to use new service
4. Update `.env` file with Interakt credentials
5. Remove Twilio from `package.json`

### Step 2: Backend Testing (10 minutes)
1. Test OTP generation (verify 4-digit)
2. Test Interakt API call
3. Test OTP verification
4. Test error handling

### Step 3: Frontend Updates (20 minutes)
1. Update `LoginModal.jsx` - OTP state (6→4)
2. Update `LoginModal.jsx` - Validation (6→4)
3. Update `LoginModal.jsx` - UI text (6→4)
4. Update `LoginModal.jsx` - Paste handler (6→4)
5. Test OTP input component

### Step 4: Integration Testing (15 minutes)
1. Test complete flow end-to-end
2. Test with real phone numbers
3. Test error scenarios
4. Test rate limiting

### Step 5: Deployment (10 minutes)
1. Deploy backend changes
2. Deploy frontend changes
3. Monitor logs
4. Verify production flow

**Total Estimated Time**: ~70 minutes

---

## 🔍 Verification Checklist

After implementation, verify:

- [ ] ✅ Twilio completely removed from codebase
- [ ] ✅ OTP is 4 digits (not 6)
- [ ] ✅ Frontend shows 4 input boxes
- [ ] ✅ OTP generation creates 4-digit codes
- [ ] ✅ Interakt API integration works
- [ ] ✅ OTP verification accepts 4 digits
- [ ] ✅ OTP verification rejects 6 digits
- [ ] ✅ Rate limiting works (3 per hour)
- [ ] ✅ Error messages are clear
- [ ] ✅ UI text says "4-digit OTP"
- [ ] ✅ Paste functionality works (4 digits)
- [ ] ✅ Auto-submit works (4 digits)
- [ ] ✅ No webhook implementation (as requested)
- [ ] ✅ No DLT configuration (RCS only)
- [ ] ✅ Environment variables updated
- [ ] ✅ All tests pass

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: OTP not received
- **Check**: RCS availability on device
- **Check**: Interakt API response
- **Check**: Phone number format
- **Solution**: Verify Interakt account and API key

**Issue**: 4-digit OTP not accepted
- **Check**: Backend validation
- **Check**: Frontend sends correct format
- **Solution**: Verify OTP length in both frontend and backend

**Issue**: Rate limiting errors
- **Check**: Number of OTPs sent in last hour
- **Check**: Interakt rate limits
- **Solution**: Wait 1 hour or check Interakt plan limits

---

## 🎯 Success Criteria

Implementation is successful when:

1. ✅ **Twilio completely removed** - No Twilio code or dependencies
2. ✅ **4-digit OTP working** - Generation, sending, verification all use 4 digits
3. ✅ **Interakt integration** - RCS messages sent successfully
4. ✅ **Frontend updated** - 4 input boxes, correct validation
5. ✅ **No breaking changes** - Existing API endpoints work
6. ✅ **Error handling** - Clear error messages for all scenarios
7. ✅ **Testing complete** - All test cases pass
8. ✅ **Documentation** - This README is complete and accurate

---

## 📝 Engineer Accountability Statement

**As the implementing engineer, I take 100% responsibility for:**

1. ✅ **Complete Removal of Twilio**: All Twilio code, dependencies, and references removed
2. ✅ **4-digit OTP Implementation**: Backend generates 4-digit OTPs, frontend accepts 4 digits
3. ✅ **Interakt Integration**: Proper API integration with error handling
4. ✅ **Code Quality**: Clean, maintainable, well-documented code
5. ✅ **Testing**: Comprehensive testing of all scenarios
6. ✅ **Documentation**: This README is accurate and complete
7. ✅ **Deployment**: Safe deployment with rollback plan
8. ✅ **Monitoring**: Post-deployment monitoring and issue resolution

**I will ensure:**
- All code changes are tested before deployment
- All edge cases are handled
- Error messages are user-friendly
- Performance is maintained or improved
- Security best practices are followed
- The implementation matches this specification exactly

---

**Last Updated**: 2024  
**Version**: 2.0.0  
**Status**: Ready for Implementation Approval  
**Engineer**: Awaiting Approval to Proceed
