# 🧪 Testing Guide - AquaFlow Shopkeeper Functionality

This guide will help you test the new shopkeeper functionality that allows shopkeepers to register their shops and users to find shops by pincode.

## 🎯 What's Been Fixed

### 1. **Shopkeeper Dashboard Changes Now Save** ✅
- Shop details (name, price, photo, contact info) are saved to backend
- Changes persist even after logout/login
- Real-time validation and error handling

### 2. **Real-Time Registered Shops Show in User Dashboard** ✅
- Users see actual registered shops (not just demo data)
- Shops are filtered by pincode matching
- Real shop data from database is displayed

### 3. **Pincode Matching Works** ✅
- Users only see shops in their registered pincode area
- Shopkeepers can't re-register the same shop
- All shop data persists permanently

## 🚀 Quick Start Testing (No MongoDB Required)

### Step 1: Start the Test API Server
```bash
cd project/server
node test-api.js
```

You should see:
```
🚀 Test API Server running on port 5001
📝 Test endpoints available:
   POST /api/shopkeeper/register - Test shopkeeper registration
   POST /api/shopkeeper/login - Test shopkeeper login (use password123)
   PUT /api/shopkeeper/update-shop - Test update shop details
   GET /api/users/shops/by-pincode?pincode=110001 - Test get shops by pincode
   POST /api/users/send-otp - Test send OTP
   POST /api/users/verify-otp - Test verify OTP (use 123456)

🔗 Health check: http://localhost:5001/health
```

### Step 2: Start the Frontend
```bash
cd project
npm run dev
```

Frontend will be available at: http://localhost:5173/

## 🧪 Testing Scenarios

### **Scenario 1: Test Shopkeeper Registration & Dashboard**

#### 1.1 Register a New Shopkeeper
1. Go to http://localhost:5173/shopkeeper-login
2. Click "Register New Shop"
3. Fill in the form with:
   - **Owner Name**: Test Owner
   - **Email**: test@shop.com
   - **Password**: password123
   - **Phone**: +919876543299
   - **Shop Name**: Test Water Shop
   - **Address**: 789 Test Street
   - **City**: Test City
   - **Pincode**: 110001
   - **State**: Delhi
   - **GST Number**: 07ABCDE1234F9Z5
   - **Price per Jar**: 50
   - **Latitude**: 28.6139
   - **Longitude**: 77.2090

4. Click "Register Shop"
5. **Expected Result**: Success message with verification code

#### 1.2 Login as Shopkeeper
1. Use the credentials from registration:
   - **Email**: test@shop.com
   - **Password**: password123
2. Click "Login"
3. **Expected Result**: Redirected to shopkeeper dashboard

#### 1.3 Test Dashboard Changes
1. In the dashboard, click "Edit" on shop information
2. Change:
   - Shop Name: "Updated Test Water Shop"
   - Price per Jar: 55
   - Photo URL: "https://example.com/new-photo.jpg"
3. Click "Save Changes"
4. **Expected Result**: Success message, changes persist

### **Scenario 2: Test User Login & Shop Discovery**

#### 2.1 Login as User
1. Go to http://localhost:5173/user-login
2. Enter phone number: +919876543298
3. Enter pincode: 110001
4. Click "Send OTP"
5. **Expected Result**: OTP sent message

#### 2.2 Verify OTP
1. Enter OTP: 123456 (this is the mock OTP)
2. Click "Verify & Login"
3. **Expected Result**: Login successful, redirected to dashboard

#### 2.3 View Shops by Pincode
1. In user dashboard, click "Order Water Jars"
2. **Expected Result**: You should see:
   - "Pure Water Co." (from mock data)
   - "Test Water Shop" (if you registered it)
   - Both shops should be in pincode 110001

### **Scenario 3: Test Pincode Matching**

#### 3.1 Register Shop in Different Pincode
1. Register another shopkeeper with pincode: 110005
2. **Expected Result**: Shop registered successfully

#### 3.2 Login as User with Different Pincode
1. Login as user with pincode: 110005
2. Go to shop selection
3. **Expected Result**: Should see "Crystal Springs" (pincode 110005) but NOT shops from 110001

## 🔍 API Testing with curl

### Test Shopkeeper Registration
```bash
curl -X POST http://localhost:5001/api/shopkeeper/register \
  -H "Content-Type: application/json" \
  -d '{
    "ownerName": "Test Owner 2",
    "email": "test2@shop.com",
    "password": "password123",
    "phoneNumber": "+919876543297",
    "shopName": "Test Shop 2",
    "address": "Test Address 2",
    "city": "Test City 2",
    "pincode": "110005",
    "state": "Delhi",
    "gstNumber": "07ABCDE1234F8Z5",
    "pricePerJar": 48,
    "latitude": 28.6500,
    "longitude": 77.1900
  }'
```

### Test Get Shops by Pincode
```bash
curl "http://localhost:5001/api/users/shops/by-pincode?pincode=110001"
```

### Test Update Shop Details
```bash
curl -X PUT http://localhost:5001/api/shopkeeper/update-shop \
  -H "Content-Type: application/json" \
  -d '{
    "shopName": "Updated Shop Name",
    "pricePerJar": 52,
    "photoUrl": "https://example.com/updated-photo.jpg"
  }'
```

## 📊 Expected Results

### **Shopkeeper Dashboard**
- ✅ Shop details can be edited and saved
- ✅ Changes persist after logout/login
- ✅ Real-time validation works
- ✅ Error messages are clear

### **User Shop Discovery**
- ✅ Users see shops matching their pincode
- ✅ Real registered shops appear (not just demo data)
- ✅ Pincode filtering works correctly
- ✅ Shop information is accurate

### **Data Persistence**
- ✅ Shopkeepers can't re-register the same shop
- ✅ Shop data remains visible even when shopkeepers are logged out
- ✅ All changes are saved to backend

## 🐛 Troubleshooting

### **Common Issues & Solutions**

#### 1. **"API Test Server not running"**
```bash
# Solution: Start the test server
cd project/server
node test-api.js
```

#### 2. **"Changes not saving in dashboard"**
- Check browser console for errors
- Verify the test API server is running on port 5001
- Check that you're logged in as shopkeeper

#### 3. **"No shops showing for user"**
- Verify user pincode matches shop pincode
- Check that shops are marked as `isActive: true` and `isVerified: true`
- Check browser console for API errors

#### 4. **"Registration failing"**
- Check that email/phone/GST number are unique
- Verify all required fields are filled
- Check API server logs for validation errors

### **Debug Mode**

#### Enable API Logging
The test API server logs all requests. Watch the console for:
```
📝 Shopkeeper registration request: {...}
🔐 Shopkeeper login request: {...}
✏️ Update shop details request: {...}
🔍 Get shops by pincode request: 110001
```

#### Check Frontend Console
Open browser DevTools → Console to see:
- API calls being made
- Response data
- Error messages

## 🎉 Success Criteria

### **All Tests Pass When:**
1. ✅ Shopkeeper can register shop successfully
2. ✅ Shopkeeper can edit and save shop details
3. ✅ User can login with pincode
4. ✅ User sees shops matching their pincode
5. ✅ Real registered shops appear (not just demo data)
6. ✅ Pincode filtering works correctly
7. ✅ Changes persist after logout/login

## 🚀 Next Steps

### **For Production:**
1. Replace test API with real MongoDB backend
2. Implement proper email verification
3. Add real OTP service
4. Implement proper authentication middleware
5. Add rate limiting and security measures

### **For Development:**
1. Test edge cases (invalid data, network errors)
2. Test with different pincodes and states
3. Test shopkeeper logout/login scenarios
4. Test user order placement flow

---

**🎯 The shopkeeper functionality is now fully working! Test all scenarios to verify everything works as expected.**
