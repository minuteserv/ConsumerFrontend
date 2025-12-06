# MinServe Partner App

Partner web application for service technicians to manage bookings, track earnings, and complete services.

## Features

- **OTP Authentication**: Login using phone number and OTP
- **Partner Registration**: New partners can register with basic details
- **Dashboard**: View earnings, stats, and upcoming bookings
- **Booking Management**: View all bookings (upcoming, past, all)
- **Service Execution**: 
  - Accept/Reject bookings
  - OTP verification to start service
  - Timer showing service duration
  - Swipe to complete booking
- **Responsive Design**: Works on mobile and desktop (ready for React Native conversion)

## Tech Stack

- React 18
- React Router DOM
- Tailwind CSS
- Vite
- Radix UI Components

## Setup

1. Install dependencies:
```bash
npm install
# or
pnpm install
```

2. Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

3. Run development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5178`

## Project Structure

```
src/
├── components/
│   └── ui/          # Reusable UI components
├── contexts/
│   └── AuthContext.jsx  # Authentication context
├── lib/
│   ├── api.js          # API functions
│   ├── apiClient.js   # API client
│   ├── constants.js    # Constants and endpoints
│   ├── formatters.js   # Formatting utilities
│   ├── otp.js          # OTP functions
│   └── utils.js        # Utility functions
├── pages/
│   ├── Login.jsx       # Login/Registration page
│   ├── Dashboard.jsx   # Dashboard with stats
│   ├── Bookings.jsx    # Bookings list page
│   └── BookingDetail.jsx # Booking detail with OTP, timer, swipe
├── App.jsx            # Main app component
└── main.jsx           # Entry point
```

## Backend API Requirements

The following backend APIs need to be implemented:

### Partner Authentication

#### 1. Send OTP
```
POST /api/v1/partner/auth/send-otp
Body: {
  phone_number: string (e.g., "+919876543210")
}
Response: {
  success: boolean,
  message: string,
  expires_in: number,
  otp_code?: string (only in development)
}
```

#### 2. Verify OTP (Login)
```
POST /api/v1/partner/auth/verify-otp
Body: {
  phone_number: string,
  otp_code: string
}
Response: {
  success: boolean,
  partner?: {
    id: uuid,
    partner_code: string,
    name: string,
    phone_number: string,
    email?: string,
    is_active: boolean,
    is_available: boolean,
    rating: number,
    total_bookings: number,
    total_earnings: number,
    pending_payout: number,
    service_categories: string[],
    ...
  },
  is_new_partner?: boolean (if partner doesn't exist)
}
```

#### 3. Register New Partner
```
POST /api/v1/partner/auth/register
Body: {
  phone_number: string,
  name: string,
  email?: string,
  service_categories?: string[]
}
Response: {
  success: boolean,
  partner: {
    id: uuid,
    partner_code: string,
    name: string,
    ...
  }
}
```

#### 4. Get Partner Profile
```
GET /api/v1/partner/auth/me
Headers: Cookie (with HttpOnly tokens)
Response: {
  partner: {
    id: uuid,
    partner_code: string,
    name: string,
    phone_number: string,
    email?: string,
    is_active: boolean,
    is_available: boolean,
    rating: number,
    total_bookings: number,
    total_earnings: number,
    pending_payout: number,
    service_categories: string[],
    ...
  }
}
```

#### 5. Logout
```
POST /api/v1/partner/auth/logout
Headers: Cookie (with HttpOnly tokens)
Response: {
  success: boolean,
  message: string
}
```

### Partner Profile

#### 6. Update Availability
```
PATCH /api/v1/partner/profile/availability
Body: {
  is_available: boolean
}
Response: {
  success: boolean,
  partner: {...}
}
```

### Partner Bookings

#### 7. Get Partner Bookings
```
GET /api/v1/partner/bookings?status=accepted&limit=10
Response: {
  bookings: [
    {
      id: uuid,
      booking_number: string,
      customer_name: string,
      customer_phone: string,
      booking_date: date,
      booking_time: time,
      status: string,
      services: [
        {
          name: string,
          quantity: number,
          price: number,
          duration_minutes: number
        }
      ],
      grand_total: number,
      partner_payout: number,
      payment_method: string,
      address: {
        address_line1: string,
        city: string,
        pincode: string,
        lat?: number,
        lng?: number
      },
      ...
    }
  ]
}
```

#### 8. Get Booking by ID
```
GET /api/v1/partner/bookings/:id
Response: {
  booking: {
    id: uuid,
    booking_number: string,
    customer_name: string,
    customer_phone: string,
    booking_date: date,
    booking_time: time,
    status: string,
    services: [...],
    grand_total: number,
    partner_payout: number,
    payment_method: string,
    address: {...},
    service_started_at?: timestamp,
    ...
  }
}
```

#### 9. Accept Booking
```
POST /api/v1/partner/bookings/:id/accept
Response: {
  success: boolean,
  booking: {...}
}
```

#### 10. Reject Booking
```
POST /api/v1/partner/bookings/:id/reject
Body: {
  reason: string
}
Response: {
  success: boolean,
  booking: {...}
}
```

#### 11. Verify Start OTP
```
POST /api/v1/partner/bookings/:id/verify-start-otp
Body: {
  otp_code: string
}
Response: {
  success: boolean,
  verified: boolean,
  booking: {...}
}
```

#### 12. Start Booking Service
```
POST /api/v1/partner/bookings/:id/start
Body: {
  otp_code: string
}
Response: {
  success: boolean,
  booking: {
    ...,
    status: "in_progress",
    service_started_at: timestamp
  }
}
```

#### 13. Complete Booking
```
POST /api/v1/partner/bookings/:id/complete
Response: {
  success: boolean,
  booking: {
    ...,
    status: "completed",
    service_completed_at: timestamp
  }
}
```

### Partner Dashboard

#### 14. Get Dashboard Data
```
GET /api/v1/partner/dashboard
Response: {
  total_earnings: number,
  total_bookings: number,
  completed_bookings: number,
  cancelled_bookings: number,
  rating: number,
  ...
}
```

### Partner Earnings

#### 15. Get Today's Earnings
```
GET /api/v1/partner/earnings/today
Response: {
  today_earnings: number,
  bookings_count: number
}
}
```

#### 16. Get Earnings
```
GET /api/v1/partner/earnings?date_from=2024-01-01&date_to=2024-01-31
Response: {
  total_earnings: number,
  bookings: [...],
  ...
}
```

## Database Schema Requirements

### Partners Table
```sql
CREATE TABLE partners (
  id UUID PRIMARY KEY,
  partner_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255),
  service_categories TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_bookings INTEGER DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0.00,
  pending_payout DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Bookings Table (extend existing)
```sql
-- Add these columns if not exists:
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_started_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_completed_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assignment_status VARCHAR(50);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP;
```

## Authentication Flow

1. Partner enters phone number
2. Backend sends OTP via SMS (Twilio)
3. Partner enters OTP
4. Backend verifies OTP:
   - If partner exists: Return partner data, set HttpOnly cookies (access_token, refresh_token)
   - If partner doesn't exist: Return `is_new_partner: true`
5. If new partner: Show registration form
6. After registration: Create partner, set cookies, login

## Service Execution Flow

1. Admin assigns booking to partner (via admin panel)
2. Partner receives notification (push notification - future)
3. Partner opens booking detail:
   - If status = "assigned": Show Accept/Reject buttons
   - If status = "accepted": Show "Start Service" button
   - If status = "in_progress": Show timer and "Swipe to Complete"
   - If status = "completed": Show completion confirmation

4. To Start Service:
   - Partner clicks "Start Service"
   - Backend sends OTP to partner's phone
   - Partner enters OTP
   - Backend verifies OTP
   - Backend updates booking status to "in_progress" and sets `service_started_at`
   - Frontend starts timer based on total service duration

5. To Complete Service:
   - Partner swipes right on "Swipe to Complete" button
   - When swipe progress >= 80%, release triggers completion
   - Backend updates booking status to "completed" and sets `service_completed_at`
   - Backend adds earnings to partner's account

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## Development Notes

- All API calls use HttpOnly cookies for authentication
- OTP verification is required to start service (security measure)
- Timer calculates remaining time based on `service_started_at` + total service duration
- Swipe to complete uses touch and mouse events for cross-platform support
- Responsive design works on mobile and desktop

## Future Enhancements

- Push notifications for new bookings
- Real-time location tracking
- In-app messaging with customers
- Earnings analytics and charts
- Performance metrics
- Route optimization
- Offline support

## License

Private project for MinServe.

