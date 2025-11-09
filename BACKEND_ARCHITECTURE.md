# Minuteserv Backend Architecture

**Version:** 1.0  
**Last Updated:** January 2025  
**Architecture:** Microservices-ready Monolith (Phase 1)

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
   - [Customer APIs](#customer-apis)
   - [Admin APIs](#admin-apis)
   - [Partner APIs](#partner-apis)
   - [Internal APIs](#internal-apis)
4. [Payment Architecture](#payment-architecture)
5. [Partner Assignment System](#partner-assignment-system)
6. [Security & Performance](#security--performance)
7. [Deployment Strategy](#deployment-strategy)

---

## Technology Stack

### Core
- **Runtime:** Node.js 18+ (Express) / Python 3.11+ (FastAPI)
- **Database:** PostgreSQL 15+ (Primary), Redis 7+ (Cache/Sessions)
- **Message Queue:** RabbitMQ / AWS SQS
- **File Storage:** AWS S3 / CloudFront CDN

### Services
- **SMS/OTP:** Twilio / MSG91
- **Payment Gateway:** Razorpay
- **Email:** SendGrid / AWS SES
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK Stack / CloudWatch

### Infrastructure
- **Container:** Docker + Kubernetes (optional)
- **CI/CD:** GitHub Actions / GitLab CI
- **Load Balancer:** Nginx / AWS ALB

---

## Database Schema

### 1. Users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
```

### 2. User Addresses

```sql
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- "Home", "Office", "Current Location"
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  place_id VARCHAR(255),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_addresses_user ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_default ON user_addresses(user_id, is_default) WHERE is_default = true;
CREATE INDEX idx_user_addresses_location ON user_addresses USING GIST(ll_to_earth(lat, lng));
```

### 3. Services

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- "Facial", "Waxing", "Hair", "Nail", etc.
  service_type VARCHAR(100) NOT NULL, -- "Clean up", "Facial", "Bleach", etc.
  tier VARCHAR(50) NOT NULL, -- "Minimal", "Exclusive", "E-Lite"
  product_cost DECIMAL(10, 2) NOT NULL,
  market_price DECIMAL(10, 2),
  duration_minutes INTEGER DEFAULT 60,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_tier ON services(tier);
CREATE INDEX idx_services_active ON services(is_active) WHERE is_active = true;
CREATE INDEX idx_services_category_tier ON services(category, tier);
```

### 4. Service Partners (Technicians)

```sql
CREATE TABLE service_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_code VARCHAR(50) UNIQUE NOT NULL, -- "PT-001"
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255),
  aadhar_number VARCHAR(12) UNIQUE,
  pan_number VARCHAR(10),
  bank_account_number VARCHAR(50),
  ifsc_code VARCHAR(11),
  bank_name VARCHAR(255),
  address TEXT,
  
  -- Service capabilities
  service_categories JSONB NOT NULL, -- ["Facial", "Waxing", "Hair"]
  service_tiers JSONB NOT NULL, -- ["Minimal", "Exclusive", "E-Lite"]
  
  -- Availability
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  working_hours JSONB NOT NULL, -- {"start": "08:00", "end": "20:00", "days": [1,2,3,4,5,6,7]}
  
  -- Performance metrics
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_bookings INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  cancelled_bookings INTEGER DEFAULT 0,
  cancellation_rate DECIMAL(5, 2) DEFAULT 0.00,
  
  -- Earnings
  total_earnings DECIMAL(10, 2) DEFAULT 0.00,
  pending_payout DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Location
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  service_radius_km INTEGER DEFAULT 10,
  
  -- Onboarding
  onboarding_status VARCHAR(50) DEFAULT 'pending', -- "pending", "verified", "rejected"
  verification_documents JSONB, -- {"aadhar": "url", "pan": "url"}
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP
);

CREATE INDEX idx_partners_active ON service_partners(is_active, is_available);
CREATE INDEX idx_partners_location ON service_partners USING GIST(ll_to_earth(current_lat, current_lng));
CREATE INDEX idx_partners_categories ON service_partners USING GIN(service_categories);
CREATE INDEX idx_partners_rating ON service_partners(rating DESC);
```

### 5. Bookings

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number VARCHAR(50) UNIQUE NOT NULL, -- "BK-20240115-123456"
  user_id UUID NOT NULL REFERENCES users(id),
  service_address_id UUID NOT NULL REFERENCES user_addresses(id),
  
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  
  status VARCHAR(50) NOT NULL DEFAULT 'pending', 
  -- 'pending', 'partner_assigned', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'
  
  -- Assignment
  assignment_priority INTEGER DEFAULT 0,
  auto_assignment_enabled BOOLEAN DEFAULT true,
  
  -- Payment
  payment_method VARCHAR(20) NOT NULL, -- 'cash', 'online'
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending', 'paid', 'failed', 'refunded', 'partially_refunded'
  
  -- Pricing
  total_price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) NOT NULL,
  grand_total DECIMAL(10, 2) NOT NULL,
  partner_payout DECIMAL(10, 2), -- Calculated from grand_total
  
  promo_code VARCHAR(50),
  cancellation_policy_accepted BOOLEAN DEFAULT false,
  
  -- Cancellation
  cancelled_at TIMESTAMP,
  cancelled_by VARCHAR(20), -- 'customer', 'partner', 'system', 'admin'
  cancellation_reason TEXT,
  cancellation_fee DECIMAL(10, 2),
  refund_amount DECIMAL(10, 2),
  
  -- Tracking
  customer_rating INTEGER, -- 1-5
  customer_feedback TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_user_date ON bookings(user_id, booking_date DESC);
CREATE INDEX idx_bookings_status_date ON bookings(status, booking_date) WHERE status IN ('pending', 'partner_assigned');
CREATE INDEX idx_bookings_number ON bookings(booking_number);
```

### 6. Booking Services (Many-to-Many)

```sql
CREATE TABLE booking_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_booking_services_booking ON booking_services(booking_id);
CREATE INDEX idx_booking_services_service ON booking_services(service_id);
```

### 7. Partner Assignments

```sql
CREATE TABLE partner_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES service_partners(id),
  
  status VARCHAR(50) NOT NULL DEFAULT 'assigned',
  -- 'assigned', 'accepted', 'rejected', 'in_transit', 'arrived', 'completed', 'cancelled'
  
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  
  estimated_arrival TIMESTAMP,
  actual_arrival TIMESTAMP,
  service_started_at TIMESTAMP,
  service_completed_at TIMESTAMP,
  
  -- Partner earnings for this booking
  partner_earning DECIMAL(10, 2) NOT NULL,
  commission_percentage DECIMAL(5, 2) DEFAULT 70.00,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assignments_booking ON partner_assignments(booking_id);
CREATE INDEX idx_assignments_partner ON partner_assignments(partner_id);
CREATE INDEX idx_assignments_status ON partner_assignments(status);
CREATE INDEX idx_assignments_partner_status ON partner_assignments(partner_id, status);
```

### 8. Payments

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  razorpay_order_id VARCHAR(255) UNIQUE,
  razorpay_payment_id VARCHAR(255) UNIQUE,
  razorpay_signature VARCHAR(255),
  
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending', 'success', 'failed', 'refunded', 'partially_refunded'
  
  payment_method VARCHAR(50), -- 'upi', 'card', 'netbanking', 'wallet'
  
  receipt_id VARCHAR(100) UNIQUE,
  failure_reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_order ON payments(razorpay_order_id);
CREATE INDEX idx_payments_payment ON payments(razorpay_payment_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### 9. Payment Requests (Idempotency)

```sql
CREATE TABLE payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key VARCHAR(255) UNIQUE NOT NULL,
  booking_id UUID NOT NULL REFERENCES bookings(id),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  razorpay_order_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_payment_requests_key ON payment_requests(idempotency_key);
CREATE INDEX idx_payment_requests_expires ON payment_requests(expires_at);
```

### 10. Payment Webhooks

```sql
CREATE TABLE payment_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_payment_id VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  signature VARCHAR(255),
  is_verified BOOLEAN DEFAULT false,
  is_processed BOOLEAN DEFAULT false,
  processing_error TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

CREATE INDEX idx_webhooks_payment ON payment_webhooks(razorpay_payment_id);
CREATE INDEX idx_webhooks_processed ON payment_webhooks(is_processed, retry_count);
CREATE INDEX idx_webhooks_order ON payment_webhooks(razorpay_order_id);
```

### 11. Payment Transactions (Double-Entry Accounting)

```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type VARCHAR(10) NOT NULL, -- 'debit', 'credit'
  booking_id UUID NOT NULL REFERENCES bookings(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reference_id VARCHAR(255), -- razorpay_payment_id
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_booking ON payment_transactions(booking_id);
CREATE INDEX idx_transactions_reference ON payment_transactions(reference_id);
```

### 12. OTP Verifications

```sql
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(15) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  purpose VARCHAR(50) NOT NULL, -- 'login', 'reset_password'
  is_verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otp_phone ON otp_verifications(phone_number);
CREATE INDEX idx_otp_expires ON otp_verifications(expires_at);
```

### 13. Promo Codes

```sql
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2),
  max_discount DECIMAL(10, 2),
  usage_limit INTEGER, -- per user
  total_usage_limit INTEGER, -- global
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promo_code ON promo_codes(code);
CREATE INDEX idx_promo_active ON promo_codes(is_active, valid_from, valid_until);
```

### 14. Promo Code Usage

```sql
CREATE TABLE promo_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id),
  user_id UUID NOT NULL REFERENCES users(id),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  discount_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promo_usage_code ON promo_code_usage(promo_code_id);
CREATE INDEX idx_promo_usage_user ON promo_code_usage(user_id);
CREATE INDEX idx_promo_usage_booking ON promo_code_usage(booking_id);
```

### 15. Contact Submissions

```sql
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new', -- 'new', 'read', 'replied', 'resolved'
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contact_status ON contact_submissions(status);
CREATE INDEX idx_contact_created ON contact_submissions(created_at DESC);
```

### 16. Partner Earnings

```sql
CREATE TABLE partner_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES service_partners(id),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  assignment_id UUID NOT NULL REFERENCES partner_assignments(id),
  
  booking_amount DECIMAL(10, 2) NOT NULL,
  commission_percentage DECIMAL(5, 2) NOT NULL,
  partner_earning DECIMAL(10, 2) NOT NULL,
  platform_commission DECIMAL(10, 2) NOT NULL,
  
  payout_id UUID REFERENCES partner_payouts(id),
  
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP
);

CREATE INDEX idx_earnings_partner ON partner_earnings(partner_id);
CREATE INDEX idx_earnings_status ON partner_earnings(status);
CREATE INDEX idx_earnings_payout ON partner_earnings(payout_id);
```

### 17. Partner Payouts

```sql
CREATE TABLE partner_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES service_partners(id),
  payout_number VARCHAR(50) UNIQUE NOT NULL, -- "PO-20240115-001"
  
  total_amount DECIMAL(10, 2) NOT NULL,
  commission_deduction DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(10, 2) NOT NULL,
  
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  payment_method VARCHAR(20), -- 'bank_transfer', 'upi'
  
  bank_transaction_id VARCHAR(255),
  upi_transaction_id VARCHAR(255),
  
  processed_at TIMESTAMP,
  failure_reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payouts_partner ON partner_payouts(partner_id);
CREATE INDEX idx_payouts_status ON partner_payouts(status);
CREATE INDEX idx_payouts_number ON partner_payouts(payout_number);
```

### 18. Admin Users

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'super_admin', 'admin', 'support', 'finance'
  permissions JSONB, -- {"bookings": ["read", "write"], "partners": ["read"]}
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_email ON admin_users(email);
CREATE INDEX idx_admin_role ON admin_users(role);
```

### 19. Admin Audit Logs

```sql
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL, -- 'create_booking', 'update_partner', etc.
  resource_type VARCHAR(50) NOT NULL, -- 'booking', 'partner', 'service'
  resource_id UUID NOT NULL,
  changes JSONB, -- Before/after values
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_admin ON admin_audit_logs(admin_id);
CREATE INDEX idx_audit_resource ON admin_audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON admin_audit_logs(created_at DESC);
```

### 20. System Notifications

```sql
CREATE TABLE system_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  partner_id UUID REFERENCES service_partners(id),
  notification_type VARCHAR(50) NOT NULL, -- 'booking_created', 'partner_assigned', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON system_notifications(user_id, is_read);
CREATE INDEX idx_notifications_partner ON system_notifications(partner_id, is_read);
CREATE INDEX idx_notifications_created ON system_notifications(created_at DESC);
```

---

## API Endpoints

### Base URL
```
Production: https://api.minuteserv.com/v1
Staging: https://api-staging.minuteserv.com/v1
```

### Authentication
All customer endpoints require JWT token (except auth endpoints):
```
Authorization: Bearer <jwt_token>
```

---

## Customer APIs

### Authentication

#### 1. Send OTP
```
POST /auth/send-otp

Request:
{
  "phone_number": "+911234567890",
  "purpose": "login" // "login" | "reset_password"
}

Response:
{
  "success": true,
  "message": "OTP sent successfully",
  "expires_in": 300 // seconds
}
```

#### 2. Verify OTP
```
POST /auth/verify-otp

Request:
{
  "phone_number": "+911234567890",
  "otp_code": "123456",
  "purpose": "login"
}

Response:
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "refresh_token": "eyJhbGci...",
    "user": {
      "id": "uuid",
      "phone_number": "+911234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "is_verified": true
    }
  }
}
```

#### 3. Refresh Token
```
POST /auth/refresh-token

Request:
{
  "refresh_token": "eyJhbGci..."
}

Response:
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "refresh_token": "eyJhbGci..."
  }
}
```

#### 4. Logout
```
POST /auth/logout

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 5. Get Current User
```
GET /auth/me

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "phone_number": "+911234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "is_verified": true,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### Dashboard (Combined Endpoint)

#### Get Dashboard Data
```
GET /dashboard

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "phone_number": "+911234567890",
      "email": "john@example.com"
    },
    "addresses": [
      {
        "id": "uuid",
        "name": "Home",
        "address_line1": "123 Main St",
        "city": "Kolkata",
        "state": "West Bengal",
        "pincode": "700032",
        "is_default": true
      }
    ],
    "recent_bookings": [
      {
        "id": "uuid",
        "booking_number": "BK-20240115-123456",
        "status": "completed",
        "booking_date": "2024-01-15",
        "booking_time": "10:00:00",
        "grand_total": 1500.00,
        "services": [
          {
            "name": "Facial - Minimal",
            "quantity": 1
          }
        ]
      }
    ],
    "notifications": [
      {
        "id": "uuid",
        "title": "Booking Confirmed",
        "message": "Your booking BK-20240115-123456 has been confirmed",
        "is_read": false,
        "created_at": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

### Services

#### Get Service Catalog
```
GET /services/catalog

Query Parameters:
- category: string (optional) - Filter by category
- tier: string (optional) - Filter by tier

Response:
{
  "success": true,
  "data": {
    "categories": {
      "Facial": [
        {
          "id": "uuid",
          "name": "Facial - Minimal",
          "category": "Facial",
          "tier": "Minimal",
          "product_cost": 1000.00,
          "market_price": 1200.00,
          "duration_minutes": 60,
          "image_url": "https://..."
        }
      ],
      "Waxing": [...]
    },
    "all_services": [...],
    "last_updated": "2024-01-15T10:00:00Z"
  }
}
```

#### Get Service Details
```
GET /services/:id

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Facial - Minimal",
    "description": "Complete facial treatment...",
    "category": "Facial",
    "tier": "Minimal",
    "product_cost": 1000.00,
    "market_price": 1200.00,
    "duration_minutes": 60,
    "image_url": "https://..."
  }
}
```

---

### User Addresses

#### Get User Addresses
```
GET /users/addresses

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Home",
      "address_line1": "123 Main St",
      "address_line2": "Apartment 4B",
      "city": "Kolkata",
      "state": "West Bengal",
      "pincode": "700032",
      "lat": 22.5726,
      "lng": 88.3639,
      "is_default": true
    }
  ]
}
```

#### Create Address
```
POST /users/addresses

Request:
{
  "name": "Home",
  "address_line1": "123 Main St",
  "address_line2": "Apartment 4B",
  "city": "Kolkata",
  "state": "West Bengal",
  "pincode": "700032",
  "lat": 22.5726,
  "lng": 88.3639,
  "place_id": "ChIJ..."
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    ...
  }
}
```

#### Update Address
```
PUT /users/addresses/:id

Request:
{
  "name": "Office",
  "address_line1": "456 Park Ave",
  ...
}
```

#### Delete Address
```
DELETE /users/addresses/:id

Response:
{
  "success": true,
  "message": "Address deleted successfully"
}
```

#### Set Default Address
```
PATCH /users/addresses/:id/set-default

Response:
{
  "success": true,
  "message": "Default address updated"
}
```

---

### Checkout (Optimized)

#### Prepare Checkout
```
POST /checkout/prepare

Request:
{
  "service_ids": ["uuid1", "uuid2"],
  "promo_code": "SAVE10", // optional
  "address_id": "uuid", // optional
  "booking_date": "2024-01-20" // optional
}

Response:
{
  "success": true,
  "data": {
    "preview_id": "uuid", // 2 minute TTL
    "services": [
      {
        "id": "uuid",
        "name": "Facial - Minimal",
        "quantity": 1,
        "unit_price": 1000.00
      }
    ],
    "pricing": {
      "subtotal": 2000.00,
      "savings": 400.00,
      "discount": 160.00,
      "tax": 331.20,
      "grand_total": 1771.20
    },
    "promo": {
      "code": "SAVE10",
      "discount": 160.00,
      "valid": true
    },
    "available_time_slots": [
      "08:00 AM",
      "08:30 AM",
      ...
    ],
    "address": {
      "id": "uuid",
      "address_line1": "123 Main St",
      ...
    }
  }
}
```

#### Confirm Booking
```
POST /checkout/confirm

Request:
{
  "preview_id": "uuid",
  "payment_method": "online", // "online" | "cash"
  "address_id": "uuid",
  "booking_date": "2024-01-20",
  "booking_time": "10:00 AM",
  "customer_name": "John Doe",
  "customer_phone": "+911234567890",
  "customer_email": "john@example.com",
  "cancellation_policy_accepted": true
}

Response (Online Payment):
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "booking_number": "BK-20240120-123456",
      "status": "pending",
      "grand_total": 1771.20
    },
    "payment": {
      "order_id": "order_abc123",
      "amount": 177120, // in paise
      "currency": "INR",
      "key": "rzp_test_...",
      "name": "Minuteserv",
      "description": "Booking BK-20240120-123456",
      "prefill": {
        "contact": "+911234567890",
        "email": "john@example.com",
        "name": "John Doe"
      },
      "notes": {
        "booking_id": "uuid",
        "booking_number": "BK-20240120-123456"
      }
    }
  }
}

Response (Cash Payment):
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "booking_number": "BK-20240120-123456",
      "status": "partner_assigned",
      "grand_total": 1771.20
    },
    "message": "Booking created. Partner will be assigned shortly."
  }
}
```

---

### Payments

#### Verify Payment
```
POST /payments/verify

Request:
{
  "razorpay_order_id": "order_abc123",
  "razorpay_payment_id": "pay_xyz789",
  "razorpay_signature": "signature..."
}

Response:
{
  "success": true,
  "data": {
    "booking_id": "uuid",
    "booking_number": "BK-20240120-123456",
    "payment_status": "success",
    "booking_status": "partner_assigned"
  }
}
```

#### Get Payment Status
```
GET /payments/:id/status

Response:
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "status": "success",
    "amount": 1771.20,
    "payment_method": "upi",
    "razorpay_payment_id": "pay_xyz789",
    "created_at": "2024-01-20T10:00:00Z"
  }
}
```

#### Razorpay Webhook
```
POST /payments/webhook

Headers:
X-Razorpay-Signature: signature...

Request:
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_xyz789",
        "order_id": "order_abc123",
        ...
      }
    }
  }
}

Response:
{
  "success": true
}
```

---

### Bookings

#### Get User Bookings
```
GET /bookings

Query Parameters:
- status: string (optional) - Filter by status
- page: integer (default: 1)
- limit: integer (default: 10)

Response:
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "uuid",
        "booking_number": "BK-20240120-123456",
        "status": "confirmed",
        "booking_date": "2024-01-20",
        "booking_time": "10:00:00",
        "grand_total": 1771.20,
        "payment_status": "paid",
        "services": [
          {
            "name": "Facial - Minimal",
            "quantity": 1
          }
        ],
        "partner": {
          "name": "Priya Sharma",
          "phone": "+919876543210",
          "rating": 4.8
        },
        "address": {
          "address_line1": "123 Main St",
          "city": "Kolkata"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "total_pages": 3
    }
  }
}
```

#### Get Booking Details
```
GET /bookings/:id

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "booking_number": "BK-20240120-123456",
    "status": "confirmed",
    "booking_date": "2024-01-20",
    "booking_time": "10:00:00",
    "grand_total": 1771.20,
    "payment_status": "paid",
    "services": [...],
    "partner": {
      "id": "uuid",
      "name": "Priya Sharma",
      "phone": "+919876543210",
      "rating": 4.8,
      "status": "confirmed"
    },
    "address": {...},
    "payment": {
      "razorpay_payment_id": "pay_xyz789",
      "payment_method": "upi"
    },
    "created_at": "2024-01-20T09:00:00Z"
  }
}
```

#### Cancel Booking
```
POST /bookings/:id/cancel

Request:
{
  "reason": "Change of plans"
}

Response:
{
  "success": true,
  "data": {
    "booking_id": "uuid",
    "status": "cancelled",
    "refund_amount": 1771.20,
    "refund_status": "processing"
  }
}
```

#### Rate Booking
```
POST /bookings/:id/rate

Request:
{
  "rating": 5,
  "feedback": "Great service!"
}

Response:
{
  "success": true,
  "message": "Rating submitted successfully"
}
```

---

### Promo Codes

#### Validate Promo Code
```
POST /promo-codes/validate

Request:
{
  "code": "SAVE10",
  "amount": 2000.00
}

Response:
{
  "success": true,
  "data": {
    "code": "SAVE10",
    "discount": 160.00,
    "valid": true,
    "message": "Promo code applied successfully"
  }
}
```

---

### Contact

#### Submit Contact Form
```
POST /contact

Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+911234567890",
  "subject": "Service Inquiry",
  "message": "I would like to know about..."
}

Response:
{
  "success": true,
  "message": "Thank you for contacting us. We'll get back to you soon."
}
```

---

## Admin APIs

### Authentication

#### Admin Login
```
POST /admin/auth/login

Request:
{
  "email": "admin@minuteserv.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "refresh_token": "eyJhbGci...",
    "admin": {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@minuteserv.com",
      "role": "super_admin"
    }
  }
}
```

#### Admin Refresh Token
```
POST /admin/auth/refresh-token

Request:
{
  "refresh_token": "eyJhbGci..."
}
```

---

### Dashboard

#### Get Admin Dashboard
```
GET /admin/dashboard

Response:
{
  "success": true,
  "data": {
    "stats": {
      "total_bookings": 1250,
      "pending_bookings": 15,
      "confirmed_bookings": 35,
      "completed_bookings": 1100,
      "cancelled_bookings": 100,
      "total_revenue": 1875000.00,
      "today_revenue": 25000.00,
      "active_partners": 45,
      "total_partners": 50,
      "pending_payouts": 125000.00
    },
    "recent_bookings": [...],
    "recent_partners": [...],
    "alerts": [
      {
        "type": "payment_failed",
        "count": 5
      }
    ]
  }
}
```

---

### Bookings Management

#### Get All Bookings
```
GET /admin/bookings

Query Parameters:
- status: string (optional)
- date_from: date (optional)
- date_to: date (optional)
- partner_id: uuid (optional)
- user_id: uuid (optional)
- page: integer (default: 1)
- limit: integer (default: 20)

Response:
{
  "success": true,
  "data": {
    "bookings": [...],
    "pagination": {...}
  }
}
```

#### Get Booking Details
```
GET /admin/bookings/:id

Response:
{
  "success": true,
  "data": {
    "booking": {...},
    "user": {...},
    "partner": {...},
    "payment": {...},
    "services": [...],
    "timeline": [
      {
        "action": "created",
        "timestamp": "2024-01-20T09:00:00Z",
        "by": "system"
      }
    ]
  }
}
```

#### Update Booking Status
```
PATCH /admin/bookings/:id/status

Request:
{
  "status": "confirmed",
  "notes": "Manually confirmed by admin"
}

Response:
{
  "success": true,
  "data": {
    "booking": {...}
  }
}
```

#### Assign Partner Manually
```
POST /admin/bookings/:id/assign-partner

Request:
{
  "partner_id": "uuid",
  "force": false // Force assignment even if partner is busy
}

Response:
{
  "success": true,
  "data": {
    "booking": {...},
    "assignment": {...}
  }
}
```

#### Cancel Booking (Admin)
```
POST /admin/bookings/:id/cancel

Request:
{
  "reason": "Customer request",
  "refund_amount": 1771.20,
  "refund_to_wallet": true
}

Response:
{
  "success": true,
  "data": {
    "booking": {...},
    "refund": {...}
  }
}
```

#### Refund Payment
```
POST /admin/bookings/:id/refund

Request:
{
  "amount": 1771.20, // Partial or full
  "reason": "Service not provided",
  "notes": "Customer complained..."
}

Response:
{
  "success": true,
  "data": {
    "refund_id": "uuid",
    "refund_amount": 1771.20,
    "status": "processing"
  }
}
```

---

### Partners Management

#### Get All Partners
```
GET /admin/partners

Query Parameters:
- status: string (optional) - "active", "inactive", "pending"
- service_category: string (optional)
- page: integer (default: 1)
- limit: integer (default: 20)

Response:
{
  "success": true,
  "data": {
    "partners": [
      {
        "id": "uuid",
        "partner_code": "PT-001",
        "name": "Priya Sharma",
        "phone_number": "+919876543210",
        "rating": 4.8,
        "total_bookings": 250,
        "completed_bookings": 245,
        "total_earnings": 350000.00,
        "pending_payout": 25000.00,
        "is_active": true,
        "is_available": true
      }
    ],
    "pagination": {...}
  }
}
```

#### Get Partner Details
```
GET /admin/partners/:id

Response:
{
  "success": true,
  "data": {
    "partner": {...},
    "earnings": {
      "total": 350000.00,
      "pending": 25000.00,
      "paid": 325000.00
    },
    "bookings": {
      "total": 250,
      "completed": 245,
      "cancelled": 5
    },
    "performance": {
      "rating": 4.8,
      "cancellation_rate": 2.0,
      "average_rating": 4.8
    }
  }
}
```

#### Create Partner
```
POST /admin/partners

Request:
{
  "name": "Priya Sharma",
  "phone_number": "+919876543210",
  "email": "priya@example.com",
  "aadhar_number": "123456789012",
  "pan_number": "ABCDE1234F",
  "bank_account_number": "1234567890",
  "ifsc_code": "SBIN0001234",
  "bank_name": "State Bank of India",
  "address": "123 Partner St, Kolkata",
  "service_categories": ["Facial", "Waxing"],
  "service_tiers": ["Minimal", "Exclusive"],
  "working_hours": {
    "start": "08:00",
    "end": "20:00",
    "days": [1,2,3,4,5,6,7]
  },
  "service_radius_km": 10
}

Response:
{
  "success": true,
  "data": {
    "partner": {...},
    "partner_code": "PT-001"
  }
}
```

#### Update Partner
```
PUT /admin/partners/:id

Request:
{
  "name": "Priya Sharma",
  "is_active": true,
  "service_categories": ["Facial", "Waxing", "Hair"]
}
```

#### Verify Partner
```
POST /admin/partners/:id/verify

Request:
{
  "onboarding_status": "verified", // "verified" | "rejected"
  "notes": "All documents verified"
}

Response:
{
  "success": true,
  "data": {
    "partner": {...}
  }
}
```

#### Update Partner Availability
```
PATCH /admin/partners/:id/availability

Request:
{
  "is_available": true,
  "working_hours": {
    "start": "08:00",
    "end": "20:00",
    "days": [1,2,3,4,5,6,7]
  }
}
```

#### Get Partner Bookings
```
GET /admin/partners/:id/bookings

Query Parameters:
- status: string (optional)
- date_from: date (optional)
- date_to: date (optional)

Response:
{
  "success": true,
  "data": {
    "bookings": [...]
  }
}
```

#### Get Partner Earnings
```
GET /admin/partners/:id/earnings

Query Parameters:
- date_from: date (optional)
- date_to: date (optional)
- status: string (optional) - "pending", "paid"

Response:
{
  "success": true,
  "data": {
    "total_earnings": 350000.00,
    "pending": 25000.00,
    "paid": 325000.00,
    "earnings": [
      {
        "booking_id": "uuid",
        "booking_number": "BK-20240120-123456",
        "partner_earning": 1200.00,
        "status": "paid",
        "paid_at": "2024-01-21T10:00:00Z"
      }
    ]
  }
}
```

---

### Partner Payouts

#### Get All Payouts
```
GET /admin/payouts

Query Parameters:
- partner_id: uuid (optional)
- status: string (optional)
- date_from: date (optional)
- date_to: date (optional)

Response:
{
  "success": true,
  "data": {
    "payouts": [
      {
        "id": "uuid",
        "payout_number": "PO-20240120-001",
        "partner": {
          "id": "uuid",
          "name": "Priya Sharma",
          "partner_code": "PT-001"
        },
        "total_amount": 25000.00,
        "net_amount": 25000.00,
        "status": "pending",
        "created_at": "2024-01-20T10:00:00Z"
      }
    ]
  }
}
```

#### Create Payout
```
POST /admin/payouts

Request:
{
  "partner_id": "uuid",
  "earnings_ids": ["uuid1", "uuid2"], // Optional: specific earnings
  "payment_method": "bank_transfer" // "bank_transfer" | "upi"
}

Response:
{
  "success": true,
  "data": {
    "payout": {...},
    "payout_number": "PO-20240120-001"
  }
}
```

#### Process Payout
```
POST /admin/payouts/:id/process

Request:
{
  "bank_transaction_id": "TXN123456",
  "notes": "Payment processed via NEFT"
}

Response:
{
  "success": true,
  "data": {
    "payout": {...},
    "status": "completed"
  }
}
```

#### Mark Payout as Failed
```
POST /admin/payouts/:id/fail

Request:
{
  "failure_reason": "Invalid bank account"
}

Response:
{
  "success": true,
  "data": {
    "payout": {...},
    "status": "failed"
  }
}
```

---

### Services Management

#### Get All Services
```
GET /admin/services

Query Parameters:
- category: string (optional)
- tier: string (optional)
- is_active: boolean (optional)

Response:
{
  "success": true,
  "data": {
    "services": [...]
  }
}
```

#### Create Service
```
POST /admin/services

Request:
{
  "name": "Facial - Minimal",
  "description": "Complete facial treatment...",
  "category": "Facial",
  "service_type": "Facial",
  "tier": "Minimal",
  "product_cost": 1000.00,
  "market_price": 1200.00,
  "duration_minutes": 60,
  "image_url": "https://..."
}

Response:
{
  "success": true,
  "data": {
    "service": {...}
  }
}
```

#### Update Service
```
PUT /admin/services/:id

Request:
{
  "product_cost": 1100.00,
  "market_price": 1300.00,
  "is_active": true
}
```

#### Delete Service
```
DELETE /admin/services/:id

Response:
{
  "success": true,
  "message": "Service deleted successfully"
}
```

---

### Promo Codes Management

#### Get All Promo Codes
```
GET /admin/promo-codes

Query Parameters:
- is_active: boolean (optional)

Response:
{
  "success": true,
  "data": {
    "promo_codes": [...]
  }
}
```

#### Create Promo Code
```
POST /admin/promo-codes

Request:
{
  "code": "SAVE10",
  "description": "10% off on all services",
  "discount_type": "percentage",
  "discount_value": 10.00,
  "min_order_amount": 1000.00,
  "max_discount": 500.00,
  "usage_limit": 1, // per user
  "total_usage_limit": 1000, // global
  "valid_from": "2024-01-01T00:00:00Z",
  "valid_until": "2024-12-31T23:59:59Z"
}

Response:
{
  "success": true,
  "data": {
    "promo_code": {...}
  }
}
```

#### Update Promo Code
```
PUT /admin/promo-codes/:id

Request:
{
  "is_active": false,
  "valid_until": "2024-06-30T23:59:59Z"
}
```

---

### Contact Submissions

#### Get Contact Submissions
```
GET /admin/contact-submissions

Query Parameters:
- status: string (optional)
- page: integer (default: 1)
- limit: integer (default: 20)

Response:
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+911234567890",
        "subject": "Service Inquiry",
        "message": "I would like to know...",
        "status": "new",
        "created_at": "2024-01-20T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### Update Contact Submission Status
```
PATCH /admin/contact-submissions/:id

Request:
{
  "status": "replied",
  "admin_notes": "Responded via email on 2024-01-20"
}

Response:
{
  "success": true,
  "data": {
    "submission": {...}
  }
}
```

---

### Users Management

#### Get All Users
```
GET /admin/users

Query Parameters:
- search: string (optional) - Search by name, phone, email
- page: integer (default: 1)
- limit: integer (default: 20)

Response:
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "name": "John Doe",
        "phone_number": "+911234567890",
        "email": "john@example.com",
        "total_bookings": 10,
        "total_spent": 15000.00,
        "created_at": "2024-01-01T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### Get User Details
```
GET /admin/users/:id

Response:
{
  "success": true,
  "data": {
    "user": {...},
    "bookings": [...],
    "addresses": [...],
    "stats": {
      "total_bookings": 10,
      "total_spent": 15000.00,
      "average_order_value": 1500.00
    }
  }
}
```

#### Block/Unblock User
```
PATCH /admin/users/:id/status

Request:
{
  "is_active": false,
  "reason": "Violation of terms"
}
```

---

### Analytics & Reports

#### Get Revenue Report
```
GET /admin/analytics/revenue

Query Parameters:
- date_from: date (required)
- date_to: date (required)
- group_by: string (optional) - "day", "week", "month"

Response:
{
  "success": true,
  "data": {
    "total_revenue": 1875000.00,
    "total_bookings": 1250,
    "average_order_value": 1500.00,
    "breakdown": [
      {
        "date": "2024-01-20",
        "revenue": 25000.00,
        "bookings": 15
      }
    ]
  }
}
```

#### Get Partner Performance Report
```
GET /admin/analytics/partner-performance

Query Parameters:
- partner_id: uuid (optional)
- date_from: date (required)
- date_to: date (required)

Response:
{
  "success": true,
  "data": {
    "partners": [
      {
        "partner_id": "uuid",
        "partner_name": "Priya Sharma",
        "total_bookings": 50,
        "completed_bookings": 48,
        "cancelled_bookings": 2,
        "total_earnings": 70000.00,
        "average_rating": 4.8,
        "cancellation_rate": 4.0
      }
    ]
  }
}
```

#### Get Service Popularity Report
```
GET /admin/analytics/service-popularity

Query Parameters:
- date_from: date (required)
- date_to: date (required)

Response:
{
  "success": true,
  "data": {
    "services": [
      {
        "service_id": "uuid",
        "service_name": "Facial - Minimal",
        "total_bookings": 250,
        "total_revenue": 250000.00,
        "average_rating": 4.5
      }
    ]
  }
}
```

---

### System Settings

#### Get System Settings
```
GET /admin/settings

Response:
{
  "success": true,
  "data": {
    "commission_percentage": 30.00,
    "cancellation_fee_percentage": 10.00,
    "free_cancellation_minutes": 5,
    "partner_assignment_timeout": 15,
    "otp_expiry_minutes": 5,
    "max_booking_advance_days": 30
  }
}
```

#### Update System Settings
```
PUT /admin/settings

Request:
{
  "commission_percentage": 30.00,
  "cancellation_fee_percentage": 10.00,
  "free_cancellation_minutes": 5
}

Response:
{
  "success": true,
  "data": {
    "settings": {...}
  }
}
```

---

### Audit Logs

#### Get Audit Logs
```
GET /admin/audit-logs

Query Parameters:
- admin_id: uuid (optional)
- resource_type: string (optional)
- resource_id: uuid (optional)
- action: string (optional)
- date_from: date (optional)
- date_to: date (optional)
- page: integer (default: 1)
- limit: integer (default: 20)

Response:
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "admin": {
          "name": "Admin User",
          "email": "admin@minuteserv.com"
        },
        "action": "update_booking",
        "resource_type": "booking",
        "resource_id": "uuid",
        "changes": {
          "status": {
            "old": "pending",
            "new": "confirmed"
          }
        },
        "ip_address": "192.168.1.1",
        "created_at": "2024-01-20T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

## Partner APIs

### Authentication

#### Partner Login
```
POST /partner/auth/login

Request:
{
  "phone_number": "+919876543210",
  "otp_code": "123456"
}

Response:
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "partner": {
      "id": "uuid",
      "partner_code": "PT-001",
      "name": "Priya Sharma"
    }
  }
}
```

---

### Dashboard

#### Get Partner Dashboard
```
GET /partner/dashboard

Response:
{
  "success": true,
  "data": {
    "stats": {
      "total_bookings": 250,
      "pending_bookings": 2,
      "today_bookings": 5,
      "completed_bookings": 245,
      "total_earnings": 350000.00,
      "pending_payout": 25000.00,
      "rating": 4.8
    },
    "upcoming_bookings": [...],
    "recent_earnings": [...]
  }
}
```

---

### Bookings

#### Get Partner Bookings
```
GET /partner/bookings

Query Parameters:
- status: string (optional)
- date: date (optional)
- page: integer (default: 1)
- limit: integer (default: 20)

Response:
{
  "success": true,
  "data": {
    "bookings": [...]
  }
}
```

#### Accept Booking
```
POST /partner/bookings/:id/accept

Response:
{
  "success": true,
  "data": {
    "booking": {...},
    "status": "confirmed"
  }
}
```

#### Reject Booking
```
POST /partner/bookings/:id/reject

Request:
{
  "reason": "Too far from location"
}

Response:
{
  "success": true,
  "data": {
    "booking": {...},
    "status": "rejected"
  }
}
```

#### Update Booking Status
```
PATCH /partner/bookings/:id/status

Request:
{
  "status": "in_transit",
  "estimated_arrival": "2024-01-20T11:00:00Z"
}

Response:
{
  "success": true,
  "data": {
    "booking": {...}
  }
}
```

#### Mark Booking as Completed
```
POST /partner/bookings/:id/complete

Request:
{
  "service_completed_at": "2024-01-20T12:00:00Z"
}

Response:
{
  "success": true,
  "data": {
    "booking": {...},
    "earning": {
      "amount": 1200.00,
      "status": "pending"
    }
  }
}
```

---

### Availability

#### Update Availability Status
```
PATCH /partner/availability

Request:
{
  "is_available": true,
  "current_lat": 22.5726,
  "current_lng": 88.3639
}

Response:
{
  "success": true,
  "data": {
    "is_available": true,
    "last_seen_at": "2024-01-20T10:00:00Z"
  }
}
```

#### Update Working Hours
```
PUT /partner/working-hours

Request:
{
  "working_hours": {
    "start": "08:00",
    "end": "20:00",
    "days": [1,2,3,4,5,6,7]
  }
}
```

---

### Earnings

#### Get Partner Earnings
```
GET /partner/earnings

Query Parameters:
- status: string (optional) - "pending", "paid"
- date_from: date (optional)
- date_to: date (optional)

Response:
{
  "success": true,
  "data": {
    "total_earnings": 350000.00,
    "pending": 25000.00,
    "paid": 325000.00,
    "earnings": [...]
  }
}
```

#### Get Partner Payouts
```
GET /partner/payouts

Response:
{
  "success": true,
  "data": {
    "payouts": [
      {
        "id": "uuid",
        "payout_number": "PO-20240120-001",
        "total_amount": 25000.00,
        "net_amount": 25000.00,
        "status": "completed",
        "processed_at": "2024-01-21T10:00:00Z"
      }
    ]
  }
}
```

---

## Internal APIs

### Partner Assignment

#### Auto-Assign Partner
```
POST /internal/bookings/:id/assign-partner

Request:
{
  "force": false // Force assignment
}

Response:
{
  "success": true,
  "data": {
    "booking": {...},
    "assignment": {
      "partner_id": "uuid",
      "partner_name": "Priya Sharma",
      "status": "assigned"
    }
  }
}
```

#### Get Assignment Queue
```
GET /internal/assignments/queue

Query Parameters:
- status: string (optional)
- priority: integer (optional)

Response:
{
  "success": true,
  "data": {
    "pending_assignments": [
      {
        "booking_id": "uuid",
        "booking_number": "BK-20240120-123456",
        "booking_date": "2024-01-20",
        "booking_time": "10:00:00",
        "service_categories": ["Facial"],
        "address": {...},
        "priority": 5
      }
    ]
  }
}
```

---

## Payment Architecture

### Payment Flow

#### Online Payment
```
1. Customer clicks "Pay Online"
   → POST /checkout/confirm
   → Creates booking (status: pending)
   → Creates payment order
   → Returns Razorpay order data

2. Frontend: Razorpay Checkout
   → User completes payment

3. Webhook: payment.captured
   → Verify signature
   → Update payment status: success
   → Update booking status: pending → partner_assigned
   → Trigger partner assignment
   → Send notifications

4. Webhook: payment.failed
   → Update payment status: failed
   → Keep booking (user can retry)
   → Send notification
```

#### Cash Payment
```
1. Customer selects "Pay by Cash"
   → POST /checkout/confirm (payment_method: cash)
   → Creates booking (status: pending)
   → Creates payment record (status: pending)
   → Triggers partner assignment immediately

2. Partner marks as completed
   → POST /partner/bookings/:id/complete
   → Booking status: completed
   → Payment status: paid
   → Partner earning calculated
```

### Payment Idempotency

All payment endpoints require `idempotency_key`:
```
Headers:
X-Idempotency-Key: uuid-v4

This ensures:
- Same request processed only once
- Prevents duplicate payments
- Handles network retries
```

### Payment Webhook Handler

```
POST /payments/webhook

Process:
1. Verify Razorpay signature
2. Check if webhook already processed (idempotency)
3. Update payment status
4. Update booking status
5. Trigger partner assignment (if online payment)
6. Send notifications
7. Log webhook event

Retry Logic:
- If processing fails, retry with exponential backoff
- Max 3 retries
- After 3 failures, mark for manual review
```

### Payment Reconciliation

Daily job to reconcile:
- Razorpay transactions vs our records
- Handle missing webhooks
- Detect discrepancies
- Generate reconciliation report

---

## Partner Assignment System

### Auto-Assignment Algorithm

```
1. Find Available Partners:
   - Service category match
   - Within service radius
   - Available at booking time
   - Not overbooked
   - Rating >= 4.0

2. Score Partners:
   - Distance (closer = higher score)
   - Rating (higher = higher score)
   - Availability (more available = higher score)
   - Past performance (lower cancellation = higher score)

3. Assign to Top-Scored Partner

4. If No Partner Found:
   - Queue for manual assignment
   - Notify admin
```

### Partner Notification Flow

```
Booking Created → Partner Assigned → Push Notification
  ↓
Partner Accepts (within 15 min) → Booking Confirmed
  ↓
Partner Rejects → Auto-assign next partner
  ↓
No Response (15 min) → Auto-assign next partner
  ↓
Max 3 attempts → Queue for manual assignment
```

### Assignment States

```
assigned → accepted → in_transit → arrived → completed
         ↓
      rejected → (auto-assign next)
```

---

## Security & Performance

### Security

1. **Authentication**
   - JWT tokens with 15-minute expiry
   - Refresh tokens with 7-day expiry
   - OTP verification for sensitive operations

2. **Authorization**
   - Role-based access control (RBAC)
   - Resource-level permissions
   - Admin audit logs

3. **Data Protection**
   - SQL injection prevention (parameterized queries)
   - XSS protection
   - CSRF tokens
   - Input validation & sanitization

4. **Payment Security**
   - Razorpay signature verification
   - Idempotency keys
   - Webhook replay protection
   - PCI DSS compliance

5. **Rate Limiting**
   - OTP: 3 per phone/hour
   - Booking creation: 10 per user/hour
   - General API: 100 requests/minute per IP
   - Admin API: 500 requests/minute per admin

### Performance

1. **Caching Strategy**
   - Redis for:
     - Service catalog (1 hour TTL)
     - OTP codes (5 minutes TTL)
     - User sessions (7 days TTL)
     - Promo code validation (1 hour TTL)

2. **Database Optimization**
   - Indexes on frequently queried columns
   - Read replicas for analytics
   - Connection pooling
   - Query optimization

3. **API Optimization**
   - Combined endpoints (dashboard, catalog)
   - Batch operations
   - Pagination for large datasets
   - Field selection (GraphQL-style)

4. **CDN**
   - Static assets on CloudFront
   - Service images cached
   - API responses cached where possible

---

## Deployment Strategy

### Environment Setup

1. **Development**
   - Local PostgreSQL + Redis
   - Mock payment gateway
   - Local file storage

2. **Staging**
   - AWS RDS PostgreSQL
   - AWS ElastiCache Redis
   - Razorpay test mode
   - S3 staging bucket

3. **Production**
   - Multi-AZ RDS PostgreSQL (Primary + Replicas)
   - Redis Cluster
   - Razorpay production
   - S3 + CloudFront CDN
   - Auto-scaling EC2/ECS

### Monitoring

1. **Application Metrics**
   - Request rate
   - Response time
   - Error rate
   - Payment success rate

2. **Business Metrics**
   - Booking conversion rate
   - Partner assignment success rate
   - Average order value
   - Customer retention

3. **Infrastructure Metrics**
   - Database connection pool
   - Redis memory usage
   - API server CPU/memory
   - Queue depth

### Backup & Disaster Recovery

1. **Database Backups**
   - Daily full backups
   - Hourly incremental backups
   - 30-day retention

2. **Disaster Recovery**
   - Multi-AZ deployment
   - Automated failover
   - RTO: 15 minutes
   - RPO: 1 hour

---

## API Rate Limits

| Endpoint Category | Rate Limit |
|------------------|------------|
| OTP Endpoints | 3 requests/hour per phone |
| Booking Creation | 10 requests/hour per user |
| Payment Endpoints | 5 requests/hour per user |
| General Customer API | 100 requests/minute per IP |
| Admin API | 500 requests/minute per admin |
| Partner API | 200 requests/minute per partner |

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (Duplicate) |
| 422 | Validation Error |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## Webhook Events

### Payment Webhooks (Razorpay)

- `payment.captured` - Payment successful
- `payment.failed` - Payment failed
- `payment.refunded` - Payment refunded
- `order.paid` - Order paid

### Custom Webhooks (Internal)

- `booking.created` - Booking created
- `booking.confirmed` - Booking confirmed
- `booking.cancelled` - Booking cancelled
- `partner.assigned` - Partner assigned
- `partner.accepted` - Partner accepted booking
- `booking.completed` - Service completed

---

## Notes

1. **Idempotency**: All payment and booking creation endpoints are idempotent
2. **Transactions**: Critical operations use database transactions
3. **Retry Logic**: Webhook processing has retry with exponential backoff
4. **Audit Logs**: All admin actions are logged
5. **Data Privacy**: GDPR-compliant data handling
6. **Scalability**: Designed to handle 10K+ daily bookings

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Maintained By:** Engineering Team

