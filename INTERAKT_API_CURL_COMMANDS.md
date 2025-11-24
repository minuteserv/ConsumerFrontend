# Interakt API - Direct cURL Commands

## 🔑 Authentication

**API Key**: `MnBuRnJQNlgxLVRKUTNkQVp1X2pzZjF2VnlXcXp3eVltdlJ5cmFuQWZhdzo=`

**Base URL**: `https://api.interakt.ai/v1/public/message/`

**Authentication**: `Authorization: Basic {YOUR_API_KEY}`

---

## 📤 Send OTP via WhatsApp (Text Message)

### Current Implementation (Text Type)

```bash
curl -X POST 'https://api.interakt.ai/v1/public/message/' \
  -H 'Authorization: Basic MnBuRnJQNlgxLVRKUTNkQVp1X2pzZjF2VnlXcXp3eVltdlJ5cmFuQWZhdzo=' \
  -H 'Content-Type: application/json' \
  -d '{
    "countryCode": "+91",
    "phoneNumber": "7003848501",
    "type": "Text",
    "data": {
      "message": "Your OTP for MinServe is 123456. Valid for 10 minutes. Do not share this code with anyone."
    }
  }'
```

### Expected Response (Success):
```json
{
  "result": true,
  "message": "Message queued for sending",
  "id": "message-id-here"
}
```

### Expected Response (Error - Customer not available):
```json
{
  "result": false,
  "message": "Please correct the following error - Customer is not available for the organization"
}
```

### Expected Response (Error - 24 hour window):
```json
{
  "result": false,
  "message": "Please correct the following error - Customer has not messaged within last 24 hours"
}
```

---

## 📤 Send OTP via WhatsApp (Template Message)

### For When Template is Ready

**Note**: Replace `"Auth"` with your actual template name after it's approved and synced.

```bash
curl -X POST 'https://api.interakt.ai/v1/public/message/' \
  -H 'Authorization: Basic MnBuRnJQNlgxLVRKUTNkQVp1X2pzZjF2VnlXcXp3eVltdlJ5cmFuQWZhdzo=' \
  -H 'Content-Type: application/json' \
  -d '{
    "countryCode": "+91",
    "phoneNumber": "7003848501",
    "type": "Template",
    "template": {
      "name": "Auth",
      "languageCode": "en",
      "bodyValues": ["123456"]
    }
  }'
```

### Expected Response (Success):
```json
{
  "result": true,
  "message": "Message queued for sending",
  "id": "message-id-here"
}
```

### Expected Response (Error - Template not found):
```json
{
  "result": false,
  "message": "Please correct the following error - No approved template found with name 'Auth' and language 'en'. Please re-sync on Interakt dashboard and try again"
}
```

---

## 🔍 Test Different Scenarios

### Test 1: Check if API Key is Valid
```bash
curl -X POST 'https://api.interakt.ai/v1/public/message/' \
  -H 'Authorization: Basic MnBuRnJQNlgxLVRKUTNkQVp1X2pzZjF2VnlXcXp3eVltdlJ5cmFuQWZhdzo=' \
  -H 'Content-Type: application/json' \
  -d '{
    "countryCode": "+91",
    "phoneNumber": "7003848501",
    "type": "Text",
    "data": {
      "message": "Test message"
    }
  }'
```

### Test 2: Test with Different Phone Number
```bash
curl -X POST 'https://api.interakt.ai/v1/public/message/' \
  -H 'Authorization: Basic MnBuRnJQNlgxLVRKUTNkQVp1X2pzZjF2VnlXcXp3eVltdlJ5cmFuQWZhdzo=' \
  -H 'Content-Type: application/json' \
  -d '{
    "countryCode": "+91",
    "phoneNumber": "YOUR_TEST_NUMBER",
    "type": "Text",
    "data": {
      "message": "Your OTP for MinServe is 123456. Valid for 10 minutes."
    }
  }'
```

---

## ⚠️ Important Notes

1. **OTP Verification**: Interakt API only **sends** the OTP. Verification is done on **your backend** using the `/api/v1/auth/verify-otp` endpoint.

2. **Template vs Text**:
   - **Text**: Requires customer to have messaged within 24 hours
   - **Template**: Can send to any customer (once template is approved)

3. **Common Errors**:
   - `Customer is not available` → Add contact in Interakt Dashboard
   - `Customer has not messaged within last 24 hours` → Use Template type instead
   - `Invalid token provided` → Check API key
   - `Template not found` → Sync template in Interakt Dashboard

4. **Rate Limits**: 
   - Growth Plan: 300 requests/minute
   - Advanced Plan: 600 requests/minute

---

## 🔄 Complete Flow

### Step 1: Send OTP (Interakt API)
```bash
curl -X POST 'https://api.interakt.ai/v1/public/message/' \
  -H 'Authorization: Basic MnBuRnJQNlgxLVRKUTNkQVp1X2pzZjF2VnlXcXp3eVltdlJ5cmFuQWZhdzo=' \
  -H 'Content-Type: application/json' \
  -d '{
    "countryCode": "+91",
    "phoneNumber": "7003848501",
    "type": "Text",
    "data": {
      "message": "Your OTP for MinServe is 123456. Valid for 10 minutes."
    }
  }'
```

### Step 2: Verify OTP (Your Backend API)
```bash
curl -X POST 'http://localhost:3000/api/v1/auth/verify-otp' \
  -H 'Content-Type: application/json' \
  -d '{
    "phone_number": "+917003848501",
    "otp_code": "123456"
  }'
```

---

## 📝 Environment Variables

Make sure these are set in your `.env`:
```env
INTERAKT_API_KEY=MnBuRnJQNlgxLVRKUTNkQVp1X2pzZjF2VnlXcXp3eVltdlJ5cmFuQWZhdzo=
INTERAKT_BASE_URL=https://api.interakt.ai/v1/public
```

---

**Last Updated**: 2025-11-15


