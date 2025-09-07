# Water Jar Delivery Backend

A comprehensive Node.js backend for water jar delivery service with authentication, order management, payments, and real-time tracking.

## Features

### 🔐 Authentication
- Phone number + OTP based authentication
- JWT token-based authorization
- Separate user and shopkeeper authentication
- Rate limiting and security measures

### 👥 User Management
- User registration and login
- Address management with geolocation
- Order history and subscription management

### 🏪 Shop Management
- Shop registration with GST verification
- Order management dashboard
- Subscription tracking
- Revenue analytics

### 📦 Order System
- One-time order placement
- Subscription plans (15, 30, 45 jars/month)
- Order status tracking
- Delivery assignment

### 💳 Payment Integration
- Multiple payment methods (UPI, Card, Wallet, Cash)
- Automatic subscription billing
- Invoice generation
- Refund processing

### 📍 Tracking System
- Real-time delivery tracking
- Google Maps integration (mocked)
- Delivery boy location updates
- ETA calculations

### 📱 Notifications
- WhatsApp Business API integration (mocked)
- SMS notifications
- Order status updates
- Payment confirmations

## API Endpoints

### User APIs
```
POST /api/users/signup          - Register new user
POST /api/users/login           - Login with phone + OTP
GET  /api/users/shops           - Get nearby shops
```

### Order APIs
```
POST /api/orders/one-time       - Place one-time order
POST /api/orders/subscription   - Create subscription
GET  /api/orders/history        - Get order history
```

### Shop APIs
```
POST /api/shop/signup           - Register new shop
POST /api/shop/login            - Shop login
GET  /api/shop/orders           - Get shop orders
PUT  /api/shop/order/:id/deliver - Mark order as delivered
GET  /api/shop/subscriptions    - Get shop subscriptions
```

### Payment APIs
```
POST /api/payment/initiate      - Initiate payment
POST /api/payment/monthly       - Process monthly payment
```

### Tracking APIs
```
GET  /api/tracking/order/:id    - Get delivery status
POST /api/tracking/location     - Update delivery location
POST /api/tracking/assign       - Assign delivery boy
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update MongoDB URI and other configurations

3. **Database Setup**
   ```bash
   # Seed sample data
   node server/scripts/seedData.js
   ```

4. **Start Server**
   ```bash
   # Development
   npm run server

   # Production
   npm run server:prod
   ```

## Database Schema

### Users Collection
- Phone number, name, email
- Multiple delivery addresses
- Authentication tracking

### Shops Collection
- Shop details, owner info
- GST number, pricing
- Location coordinates
- Ratings and reviews

### Orders Collection
- Order details and status
- Payment information
- Delivery tracking
- Customer feedback

### Subscriptions Collection
- Subscription plans
- Delivery schedules
- Payment tracking
- Auto-renewal settings

### Payments Collection
- Payment records
- Gateway responses
- Invoice generation
- Refund tracking

## Security Features

- JWT-based authentication
- Rate limiting
- Input validation with Joi
- CORS protection
- Helmet security headers
- OTP attempt limiting

## Mock Services

The following services are mocked for development:

- **OTP Service**: Console logging instead of actual SMS
- **Payment Gateway**: Mock responses with 90% success rate
- **WhatsApp API**: Console logging of messages
- **Google Maps**: Mock distance and geocoding
- **Invoice Generation**: Mock PDF URLs

## Production Considerations

To deploy in production, integrate with:

1. **SMS Gateway**: Twilio, MSG91, or similar
2. **Payment Gateway**: Razorpay, Stripe, or PayU
3. **WhatsApp Business API**: Meta's official API
4. **Google Maps API**: For real geocoding and directions
5. **Cloud Storage**: AWS S3 or Google Cloud for invoices
6. **Email Service**: SendGrid or AWS SES for invoices
7. **Database**: MongoDB Atlas or self-hosted MongoDB
8. **Caching**: Redis for OTP storage and session management

## Error Handling

- Comprehensive error middleware
- Validation error responses
- Database error handling
- Payment failure scenarios
- Network timeout handling

## Monitoring & Logging

- Request/response logging
- Error tracking
- Performance monitoring
- Payment audit trails
- User activity logs