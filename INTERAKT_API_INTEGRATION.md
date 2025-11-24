# Interakt API Integration Guide

## 📋 Overview

Interakt provides Public APIs that allow you to send Rich Communication Services (RCS) messages with SMS fallback to your customers. This integration enables you to send interactive carousel messages via WhatsApp/RCS, with automatic SMS fallback if the RCS message fails to deliver.

### Key Features
- ✅ **RCS Carousel Messages**: Send rich, interactive card-based messages
- ✅ **SMS Fallback**: Automatic fallback to SMS if RCS delivery fails
- ✅ **Template Support**: Use pre-configured templates for consistent messaging
- ✅ **Webhook Callbacks**: Receive delivery status and user interactions
- ✅ **Rate Limiting**: Built-in rate limits based on your plan

---

## 🔑 Authentication

### Getting Your API Key

1. Log in to your Interakt dashboard
2. Navigate to **Settings > Developer Settings**
3. Copy your **API Key**

### Using the API Key

All API requests require Basic Authentication:

```
Authorization: Basic {{YOUR_API_KEY}}
```

**Note**: Replace `{{YOUR_API_KEY}}` with your actual API key from the dashboard.

---

## 📊 Rate Limits

Interakt enforces rate limits based on your subscription plan:

| Plan | Rate Limit |
|------|------------|
| **Growth** | 300 requests/minute |
| **Advanced** | 600 requests/minute |
| **Enterprise** | Configurable as per Meta's allowed rate limit |
| **Starter** | ❌ Public APIs not accessible |

### Handling Rate Limits

If you exceed the rate limit, you'll receive:
- **Status Code**: `429`
- **Error Message**: `Rate limit exceeded for this resource`

**Best Practice**: Implement retry logic with exponential backoff to handle rate limit errors gracefully.

---

## 🚀 API Endpoints

### Base URL
```
https://api.interakt.ai/v1/public/rcs/message/
```

---

## 📤 Sending RCS Messages

### 1. Standalone Carousel Message

Send a custom carousel message with SMS fallback.

#### Request Headers
```http
Authorization: Basic {{YOUR_API_KEY}}
Content-Type: application/json
```

#### Request Body
```json
{
    "countryCode": "+91",
    "phoneNumber": "9999999999",
    "message": {
        "richCardDetails": {
            "standalone": {
                "cardOrientation": "VERTICAL",
                "content": {
                    "cardTitle": "This is card title",
                    "cardDescription": "This is card description",
                    "cardMedia": {
                        "mediaHeight": "TALL",
                        "contentInfo": {
                            "fileUrl": "http://www.google.com/logos/doodles/2015/googles-new-logo-5078286822539264.3-hp2x.gif"
                        }
                    },
                    "suggestions": [
                        {
                            "reply": {
                                "plainText": "Suggestion #1",
                                "postBack": {
                                    "data": "suggestion_1"
                                }
                            }
                        },
                        {
                            "reply": {
                                "plainText": "Suggestion #2",
                                "postBack": {
                                    "data": "suggestion_2"
                                }
                            }
                        }
                    ]
                }
            }
        }
    },
    "type": "STANDALONE_CAROUSEL",
    "fallback": [
        {
            "channel": "sms",
            "sender_id": "INTRKT",
            "pe_id": "1201159195599372920",
            "provider_name": "default",
            "content": {
                "message": "Dear Customer, {{1}} is your OTP for logging into Interakt. For your security, do not share this code.",
                "dlt_te_id": "1107174012164676172",
                "variables": [
                    "123456"
                ]
            }
        }
    ]
}
```

#### Response
```json
{
    "result": true,
    "message": "Message queued for sending via Interakt. Check webhook for delivery status",
    "id": "272908a4-46ed-4ab5-97a2-cb15a61058e5"
}
```

#### cURL Example
```bash
curl --location 'https://api.interakt.ai/v1/public/rcs/message/' \
--header 'Authorization: Basic {{YOUR_API_KEY}}' \
--header 'Content-Type: application/json' \
--data '{
    "countryCode": "+91",
    "phoneNumber": "9999999999",
    "message": {
        "richCardDetails": {
            "standalone": {
                "cardOrientation": "VERTICAL",
                "content": {
                    "cardTitle": "This is card title",
                    "cardDescription": "This is card description",
                    "cardMedia": {
                        "mediaHeight": "TALL",
                        "contentInfo": {
                            "fileUrl": "http://www.google.com/logos/doodles/2015/googles-new-logo-5078286822539264.3-hp2x.gif"
                        }
                    },
                    "suggestions": [
                        {
                            "reply": {
                                "plainText": "Suggestion #1",
                                "postBack": {
                                    "data": "suggestion_1"
                                }
                            }
                        }
                    ]
                }
            }
        }
    },
    "type": "STANDALONE_CAROUSEL",
    "fallback": [
        {
            "channel": "sms",
            "sender_id": "INTRKT",
            "pe_id": "1201159195599372920",
            "provider_name": "default",
            "content": {
                "message": "Dear Customer, {{1}} is your OTP for logging into Interakt. For your security, do not share this code.",
                "dlt_te_id": "1107174012164676172",
                "variables": [
                    "123456"
                ]
            }
        }
    ]
}'
```

---

### 2. Template-Based Carousel Message

Send a carousel message using a pre-configured template.

#### Request Body
```json
{
    "countryCode": "+91",
    "phoneNumber": "9999999999",
    "template": {
        "name": "rcs_carousel_variable_template",
        "languageCode": "en",
        "carouselCards": [
            {
                "bodyValues": [
                    "Hi there"
                ]
            },
            {
                "bodyValues": [
                    "Hi there Card 2"
                ]
            }
        ]
    },
    "type": "Template",
    "campaignId": "a9628c93-4240-49a0-9f9e-9e922094eed1",
    "fallback": [
        {
            "channel": "sms",
            "sender_id": "INTRKT",
            "pe_id": "1201159195599372920",
            "provider_name": "default",
            "content": {
                "message": "Dear Customer, {{1}} is your OTP for logging into Interakt. For your security, do not share this code.",
                "dlt_te_id": "1107174012164676172",
                "variables": [
                    "123456"
                ]
            }
        }
    ]
}
```

#### Response
```json
{
    "result": true,
    "message": "Message queued for sending via Interakt. Check webhook for delivery status",
    "id": "272908a4-46ed-4ab5-97a2-cb28a61058e5"
}
```

---

## 📥 Webhooks & Callbacks

Interakt sends webhook events to your configured webhook URL for:
- User messages (suggested actions, replies, P2A messages)
- User events (message read, clicks, etc.)
- Server events (delivery status, revocations, etc.)

### Webhook Configuration

Configure your webhook URL in the Interakt dashboard to receive these events.

### Sample Webhook Payloads

#### 1. User Message (Suggested Response)
```json
{
    "userPhoneNumber": "+9193218*****",
    "botId": "6544c5b408febf98e5fc5ec4",
    "entityType": "USER_MESSAGE",
    "entity": {
        "messageId": "MxTcYxYyXrTKS=o46jMjDJPQ",
        "sendTime": "2023-11-10T14:40:50.263298Z",
        "text": "",
        "userFile": null,
        "location": null,
        "suggestionResponse": {
            "postBack": {
                "data": "SR1L1C1"
            },
            "plainText": "",
            "type": "REPLY"
        }
    }
}
```

#### 2. User Message (P2A - Person to Assistant)
```json
{
    "userPhoneNumber": "+9193218*****",
    "botId": "6544c5b408febf98e5fc5ec4",
    "entityType": "USER_MESSAGE",
    "entity": {
        "messageId": "MxhVHQKZTxRkewsJQbKLsw9Q",
        "sendTime": "2023-11-10T14:38:38.105815Z",
        "text": "Hi",
        "userFile": null,
        "location": null,
        "suggestionResponse": null
    }
}
```

#### 3. Server Event (TTL Expiration Revoked)
```json
{
    "userPhoneNumber": "+9172004*****",
    "botId": "663a128464ee1034bb02ed7b",
    "entityType": "SERVER_EVENT",
    "entity": {
        "eventType": "TTL_EXPIRATION_REVOKED",
        "messageId": "77573603-2d32-481b-9442-c1ae5eace4a9",
        "sendTime": "2024-07-26T06:03:13.654Z",
        "phoneNumber": "+9172004*****",
        "eventId": "MxJ079=XIMR725MdGiofzEvA"
    }
}
```

#### 4. User Event (Message Read)
```json
{
    "userPhoneNumber": "+9198898*****",
    "botId": "651e8ec13800f6c7dee587c4",
    "entityType": "USER_EVENT",
    "entity": {
        "eventType": "MESSAGE_READ",
        "messageId": "ec ca1e-3293-49f9-896e-bbfaa3b13782",
        "sendTime": "2023-10-09T10:20:20.849997Z",
        "senderPhoneNumber": "+9198898*****",
        "eventId": "MxGP3uTVItTTmmTug5n9CBsw"
    }
}
```

---

## 🔧 Implementation Guide

### Step 1: Get Your API Key

1. Log in to Interakt dashboard
2. Go to **Settings > Developer Settings**
3. Copy your API key

### Step 2: Configure Environment Variables

Add to your `.env` file:

```env
INTERAKT_API_KEY=your_api_key_here
INTERAKT_BASE_URL=https://api.interakt.ai/v1/public
```

### Step 3: Set Up SMS Fallback (DLT Registration)

For SMS fallback to work in India, you need:

1. **DLT Sender ID**: Your registered sender ID
2. **PE ID**: Provider Entity ID
3. **DLT Template ID**: Pre-approved template ID
4. **Template Variables**: Variables used in your template

**Note**: Contact Interakt support team for `provider_name` details.

### Step 4: Create Service/Utility

Create a service file to handle Interakt API calls:

```javascript
// minuteservbackend/src/services/interaktService.js

const axios = require('axios');
const logger = require('../utils/logger');

const INTERAKT_BASE_URL = process.env.INTERAKT_BASE_URL || 'https://api.interakt.ai/v1/public';
const INTERAKT_API_KEY = process.env.INTERAKT_API_KEY;

/**
 * Send RCS carousel message with SMS fallback
 * @param {string} countryCode - Country code (e.g., "+91")
 * @param {string} phoneNumber - Phone number without country code
 * @param {Object} messageData - Message content
 * @param {Array} fallbackConfig - SMS fallback configuration
 * @returns {Promise<Object>} API response
 */
async function sendRCSMessage(countryCode, phoneNumber, messageData, fallbackConfig) {
    try {
        const url = `${INTERAKT_BASE_URL}/rcs/message/`;
        
        const payload = {
            countryCode,
            phoneNumber,
            ...messageData,
            fallback: fallbackConfig
        };

        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Basic ${INTERAKT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        logger.info(`RCS message sent successfully. ID: ${response.data.id}`);
        return {
            success: true,
            messageId: response.data.id,
            message: response.data.message
        };
    } catch (error) {
        logger.error('Interakt API error:', error.response?.data || error.message);
        
        // Handle rate limiting
        if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please retry after some time.');
        }
        
        throw error;
    }
}

/**
 * Send booking confirmation via RCS
 * @param {string} phoneNumber - Full phone number with country code
 * @param {Object} bookingDetails - Booking information
 * @returns {Promise<Object>} API response
 */
async function sendBookingConfirmation(phoneNumber, bookingDetails) {
    const countryCode = phoneNumber.substring(0, 3); // Extract country code
    const number = phoneNumber.substring(3); // Extract number
    
    const messageData = {
        type: "STANDALONE_CAROUSEL",
        message: {
            richCardDetails: {
                standalone: {
                    cardOrientation: "VERTICAL",
                    content: {
                        cardTitle: `Booking Confirmed - ${bookingDetails.serviceName}`,
                        cardDescription: `Your booking for ${bookingDetails.serviceName} on ${bookingDetails.date} at ${bookingDetails.time} is confirmed.`,
                        cardMedia: {
                            mediaHeight: "TALL",
                            contentInfo: {
                                fileUrl: bookingDetails.imageUrl || "https://example.com/default-image.jpg"
                            }
                        },
                        suggestions: [
                            {
                                reply: {
                                    plainText: "View Details",
                                    postBack: {
                                        data: `booking_${bookingDetails.id}`
                                    }
                                }
                            },
                            {
                                reply: {
                                    plainText: "Cancel Booking",
                                    postBack: {
                                        data: `cancel_${bookingDetails.id}`
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        }
    };

    const fallbackConfig = [
        {
            channel: "sms",
            sender_id: process.env.DLT_SENDER_ID,
            pe_id: process.env.DLT_PE_ID,
            provider_name: "default",
            content: {
                message: `Your booking for ${bookingDetails.serviceName} on ${bookingDetails.date} at ${bookingDetails.time} is confirmed. Booking ID: ${bookingDetails.id}`,
                dlt_te_id: process.env.DLT_TEMPLATE_ID,
                variables: [
                    bookingDetails.serviceName,
                    bookingDetails.date,
                    bookingDetails.time,
                    bookingDetails.id
                ]
            }
        }
    ];

    return await sendRCSMessage(countryCode, number, messageData, fallbackConfig);
}

/**
 * Send OTP via RCS with SMS fallback
 * @param {string} phoneNumber - Full phone number with country code
 * @param {string} otpCode - OTP code to send
 * @returns {Promise<Object>} API response
 */
async function sendOTP(phoneNumber, otpCode) {
    const countryCode = phoneNumber.substring(0, 3);
    const number = phoneNumber.substring(3);
    
    const messageData = {
        type: "STANDALONE_CAROUSEL",
        message: {
            richCardDetails: {
                standalone: {
                    cardOrientation: "VERTICAL",
                    content: {
                        cardTitle: "Your OTP Code",
                        cardDescription: `Your OTP for MinServe is ${otpCode}. Valid for 10 minutes.`,
                        suggestions: [
                            {
                                reply: {
                                    plainText: "Verify OTP",
                                    postBack: {
                                        data: `verify_otp_${otpCode}`
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        }
    };

    const fallbackConfig = [
        {
            channel: "sms",
            sender_id: process.env.DLT_SENDER_ID,
            pe_id: process.env.DLT_PE_ID,
            provider_name: "default",
            content: {
                message: `Dear Customer, ${otpCode} is your OTP for logging into MinServe. For your security, do not share this code.`,
                dlt_te_id: process.env.DLT_OTP_TEMPLATE_ID,
                variables: [otpCode]
            }
        }
    ];

    return await sendRCSMessage(countryCode, number, messageData, fallbackConfig);
}

module.exports = {
    sendRCSMessage,
    sendBookingConfirmation,
    sendOTP
};
```

### Step 5: Create Webhook Handler

```javascript
// minuteservbackend/src/controllers/interaktWebhookController.js

const logger = require('../utils/logger');

/**
 * Handle Interakt webhook events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleWebhook(req, res) {
    try {
        const { userPhoneNumber, botId, entityType, entity } = req.body;

        logger.info(`Received webhook: ${entityType} from ${userPhoneNumber}`);

        switch (entityType) {
            case 'USER_MESSAGE':
                await handleUserMessage(userPhoneNumber, entity);
                break;
            
            case 'USER_EVENT':
                await handleUserEvent(userPhoneNumber, entity);
                break;
            
            case 'SERVER_EVENT':
                await handleServerEvent(userPhoneNumber, entity);
                break;
            
            default:
                logger.warn(`Unknown entity type: ${entityType}`);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        logger.error('Webhook handler error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function handleUserMessage(phoneNumber, entity) {
    // Handle user messages (suggested responses, P2A messages)
    if (entity.suggestionResponse) {
        const postBackData = entity.suggestionResponse.postBack?.data;
        logger.info(`User clicked suggestion: ${postBackData}`);
        
        // Handle different postBack actions
        if (postBackData?.startsWith('booking_')) {
            // Handle booking view action
        } else if (postBackData?.startsWith('cancel_')) {
            // Handle booking cancellation
        } else if (postBackData?.startsWith('verify_otp_')) {
            // Handle OTP verification
        }
    } else if (entity.text) {
        // Handle text message from user
        logger.info(`User sent text: ${entity.text}`);
    }
}

async function handleUserEvent(phoneNumber, entity) {
    // Handle user events (message read, etc.)
    if (entity.eventType === 'MESSAGE_READ') {
        logger.info(`Message read: ${entity.messageId}`);
        // Update message status in database
    }
}

async function handleServerEvent(phoneNumber, entity) {
    // Handle server events (delivery status, revocations, etc.)
    logger.info(`Server event: ${entity.eventType} for message ${entity.messageId}`);
    
    if (entity.eventType === 'TTL_EXPIRATION_REVOKED') {
        // Handle message expiration
    }
}

module.exports = {
    handleWebhook
};
```

### Step 6: Add Route

```javascript
// minuteservbackend/src/routes/interaktRoutes.js

const express = require('express');
const router = express.Router();
const { handleWebhook } = require('../controllers/interaktWebhookController');

// Webhook endpoint for Interakt callbacks
router.post('/webhook', handleWebhook);

module.exports = router;
```

---

## 📝 Field Reference

### Card Content
| Field | Type | Description |
|-------|------|-------------|
| `cardTitle` | string | Title of the card |
| `cardDescription` | string | Description text |
| `cardMedia` | object | Media content (image/video) |
| `suggestions` | array | Action buttons (max 4) |

### Carousel Cards
| Field | Type | Description |
|-------|------|-------------|
| `cardWidth` | enum | `SMALL_WIDTH` or `MEDIUM_WIDTH` |
| `contents` | array | Array of card contents |

### SMS Fallback
| Field | Type | Description |
|-------|------|-------------|
| `channel` | string | Must be `"sms"` |
| `sender_id` | string | Your DLT SMS Sender ID |
| `pe_id` | string | Your DLT Provider Entity ID |
| `provider_name` | string | Usually `"default"` (check with Interakt) |
| `dlt_te_id` | string | Your DLT Template ID |
| `variables` | array | Values for template variables |

---

## ⚠️ Important Notes

### 1. DLT Registration (India)
- SMS fallback requires DLT registration in India
- You need pre-approved templates from DLT provider
- Contact Interakt support for `provider_name` details

### 2. Rate Limiting
- Implement exponential backoff for 429 errors
- Monitor your usage to stay within plan limits
- Consider queuing messages during high traffic

### 3. Phone Number Format
- Always include country code (e.g., `+91`)
- Separate country code and phone number in API calls
- Format: `countryCode: "+91"`, `phoneNumber: "9999999999"`

### 4. Message Delivery
- RCS messages are queued, not sent immediately
- Check webhook for delivery status
- SMS fallback triggers automatically if RCS fails

### 5. Suggestions Limit
- Maximum 4 suggestions per card
- Each suggestion can have a `postBack` data field
- Use `postBack.data` to identify user actions in webhooks

---

## 🧪 Testing

### Test RCS Message Send

```bash
curl --location 'https://api.interakt.ai/v1/public/rcs/message/' \
--header 'Authorization: Basic YOUR_API_KEY' \
--header 'Content-Type: application/json' \
--data '{
    "countryCode": "+91",
    "phoneNumber": "YOUR_TEST_NUMBER",
    "message": {
        "richCardDetails": {
            "standalone": {
                "cardOrientation": "VERTICAL",
                "content": {
                    "cardTitle": "Test Message",
                    "cardDescription": "This is a test message from MinServe"
                }
            }
        }
    },
    "type": "STANDALONE_CAROUSEL"
}'
```

### Test Webhook Endpoint

```bash
curl -X POST http://localhost:3000/api/v1/interakt/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "userPhoneNumber": "+919999999999",
    "botId": "test_bot_id",
    "entityType": "USER_MESSAGE",
    "entity": {
        "messageId": "test_message_id",
        "sendTime": "2024-01-01T00:00:00Z",
        "text": "Test message"
    }
}'
```

---

## 🔗 Resources

- **Interakt Dashboard**: https://app.interakt.ai
- **API Documentation**: Check Interakt dashboard for latest docs
- **Support**: Contact Interakt support team for DLT and provider details

---

## 📞 Support

For issues or questions:
1. Check Interakt dashboard documentation
2. Contact Interakt support team
3. Review webhook logs for delivery status

---

**Last Updated**: 2024
**Version**: 1.0.0


