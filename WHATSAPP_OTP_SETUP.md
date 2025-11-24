# WhatsApp OTP Setup Guide - Interakt

## 🚨 Current Status

**Issue**: OTP is being generated and returned in API response, but not delivered via WhatsApp.

**Reason**: WhatsApp Business API requires either:
1. **Pre-approved templates** for first-time messages, OR
2. **Customer must initiate contact first** (24-hour window)

## ✅ Current Implementation

The code is **correctly implemented** and working. The OTP is:
- ✅ Generated (6-digit)
- ✅ Stored in database
- ✅ Returned in API response (for testing)
- ⚠️ Not delivered via WhatsApp (requires template setup)

## 🔧 Solution: Set Up WhatsApp Template

### Step 1: Create OTP Template in Facebook Business Manager

1. Go to [Facebook Business Manager](https://business.facebook.com/)
2. Navigate to **WhatsApp > Message Templates**
3. Click **Create Template**
4. Select **Authentication** category
5. Fill in template details:
   - **Name**: `otp_verification` (or your preferred name)
   - **Language**: English
   - **Category**: Authentication
   - **Body**: `Your OTP for MinServe is {{1}}. Valid for 10 minutes. Do not share this code with anyone.`
   - **Footer**: (Optional) `MinServe`
6. Submit for approval (usually takes 15 minutes to 24 hours)

### Step 2: Sync Template in Interakt

1. Go to [Interakt Dashboard](https://app.interakt.ai)
2. Navigate to **Templates**
3. Click **Sync** to import templates from Facebook
4. Verify your `otp_verification` template appears

### Step 3: Update Code to Use Template

Once template is approved, update `interaktOTPService.js`:

```javascript
// Replace the Text payload with Template payload:
const payload = {
  countryCode,
  phoneNumber: number,
  type: "Template",
  template: {
    name: "otp_verification", // Your approved template name
    languageCode: "en",
    bodyValues: [otpCode] // OTP value as array
  }
};
```

## 📱 Alternative: Add Contact First

If you don't want to use templates, you can:

1. Go to Interakt Dashboard > **Contacts**
2. Click **Add Contact**
3. Enter phone number: `+917003848501`
4. Save contact
5. Now you can send direct messages (within 24-hour window)

## 🧪 Testing

### Current Behavior (Development Mode):
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "expires_in": 600,
    "warning": "WhatsApp channel issue. OTP returned for testing purposes only.",
    "otp_code": "123456"
  }
}
```

### After Template Setup:
- OTP will be delivered via WhatsApp
- `otp_code` will only be returned in development mode
- No warning message

## 📚 Resources

- [Interakt WhatsApp Authentication Template Guide](https://www.interakt.shop/resource-center/send-whatsapp-authentication-template/)
- [Facebook Business Manager](https://business.facebook.com/)
- [Interakt Dashboard](https://app.interakt.ai)

## ⚠️ Important Notes

1. **Template Approval**: Templates must be approved by Meta before use (15 min - 24 hours)
2. **Template Name**: Must match exactly in code and Interakt dashboard
3. **Language Code**: Use `"en"` for English
4. **Body Values**: OTP must be passed as array: `[otpCode]`
5. **First Message**: Can only use templates (not direct text) for new customers

## 🎯 Quick Fix for Testing

For now, you can:
1. Use the `otp_code` from API response to test verification
2. Set up the template for production use
3. Once template is approved, update the code to use Template type

---

**Status**: Code is ready, waiting for template approval in Interakt/Facebook.


