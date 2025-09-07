const fs = require('fs');
const path = require('path');

// Data storage files
const DATA_DIR = path.join(__dirname, 'data');
const SHOPS_FILE = path.join(DATA_DIR, 'shops.json');
const SHOPKEEPERS_FILE = path.join(DATA_DIR, 'shopkeepers.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
const initializeDataFiles = () => {
  if (!fs.existsSync(SHOPS_FILE)) {
    fs.writeFileSync(SHOPS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(SHOPKEEPERS_FILE)) {
    fs.writeFileSync(SHOPKEEPERS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
};

// Read data from file
const readData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return [];
  }
};

// Write data to file
const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
    return false;
  }
};

// Shopkeeper operations
const shopkeeperStore = {
  // Create new shopkeeper
  create: (shopkeeperData) => {
    const shopkeepers = readData(SHOPKEEPERS_FILE);
    const newShopkeeper = {
      id: `keeper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...shopkeeperData,
      createdAt: new Date().toISOString(),
      isVerified: true,
      isActive: true
    };
    
    shopkeepers.push(newShopkeeper);
    if (writeData(SHOPKEEPERS_FILE, shopkeepers)) {
      return { success: true, data: newShopkeeper };
    }
    return { success: false, message: 'Failed to save shopkeeper' };
  },

  // Find shopkeeper by email
  findByEmail: (email) => {
    const shopkeepers = readData(SHOPKEEPERS_FILE);
    return shopkeepers.find(k => k.email === email);
  },

  // Update shopkeeper
  update: (id, updateData) => {
    const shopkeepers = readData(SHOPKEEPERS_FILE);
    const index = shopkeepers.findIndex(k => k.id === id);
    
    if (index !== -1) {
      shopkeepers[index] = { ...shopkeepers[index], ...updateData };
      if (writeData(SHOPKEEPERS_FILE, shopkeepers)) {
        return { success: true, data: shopkeepers[index] };
      }
    }
    return { success: false, message: 'Shopkeeper not found or update failed' };
  }
};

// Shop operations
const shopStore = {
  // Create new shop
  create: (shopData) => {
    const shops = readData(SHOPS_FILE);
    const newShop = {
      id: `shop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...shopData,
      createdAt: new Date().toISOString(),
      isActive: true,
      isVerified: true,
      rating: 4.5,
      totalReviews: 0,
      totalOrders: 0,
      monthlyRevenue: 0
    };
    
    shops.push(newShop);
    if (writeData(SHOPS_FILE, shops)) {
      return { success: true, data: newShop };
    }
    return { success: false, message: 'Failed to save shop' };
  },

  // Find shops by pincode
  findByPincode: (pincode) => {
    const shops = readData(SHOPS_FILE);
    return shops.filter(shop => shop.pincode === pincode && shop.isActive && shop.isVerified);
  },

  // Update shop
  update: (id, updateData) => {
    const shops = readData(SHOPS_FILE);
    const index = shops.findIndex(s => s.id === id);
    
    if (index !== -1) {
      shops[index] = { ...shops[index], ...updateData, updatedAt: new Date().toISOString() };
      if (writeData(SHOPS_FILE, shops)) {
        return { success: true, data: shops[index] };
      }
    }
    return { success: false, message: 'Shop not found or update failed' };
  },

  // Find shop by shopkeeper ID
  findByShopkeeperId: (shopkeeperId) => {
    const shops = readData(SHOPS_FILE);
    return shops.find(s => s.shopkeeperId === shopkeeperId);
  }
};

// User operations
const userStore = {
  // Create or update user
  createOrUpdate: (userData) => {
    const users = readData(USERS_FILE);
    const existingUserIndex = users.findIndex(u => u.phoneNumber === userData.phoneNumber);
    
    if (existingUserIndex !== -1) {
      // Update existing user
      users[existingUserIndex] = { ...users[existingUserIndex], ...userData, updatedAt: new Date().toISOString() };
    } else {
      // Create new user
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...userData,
        createdAt: new Date().toISOString(),
        isActive: true,
        isVerified: true
      };
      users.push(newUser);
    }
    
    if (writeData(USERS_FILE, users)) {
      return { success: true, data: users[existingUserIndex !== -1 ? existingUserIndex : users.length - 1] };
    }
    return { success: false, message: 'Failed to save user' };
  },

  // Find user by phone number
  findByPhone: (phoneNumber) => {
    const users = readData(USERS_FILE);
    return users.find(u => u.phoneNumber === phoneNumber);
  }
};

// Initialize data files
initializeDataFiles();

module.exports = {
  shopkeeperStore,
  shopStore,
  userStore
};
