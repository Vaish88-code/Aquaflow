const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5001';

async function testAPI() {
  console.log('🧪 Testing AquaFlow API endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);

    // Test 2: Shopkeeper registration
    console.log('\n2️⃣ Testing shopkeeper registration...');
    const regResponse = await fetch(`${API_BASE}/api/shopkeeper/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ownerName: 'akash',
        email: 'akash@paani.com',
        password: 'password123',
        phoneNumber: '+917411382100',
        shopName: 'paani',
        address: 'wd',
        city: 'Maharashtra',
        pincode: '584101',
        state: 'Maharashtra',
        gstNumber: '27ABCDE1234F9Z5',
        pricePerJar: 45,
        latitude: 16.7050,
        longitude: 75.8839
      })
    });
    const regData = await regResponse.json();
    console.log('✅ Registration:', regData.success ? 'SUCCESS' : 'FAILED');
    if (regData.success) {
      console.log('   Shopkeeper ID:', regData.data.shopkeeperId);
      console.log('   Shop ID:', regData.data.shopId);
    }

    // Test 3: Get shops by pincode
    console.log('\n3️⃣ Testing get shops by pincode...');
    const shopsResponse = await fetch(`${API_BASE}/api/users/shops/by-pincode?pincode=584101`);
    const shopsData = await shopsResponse.json();
    console.log('✅ Shops by pincode:', shopsData.success ? 'SUCCESS' : 'FAILED');
    if (shopsData.success) {
      console.log(`   Found ${shopsData.data.shops.length} shops in pincode 584101`);
      shopsData.data.shops.forEach(shop => {
        console.log(`   - ${shop.shopName} (${shop.pricePerJar}₹/jar)`);
      });
    }

    // Test 4: Send OTP
    console.log('\n4️⃣ Testing OTP sending...');
    const otpResponse = await fetch(`${API_BASE}/api/users/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: '+917411382100',
        pincode: '584101'
      })
    });
    const otpData = await otpResponse.json();
    console.log('✅ OTP sending:', otpData.success ? 'SUCCESS' : 'FAILED');
    if (otpData.success) {
      console.log('   OTP:', otpData.data.message);
    }

    console.log('\n🎉 All tests completed!');
    console.log('\n📱 Now test in browser:');
    console.log('   Frontend: http://localhost:5173/');
    console.log('   Shopkeeper Login: http://localhost:5173/shopkeeper-login');
    console.log('   User Login: http://localhost:5173/user-login');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
