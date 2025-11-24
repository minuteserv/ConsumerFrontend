# Interakt OTP Implementation Prompt

## Objective
Replace Twilio SMS OTP with Interakt RCS OTP, change from 6-digit to 4-digit OTP, remove all Twilio dependencies.

## Requirements
1. Remove Twilio completely (code, dependencies, env variables)
2. Change OTP from 6-digit to 4-digit
3. Use Interakt RCS only (no SMS fallback, no DLT)
4. No webhook implementation
5. Maintain existing API endpoints
6. Update frontend OTP input from 6 to 4 digits

---

## BACKEND IMPLEMENTATION

### Step 1: Create Interakt OTP Service
**File**: `minuteservbackend/src/services/interaktOTPService.js`

**Create new file with:**
- 4-digit OTP generation: `Math.floor(1000 + Math.random() * 9000).toString()`
- `sendOTP(phoneNumber)` function using Interakt RCS API
- `verifyOTP(phoneNumber, otpCode)` function with 4-digit validation
- `generateOTP()` function for 4 digits
- `cleanupExpiredOTPs()` function
- Rate limiting: 3 OTPs per hour per number
- Phone number formatting for Interakt API
- Interakt API call to `https://api.interakt.ai/v1/public/rcs/message/`
- RCS payload (no SMS fallback array)
- Error handling for Interakt API
- Store OTP in database before sending

**Interakt API Payload Structure:**
```javascript
{
  countryCode: "+91",
  phoneNumber: "9876543210",
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
}
```

**Headers:**
```javascript
{
  'Authorization': `Basic ${INTERAKT_API_KEY}`,
  'Content-Type': 'application/json'
}
```

### Step 2: Update Auth Controller
**File**: `minuteservbackend/src/controllers/authController.js`

**Change:**
- Replace `require('../services/otpService')` with `require('../services/interaktOTPService')`
- No other changes needed (endpoints remain same)

### Step 3: Remove Twilio
**Actions:**
1. Run: `cd minuteservbackend && npm uninstall twilio`
2. Remove from `package.json` if still present
3. Remove Twilio env variables from `.env`:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

### Step 4: Add Interakt Environment Variables
**File**: `minuteservbackend/.env`

**Add:**
```env
INTERAKT_API_KEY=your_api_key_here
INTERAKT_BASE_URL=https://api.interakt.ai/v1/public
```

---

## FRONTEND IMPLEMENTATION

### Step 5: Update LoginModal Component
**File**: `src/components/LoginModal.jsx`

**Changes Required:**

1. **Line 20: OTP State**
   - Change: `const [otp, setOtp] = useState(['', '', '', '', '', '']);`
   - To: `const [otp, setOtp] = useState(['', '', '', '']);`

2. **Line 53: Auto-focus next input**
   - Change: `if (value && index < 5) {`
   - To: `if (value && index < 3) {`

3. **Line 74: Paste handler length check**
   - Change: `if (pastedData.length === 6) {`
   - To: `if (pastedData.length === 4) {`

4. **Line 78: Paste handler focus**
   - Change: `otpInputRefs.current[5]?.focus();`
   - To: `otpInputRefs.current[3]?.focus();`

5. **Line 121-124: Verify OTP validation**
   - Change: `if (otpValue.length !== 6) { setError('Please enter 6-digit OTP'); return; }`
   - To: `if (otpValue.length !== 4) { setError('Please enter 4-digit OTP'); return; }`

6. **Line 151, 156, 173, 184: Reset OTP**
   - Change all: `setOtp(['', '', '', '', '', '']);`
   - To: `setOtp(['', '', '', '']);`

7. **Line 354: UI text**
   - Change: `We'll send a 6-digit OTP to verify your number`
   - To: `We'll send a 4-digit OTP to verify your number`

8. **Line 468: Label text**
   - Change: `Enter 6-digit OTP`
   - To: `Enter 4-digit OTP`

---

## TESTING CHECKLIST

### Backend Tests
- [ ] Test OTP generation returns 4 digits
- [ ] Test Interakt API call succeeds
- [ ] Test OTP stored in database
- [ ] Test OTP verification accepts 4 digits
- [ ] Test OTP verification rejects 6 digits
- [ ] Test rate limiting (3 per hour)
- [ ] Test expired OTP rejection
- [ ] Test invalid OTP rejection

### Frontend Tests
- [ ] Test OTP input shows 4 boxes (not 6)
- [ ] Test entering 4 digits works
- [ ] Test paste 4 digits works
- [ ] Test auto-submit on 4 digits
- [ ] Test backspace navigation
- [ ] Test error message shows "4-digit OTP"
- [ ] Test UI text says "4-digit OTP"

### Integration Tests
- [ ] Test complete flow: send → receive → verify
- [ ] Test with real phone number
- [ ] Test error scenarios
- [ ] Test rate limiting behavior

---

## VERIFICATION

After implementation, verify:
- [ ] Twilio package removed from package.json
- [ ] Twilio code removed from otpService.js (file should not exist or be replaced)
- [ ] interaktOTPService.js created and working
- [ ] OTP generation creates 4-digit codes
- [ ] Frontend shows 4 input boxes
- [ ] All "6-digit" text changed to "4-digit"
- [ ] Interakt API integration works
- [ ] Environment variables updated
- [ ] No webhook code added
- [ ] No DLT/SMS fallback code added

---

## ROLLBACK PLAN

If issues occur:
1. Revert git changes
2. Restore Twilio service file
3. Restore frontend OTP state to 6 digits
4. Restore environment variables

---

## IMPLEMENTATION ORDER

1. Create `interaktOTPService.js` (backend)
2. Update `authController.js` (backend)
3. Remove Twilio package (backend)
4. Update environment variables (backend)
5. Update `LoginModal.jsx` (frontend)
6. Test backend
7. Test frontend
8. Test integration
9. Deploy

---

## KEY CODE SNIPPETS

### 4-digit OTP Generation
```javascript
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
```

### Interakt API Call
```javascript
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
```

### 4-digit Validation
```javascript
if (!/^\d{4}$/.test(otpCode)) {
  throw new Error('OTP must be 4 digits');
}
```

---

**Status**: Ready for Implementation
**Estimated Time**: 70 minutes
**Priority**: High


