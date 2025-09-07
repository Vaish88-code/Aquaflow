# AquaFlow - Water Jar Delivery Platform

A modern, full-stack water jar delivery platform with email-based authentication, real-time tracking, and comprehensive order management.

## 🚀 Features

### 👤 User Features
- **Email/Password Authentication** with email verification
- **Smart Shop Discovery** based on location (pincode/state)
- **One-time Orders** with multiple payment options
- **Subscription Plans** (15, 30, 45 jars/month)
- **Real-time Order Tracking** with delivery updates
- **Order History** and subscription management
- **Multiple Delivery Addresses** support

### 🏪 Shopkeeper Features
- **Shop Registration** with GST verification
- **Order Management Dashboard** 
- **Delivery Assignment** and tracking
- **Revenue Analytics** and reporting
- **Subscription Management**

### 💳 Payment & Billing
- **Multiple Payment Methods** (UPI, Card, Wallet, Cash)
- **Automatic Subscription Billing**
- **Invoice Generation** with EmailJS
- **Refund Processing**

### 📧 Email Integration
- **EmailJS Integration** for email verification
- **Automated Email Notifications**
- **Invoice Delivery via Email**

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **EmailJS** for email services
- **Vite** for development and building

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** authentication
- **Bcrypt** for password hashing
- **Rate Limiting** and security middleware
- **Mock Services** for SMS, WhatsApp, and Payment gateways

## 📧 EmailJS Setup

To enable email verification, you need to configure EmailJS:

1. **Create EmailJS Account**
   - Go to [EmailJS](https://www.emailjs.com/)
   - Create a free account

2. **Setup Email Service**
   - Add a new service (Gmail, Outlook, etc.)
   - Configure your email credentials

3. **Create Email Template**
   - Create a new template with these variables:
     - `{{to_name}}` - Recipient's name
     - `{{verification_code}}` - 6-digit verification code
     - `{{company_name}}` - AquaFlow
     - `{{from_name}}` - AquaFlow Team

4. **Update Configuration**
   - Replace credentials in `src/config/emailjs.ts`
   - Update the EmailJS initialization in `src/services/authService.ts`

### Example Email Template:
```
Subject: Verify your AquaFlow account

Hi {{to_name}},

Welcome to {{company_name}}! Please verify your email address by entering this code in the app:

Verification Code: {{verification_code}}

This code will expire in 10 minutes.

If you didn't create an account, please ignore this email.

Best regards,
{{from_name}}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- EmailJS account (for email verification)

### Installation

1. **Clone and Install Frontend Dependencies**
   ```bash
   npm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Environment Setup**
   ```bash
   cd server
   cp .env.example .env
   # Update .env with your MongoDB URI and other configurations
   ```

4. **Configure EmailJS**
   - Update `src/config/emailjs.ts` with your EmailJS credentials
   - Update the EmailJS initialization in `src/services/authService.ts`

5. **Seed Database (Optional)**
   ```bash
   cd server
   npm run seed
   ```

### Development

1. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```

2. **Start Frontend Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📱 User Flow

### Registration & Login
1. **New User Registration**
   - Enter name, email, contact number
   - Provide complete address with pincode and state
   - Create password and confirm
   - Email verification sent via EmailJS
   - Verify email with 6-digit code
   - Login with email and password

2. **Existing User Login**
   - Enter email and password
   - Access dashboard immediately

### Ordering Process
1. **Shop Discovery**
   - Browse shops based on location (state/pincode)
   - View shop details, ratings, and pricing
   - Check real-time availability

2. **Place Order**
   - Select quantity and delivery address
   - Choose payment method
   - Track order in real-time

3. **Subscription Management**
   - Choose from 15, 30, or 45 jars/month plans
   - Automatic monthly billing
   - Flexible delivery scheduling

## 🔧 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/verify-email` - Email verification
- `POST /api/users/login` - User login
- `POST /api/users/resend-verification` - Resend verification email

### Orders
- `GET /api/users/shops` - Get nearby shops
- `POST /api/orders/one-time` - Place one-time order
- `POST /api/orders/subscription` - Create subscription
- `GET /api/orders/history` - Get order history

### Shop Management
- `POST /api/shop/register` - Shop registration
- `POST /api/shop/login` - Shop login
- `GET /api/shop/orders` - Get shop orders
- `PUT /api/shop/order/:id/deliver` - Mark order as delivered

## 🔒 Security Features

- **Email Verification** mandatory for all new accounts
- **Password Hashing** with bcrypt
- **JWT Authentication** with secure tokens
- **Rate Limiting** to prevent abuse
- **Input Validation** with Joi
- **CORS Protection** and security headers

## 🎨 Design Features

- **Modern UI/UX** with Tailwind CSS
- **Responsive Design** for all devices
- **Smooth Animations** and micro-interactions
- **Loading States** and error handling
- **Accessible Components** with proper ARIA labels

## 📦 Production Deployment

### Frontend Deployment
- Build: `npm run build`
- Deploy to Vercel, Netlify, or similar

### Backend Deployment
- Deploy to Heroku, Railway, or similar
- Configure environment variables
- Set up MongoDB Atlas
- Configure EmailJS for production

### Required Environment Variables
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@aquaflow.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

---

Built with ❤️ using React, Node.js, and EmailJS