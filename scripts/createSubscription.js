/*
  Helper script to create a user subscription via backend API.
  Steps:
  1) Discover a shop by pincode
  2) Send OTP and verify to get a user JWT
  3) Create a subscription for that shop
*/

const BASE = 'http://localhost:5000/api';

async function getJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

async function fetchShopsByPincode(pincode) {
  const res = await fetch(`${BASE}/users/shops/by-pincode?pincode=${encodeURIComponent(pincode)}`);
  const json = await getJson(res);
  if (!res.ok) throw new Error(`shops ${pincode} failed: ${json.message || res.status}`);
  return Array.isArray(json?.data?.shops) ? json.data.shops : [];
}

async function sendOtp(phoneNumber, pincode) {
  const res = await fetch(`${BASE}/users/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, pincode })
  });
  const json = await getJson(res);
  if (!res.ok || !json.success) throw new Error(`send-otp failed: ${json.message || res.status}`);
  return json;
}

async function verifyOtp(phoneNumber, otp) {
  const res = await fetch(`${BASE}/users/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, otp })
  });
  const json = await getJson(res);
  if (!res.ok || !json.success || !json?.data?.token) throw new Error(`verify-otp failed: ${json.message || res.status}`);
  return json.data.token;
}

async function createSubscription(token, shopId, userAddress) {
  const payload = {
    shopId,
    plan: '30-jars',
    deliveryAddress: { address: userAddress },
    deliveryFrequency: 'weekly',
    paymentMethod: 'upi'
  };
  const res = await fetch(`${BASE}/orders/subscription`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const json = await getJson(res);
  if (!res.ok || !json.success) throw new Error(`create-subscription failed: ${json.message || res.status}`);
  return json;
}

(async () => {
  try {
    const desiredPincodes = ['560001', '584101'];
    let shops = [];
    let pickedPincode = desiredPincodes[0];
    for (const pc of desiredPincodes) {
      try {
        shops = await fetchShopsByPincode(pc);
        if (shops.length > 0) { pickedPincode = pc; break; }
      } catch {}
    }
    if (shops.length === 0) throw new Error('No active shops found by pincode. Please register a shop first.');

    const shop = shops[0];
    console.log('Using shop:', { id: shop._id, name: shop.shopName, pincode: shop.pincode });

    const phoneNumber = '+911234567890';
    const address = '12 MG Road, Bengaluru';

    await sendOtp(phoneNumber, pickedPincode);
    const token = await verifyOtp(phoneNumber, '123456');
    console.log('Obtained user token. Creating subscription...');

    const result = await createSubscription(token, shop._id, address);
    console.log('Subscription created:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    process.exitCode = 1;
  }
})();


