# 🏪 Shopkeeper Functionality - AquaFlow

This document explains the new shopkeeper functionality that allows shopkeepers to register their shops and users to find shops by pincode.

## 🎯 Features Implemented

### 1. **Shopkeeper Registration & Authentication**
- Shopkeepers can register with email, password, and shop details
- Email verification system with 6-digit codes
- Secure password hashing using bcrypt
- JWT-based authentication
- Prevention of duplicate registrations

### 2. **Shop Management**
- Each shopkeeper can have one shop
- Shops are automatically linked to shopkeepers
- Shop details include pincode, location, pricing, and GST information
- Shops remain visible even when shopkeepers are logged out

### 3. **User-Shop Matching by Pincode**
- Users provide pincode during registration/login
- Users can see all shops in their pincode area
- Shops are displayed regardless of shopkeeper login status
- Real-time shop availability and pricing

### 4. **Data Persistence**
- All shop data is stored in MongoDB
- Shops remain in the system permanently once registered
- Shopkeepers cannot re-register the same shop

## 🗄️ Database Models

### Shopkeeper Model
```javascript
{
  email: String (unique),
  password: String (hashed),
  ownerName: String,
  phoneNumber: String (unique),
  isVerified: Boolean,
  isActive: Boolean,
  verificationCode: Object,
  lastLogin: Date
}
```

### Shop Model
```javascript
{
  shopkeeperId: ObjectId (ref: Shopkeeper),
  shopName: String,
  address: String,
  city: String,
  pincode: String (required),
  coordinates: { latitude: Number, longitude: Number },
  gstNumber: String (unique),
  pricePerJar: Number,
  isActive: Boolean,
  isVerified: Boolean
}
```

### User Model
```javascript
{
  phoneNumber: String (unique),
  name: String,
  email: String,
  pincode: String (required),
  addresses: Array,
  isActive: Boolean
}
```

## 🚀 API Endpoints

### Shopkeeper Routes (`/api/shopkeeper`)

#### Public Routes
- `POST /register` - Register new shopkeeper and shop
- `POST /login` - Shopkeeper login
- `POST /verify-email` - Verify email with code
- `POST /resend-verification` - Resend verification code

#### Protected Routes
- `GET /profile` - Get shopkeeper and shop profile

### User Routes (`/api/users`)
- `POST /send-otp` - Send OTP with pincode
- `POST /verify-otp` - Verify OTP and login
- `GET /shops` - Get shops by pincode/location

## 🔧 Setup Instructions

### 1. **Install Dependencies**
```bash
cd project/server
npm install
```

### 2. **Set Environment Variables**
Create a `.env` file in the server directory:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/aquaflow
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. **Start MongoDB**
Make sure MongoDB is running on your system or use MongoDB Atlas.

### 4. **Seed Database (Optional)**
```bash
cd project/server
npm run seed
```

### 5. **Start Backend Server**
```bash
cd project/server
npm run dev
```

### 6. **Start Frontend**
```bash
cd project
npm run dev
```

## 🧪 Testing the Functionality

### 1. **Test Database Connection**
```bash
cd project/server
node test-functionality.js
```

### 2. **Test Shopkeeper Registration**
```bash
curl -X POST http://localhost:5001/api/shopkeeper/register \
  -H "Content-Type: application/json" \
  -d '{
    "ownerName": "Test Owner",
    "email": "test@shop.com",
    "password": "password123",
    "phoneNumber": "+919876543299",
    "shopName": "Test Shop",
    "address": "Test Address",
    "city": "Test City",
    "pincode": "110001",
    "state": "Delhi",
    "gstNumber": "07ABCDE1234F9Z5",
    "pricePerJar": 50,
    "latitude": 28.6139,
    "longitude": 77.2090
  }'
```

### 3. **Test User OTP with Pincode**
```bash
curl -X POST http://localhost:5001/api/users/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543298",
    "pincode": "110001"
  }'
```

## 📱 Frontend Integration

### Shopkeeper Registration
```typescript
import { shopkeeperService } from '../services/shopkeeperService';

const registerShopkeeper = async (data) => {
  const response = await shopkeeperService.registerShopkeeper(data);
  if (response.success) {
    // Handle success
    console.log('Shopkeeper registered:', response.data);
  } else {
    // Handle error
    console.error('Registration failed:', response.message);
  }
};
```

### User Login with Pincode
```typescript
import { authService } from '../services/authService';

const sendOTP = async (phoneNumber, pincode) => {
  const response = await authService.sendOTP(phoneNumber, pincode);
  if (response.success) {
    // Handle OTP sent
    console.log('OTP sent:', response.data);
  }
};
```

## 🔒 Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt
2. **JWT Tokens**: Secure authentication with JWT
3. **Input Validation**: Comprehensive validation using Joi
4. **Rate Limiting**: API rate limiting to prevent abuse
5. **Email Verification**: Required email verification for shopkeepers

## 🚨 Important Notes

1. **Shopkeeper Registration**: Once a shopkeeper registers, they cannot register again with the same email/phone
2. **Shop Visibility**: Shops remain visible to users even when shopkeepers are logged out
3. **Pincode Matching**: Users only see shops in their registered pincode area
4. **Data Persistence**: All shop data is permanently stored and cannot be deleted by shopkeepers

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string in `.env` file

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes using the port

3. **Validation Errors**
   - Check input data format
   - Ensure all required fields are provided

4. **Email Not Sending**
   - Check EmailJS configuration
   - Verify email service credentials

## 📞 Support

For issues or questions:
1. Check the console logs for error messages
2. Verify database connection
3. Test individual API endpoints
4. Check validation schemas

---

**🎉 The shopkeeper functionality is now fully implemented and ready for use!**
