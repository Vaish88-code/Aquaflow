const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Shop = require('../models/Shop');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Verify user authentication
const verifyUser = async (req, res, next) => {
  try {
    await verifyToken(req, res, async () => {
      if (req.user.type !== 'user') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. User authentication required.'
        });
      }

      const user = await User.findById(req.user.id);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive.'
        });
      }

      req.userDoc = user;
      next();
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

// Verify shop authentication
const verifyShop = async (req, res, next) => {
  try {
    await verifyToken(req, res, async () => {
      if (req.user.type !== 'shop') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Shop authentication required.'
        });
      }

      const shop = await Shop.findById(req.user.id);
      if (!shop || !shop.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Shop not found or inactive.'
        });
      }

      req.shopDoc = shop;
      next();
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

module.exports = {
  verifyToken,
  verifyUser,
  verifyShop
};