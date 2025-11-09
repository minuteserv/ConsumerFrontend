# Minuteserv Backend - Minimal Architecture (Solo Developer)

**Stack:** Supabase (PostgreSQL) + Node.js + Express  
**Goal:** Minimal tables & endpoints, full functionality

---

## Database Schema (Minimal - 10 Tables)

### 1. Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone_number);
```

### 2. User Addresses
```sql
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) DEFAULT 'Home',
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  place_id VARCHAR(255),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON user_addresses(user_id);
```

### 3. Services
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  tier VARCHAR(50) NOT NULL,
  product_cost DECIMAL(10, 2) NOT NULL,
  market_price DECIMAL(10, 2),
  duration_minutes INTEGER DEFAULT 60,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_services_category ON services(category, tier);
```

### 4. Partners (Simplified)
```sql
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255),
  service_categories TEXT[], -- Array: ["Facial", "Waxing"]
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_bookings INTEGER DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0.00,
  pending_payout DECIMAL(10, 2) DEFAULT 0.00,
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_partners_active ON partners(is_active, is_available);
```

### 5. Bookings (All-in-one)
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  address_id UUID NOT NULL REFERENCES user_addresses(id),
  partner_id UUID REFERENCES partners(id),
  
  -- Service details stored as JSON (simplified)
  services JSONB NOT NULL, -- [{"service_id": "uuid", "name": "Facial", "quantity": 1, "price": 1000}]
  
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  
  status VARCHAR(50) DEFAULT 'pending',
  -- 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
  
  payment_method VARCHAR(20) NOT NULL, -- 'cash', 'online'
  payment_status VARCHAR(20) DEFAULT 'pending',
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  
  total_price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) NOT NULL,
  grand_total DECIMAL(10, 2) NOT NULL,
  partner_payout DECIMAL(10, 2),
  
  promo_code VARCHAR(50),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(15),
  customer_email VARCHAR(255),
  
  -- Partner assignment
  assignment_status VARCHAR(50), -- 'assigned', 'accepted', 'rejected'
  assigned_at TIMESTAMP,
  accepted_at TIMESTAMP,
  
  -- Cancellation
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  refund_amount DECIMAL(10, 2),
  
  -- Rating
  customer_rating INTEGER,
  customer_feedback TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_partner ON bookings(partner_id);
```

### 6. Payments (Simplified)
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  razorpay_order_id VARCHAR(255) UNIQUE,
  razorpay_payment_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_order ON payments(razorpay_order_id);
```

### 7. OTP Verifications
```sql
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(15) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_otp_phone ON otp_verifications(phone_number);
```

### 8. Promo Codes
```sql
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_promo_code ON promo_codes(code);
```

### 9. Contact Submissions
```sql
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 10. Admin Users (Supabase Auth)
```sql
-- Use Supabase Auth for admin users
-- Or create simple table:
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints (Minimal - 15 Endpoints)

### Base URL
```
/api/v1
```

---

### 1. Authentication

#### POST /auth/send-otp
```javascript
// Request
{
  "phone_number": "+911234567890"
}

// Response
{
  "success": true,
  "message": "OTP sent",
  "expires_in": 300
}
```

#### POST /auth/verify-otp
```javascript
// Request
{
  "phone_number": "+911234567890",
  "otp_code": "123456"
}

// Response
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "user": { "id": "uuid", "phone_number": "...", "name": "..." }
  }
}
```

---

### 2. Dashboard (Combined)

#### GET /dashboard
```javascript
// Returns: user + addresses + recent bookings
// Response
{
  "success": true,
  "data": {
    "user": {...},
    "addresses": [...],
    "bookings": [...]
  }
}
```

---

### 3. Services

#### GET /services/catalog
```javascript
// Returns all services grouped by category
// Response
{
  "success": true,
  "data": {
    "categories": {
      "Facial": [...],
      "Waxing": [...]
    }
  }
}
```

---

### 4. Checkout (2 Endpoints - Optimized)

#### POST /checkout/prepare
```javascript
// Request
{
  "service_ids": ["uuid1", "uuid2"],
  "promo_code": "SAVE10",
  "address_id": "uuid"
}

// Response
{
  "success": true,
  "data": {
    "preview_id": "uuid",
    "services": [...],
    "pricing": {
      "subtotal": 2000,
      "discount": 160,
      "tax": 331,
      "grand_total": 1771
    },
    "available_slots": ["08:00 AM", "08:30 AM", ...]
  }
}
```

#### POST /checkout/confirm
```javascript
// Request
{
  "preview_id": "uuid",
  "payment_method": "online", // or "cash"
  "address_id": "uuid",
  "booking_date": "2024-01-20",
  "booking_time": "10:00 AM",
  "customer_name": "John Doe",
  "customer_phone": "+911234567890",
  "customer_email": "john@example.com"
}

// Response (Online)
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "booking_number": "BK-20240120-123456"
    },
    "payment": {
      "order_id": "order_abc",
      "amount": 177120,
      "key": "rzp_test_..."
    }
  }
}

// Response (Cash)
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "booking_number": "BK-20240120-123456",
      "status": "pending"
    }
  }
}
```

---

### 5. Payments

#### POST /payments/verify
```javascript
// Request
{
  "razorpay_order_id": "order_abc",
  "razorpay_payment_id": "pay_xyz",
  "razorpay_signature": "signature..."
}

// Response
{
  "success": true,
  "data": {
    "booking_id": "uuid",
    "status": "confirmed"
  }
}
```

#### POST /payments/webhook
```javascript
// Razorpay webhook handler
// Handles: payment.captured, payment.failed
// Updates booking & payment status automatically
```

---

### 6. Bookings

#### GET /bookings
```javascript
// Query: ?status=pending&page=1&limit=10
// Response
{
  "success": true,
  "data": {
    "bookings": [...],
    "pagination": { "page": 1, "total": 25 }
  }
}
```

#### GET /bookings/:id
```javascript
// Response
{
  "success": true,
  "data": {
    "booking": {...},
    "partner": {...},
    "payment": {...}
  }
}
```

#### POST /bookings/:id/cancel
```javascript
// Request
{
  "reason": "Change of plans"
}

// Response
{
  "success": true,
  "data": {
    "refund_amount": 1771,
    "status": "cancelled"
  }
}
```

---

### 7. Addresses

#### GET /addresses
```javascript
// Response
{
  "success": true,
  "data": [...]
}
```

#### POST /addresses
```javascript
// Request
{
  "name": "Home",
  "address_line1": "123 Main St",
  "city": "Kolkata",
  "state": "West Bengal",
  "pincode": "700032",
  "lat": 22.5726,
  "lng": 88.3639
}
```

#### PUT /addresses/:id
```javascript
// Update address
```

#### DELETE /addresses/:id
```javascript
// Delete address
```

---

### 8. Contact

#### POST /contact
```javascript
// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+911234567890",
  "message": "I need help..."
}

// Response
{
  "success": true,
  "message": "Thank you for contacting us"
}
```

---

## Admin Endpoints (Minimal - 8 Endpoints)

### Authentication

#### POST /admin/auth/login
```javascript
// Request
{
  "email": "admin@minuteserv.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "admin": {...}
  }
}
```

---

### Dashboard

#### GET /admin/dashboard
```javascript
// Response
{
  "success": true,
  "data": {
    "stats": {
      "total_bookings": 1250,
      "pending": 15,
      "revenue": 1875000,
      "active_partners": 45
    },
    "recent_bookings": [...]
  }
}
```

---

### Bookings

#### GET /admin/bookings
```javascript
// Query: ?status=pending&date_from=2024-01-01&date_to=2024-01-31
// Response
{
  "success": true,
  "data": {
    "bookings": [...]
  }
}
```

#### PATCH /admin/bookings/:id/status
```javascript
// Request
{
  "status": "confirmed"
}
```

#### POST /admin/bookings/:id/assign-partner
```javascript
// Request
{
  "partner_id": "uuid"
}

// Auto-assigns if partner_id not provided
```

---

### Partners

#### GET /admin/partners
```javascript
// Response
{
  "success": true,
  "data": {
    "partners": [...]
  }
}
```

#### POST /admin/partners
```javascript
// Create partner
{
  "name": "Priya Sharma",
  "phone_number": "+919876543210",
  "service_categories": ["Facial", "Waxing"]
}
```

#### PATCH /admin/partners/:id
```javascript
// Update partner
{
  "is_active": true,
  "is_available": true
}
```

---

### Services

#### GET /admin/services
```javascript
// Get all services
```

#### POST /admin/services
```javascript
// Create service
{
  "name": "Facial - Minimal",
  "category": "Facial",
  "tier": "Minimal",
  "product_cost": 1000,
  "market_price": 1200
}
```

#### PUT /admin/services/:id
```javascript
// Update service
```

---

## Node.js + Express Implementation

### Project Structure
```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   ├── checkout.js
│   │   ├── payments.js
│   │   └── admin.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── checkoutController.js
│   │   └── adminController.js
│   ├── services/
│   │   ├── supabase.js
│   │   ├── razorpay.js
│   │   ├── otp.js
│   │   └── partnerAssignment.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── adminAuth.js
│   │   └── errorHandler.js
│   └── utils/
│       ├── validation.js
│       └── helpers.js
├── package.json
└── server.js
```

### package.json
```json
{
  "name": "minuteserv-backend",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "@supabase/supabase-js": "^2.38.4",
    "razorpay": "^2.9.2",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5"
  }
}
```

### server.js (Main Entry)
```javascript
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./src/routes/auth');
const bookingRoutes = require('./src/routes/bookings');
const checkoutRoutes = require('./src/routes/checkout');
const paymentRoutes = require('./src/routes/payments');
const adminRoutes = require('./src/routes/admin');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', bookingRoutes);
app.use('/api/v1/checkout', checkoutRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### src/services/supabase.js
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
```

### src/services/razorpay.js
```javascript
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpay;
```

### src/routes/checkout.js
```javascript
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { prepareCheckout, confirmBooking } = require('../controllers/checkoutController');

router.post('/prepare', auth, prepareCheckout);
router.post('/confirm', auth, confirmBooking);

module.exports = router;
```

### src/controllers/checkoutController.js
```javascript
const supabase = require('../services/supabase');
const razorpay = require('../services/razorpay');

// POST /checkout/prepare
exports.prepareCheckout = async (req, res) => {
  try {
    const { service_ids, promo_code, address_id } = req.body;
    const userId = req.user.id;

    // Get services
    const { data: services } = await supabase
      .from('services')
      .select('*')
      .in('id', service_ids)
      .eq('is_active', true);

    // Calculate pricing
    let subtotal = services.reduce((sum, s) => sum + s.product_cost, 0);
    let discount = 0;

    // Validate promo code
    if (promo_code) {
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promo_code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (promo && new Date(promo.valid_until) > new Date()) {
        discount = promo.discount_type === 'percentage'
          ? (subtotal * promo.discount_value) / 100
          : promo.discount_value;
      }
    }

    const tax = (subtotal - discount) * 0.18;
    const grandTotal = subtotal - discount + tax;

    // Generate preview ID (2 min TTL)
    const previewId = `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store in Redis or memory (for 2 minutes)
    // For simplicity, return immediately

    res.json({
      success: true,
      data: {
        preview_id: previewId,
        services: services.map(s => ({
          id: s.id,
          name: s.name,
          quantity: 1,
          unit_price: s.product_cost
        })),
        pricing: {
          subtotal,
          discount,
          tax,
          grand_total: grandTotal
        },
        available_slots: generateTimeSlots()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /checkout/confirm
exports.confirmBooking = async (req, res) => {
  try {
    const {
      preview_id,
      payment_method,
      address_id,
      booking_date,
      booking_time,
      customer_name,
      customer_phone,
      customer_email,
      services // Array of {service_id, quantity}
    } = req.body;
    const userId = req.user.id;

    // Create booking
    const bookingNumber = `BK-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Calculate pricing (same logic as prepare)
    const { data: serviceData } = await supabase
      .from('services')
      .select('*')
      .in('id', services.map(s => s.service_id));

    let subtotal = serviceData.reduce((sum, s, i) => {
      return sum + (s.product_cost * services[i].quantity);
    }, 0);

    const tax = subtotal * 0.18;
    const grandTotal = subtotal + tax;
    const partnerPayout = grandTotal * 0.70; // 70% to partner

    // Store services as JSON
    const servicesJson = serviceData.map((s, i) => ({
      service_id: s.id,
      name: s.name,
      quantity: services[i].quantity,
      price: s.product_cost
    }));

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_number: bookingNumber,
        user_id: userId,
        address_id,
        services: servicesJson,
        booking_date,
        booking_time,
        payment_method,
        payment_status: payment_method === 'cash' ? 'pending' : 'pending',
        total_price: subtotal,
        tax,
        grand_total: grandTotal,
        partner_payout: partnerPayout,
        customer_name,
        customer_phone,
        customer_email,
        status: payment_method === 'cash' ? 'pending' : 'pending'
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // If online payment, create Razorpay order
    if (payment_method === 'online') {
      const order = await razorpay.orders.create({
        amount: grandTotal * 100, // in paise
        currency: 'INR',
        receipt: bookingNumber,
        notes: {
          booking_id: booking.id,
          booking_number: bookingNumber
        }
      });

      await supabase
        .from('payments')
        .insert({
          booking_id: booking.id,
          razorpay_order_id: order.id,
          amount: grandTotal,
          status: 'pending'
        });

      await supabase
        .from('bookings')
        .update({ razorpay_order_id: order.id })
        .eq('id', booking.id);

      // Auto-assign partner for cash, wait for payment for online
      if (payment_method === 'cash') {
        await assignPartner(booking.id);
      }

      res.json({
        success: true,
        data: {
          booking: {
            id: booking.id,
            booking_number: bookingNumber
          },
          payment: {
            order_id: order.id,
            amount: order.amount,
            key: process.env.RAZORPAY_KEY_ID
          }
        }
      });
    } else {
      // Cash payment - assign partner immediately
      await assignPartner(booking.id);

      res.json({
        success: true,
        data: {
          booking: {
            id: booking.id,
            booking_number: bookingNumber,
            status: 'pending'
          },
          message: 'Booking created. Partner will be assigned shortly.'
        }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper: Assign partner
async function assignPartner(bookingId) {
  const { data: booking } = await supabase
    .from('bookings')
    .select('services, address_id, booking_date, booking_time')
    .eq('id', bookingId)
    .single();

  // Get service categories from booking
  const categories = booking.services.map(s => {
    const service = services.find(svc => svc.id === s.service_id);
    return service?.category;
  }).filter(Boolean);

  // Find available partner
  const { data: partners } = await supabase
    .from('partners')
    .select('*')
    .eq('is_active', true)
    .eq('is_available', true);

  // Simple assignment: First available partner
  // TODO: Implement scoring algorithm
  const partner = partners[0];

  if (partner) {
    await supabase
      .from('bookings')
      .update({
        partner_id: partner.id,
        assignment_status: 'assigned',
        assigned_at: new Date()
      })
      .eq('id', bookingId);
  }
}
```

---

## Key Simplifications

### 1. Combined Tables
- **Bookings**: Stores services as JSON instead of separate table
- **Partners**: Simplified fields, removed complex earnings tracking
- **Payments**: Single table, no separate transactions

### 2. Reduced Endpoints
- **15 Customer endpoints** (vs 30+)
- **8 Admin endpoints** (vs 30+)
- Combined dashboard endpoint
- 2-step checkout (prepare + confirm)

### 3. Supabase Features Used
- **Row Level Security (RLS)**: Automatic user data isolation
- **Real-time**: For booking status updates (optional)
- **Storage**: For service images
- **Auth**: Could use Supabase Auth (optional)

### 4. Simplified Logic
- Partner assignment: First available (can enhance later)
- No complex earnings tracking (calculate on-demand)
- No separate payout system (manual via admin)

---

## Environment Variables

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your-secret-key

# JWT
JWT_SECRET=your-secret-key

# Server
PORT=3000
NODE_ENV=development
```

---

## Next Steps for Implementation

1. **Setup Supabase Project**
   - Create tables using SQL above
   - Enable Row Level Security
   - Set up Storage bucket for images

2. **Create Express App**
   - Install dependencies
   - Setup routes & controllers
   - Add middleware (auth, error handling)

3. **Implement Core Features**
   - OTP service (Twilio/MSG91)
   - Razorpay integration
   - Partner assignment logic

4. **Add Admin Panel** (Optional)
   - Simple React/Vue dashboard
   - Or use Supabase Dashboard

---

## Scaling Path

When you need to scale:
1. Add separate earnings table
2. Add payout system
3. Enhance partner assignment algorithm
4. Add analytics tables
5. Split into microservices (if needed)

---

**This minimal architecture maintains all functionality while being solo-developer friendly!**

