const Joi = require('joi');

// Validation schemas
const schemas = {
  sendOTP: Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^[+]?[1-9]\d{1,14}$/)
      .required()
      .messages({
        'string.pattern.base': 'Please enter a valid phone number'
      }),
    pincode: Joi.string()
      .pattern(/^\d{6}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please enter a valid 6-digit pincode'
      })
  }),

  verifyOTP: Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^[+]?[1-9]\d{1,14}$/)
      .required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
  }),

  userRegister: Joi.object({
    name: Joi.string().trim().max(100).optional(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phoneNumber: Joi.string().pattern(/^[+]?[1-9]\d{1,14}$/).required(),
    pincode: Joi.string().pattern(/^\d{6}$/).required(),
    address: Joi.string().trim().optional()
  }),

  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  shopkeeperRegistration: Joi.object({
    ownerName: Joi.string().trim().max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phoneNumber: Joi.string()
      .pattern(/^[+]?[1-9]\d{1,14}$/)
      .required(),
    shopName: Joi.string().trim().max(100).required(),
    address: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    pincode: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        'string.pattern.base': 'Please enter a valid 6-digit pincode'
      }),
    state: Joi.string().trim().required(),
    gstNumber: Joi.string()
      .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
      .required(),
    pricePerJar: Joi.number().min(1).required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
  }),

  shopkeeperLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  emailVerification: Joi.object({
    email: Joi.string().email().required(),
    verificationCode: Joi.string().length(6).pattern(/^\d+$/).required()
  }),

  updateShopDetails: Joi.object({
    shopName: Joi.string().trim().max(100).required(),
    pricePerJar: Joi.number().min(1).max(200).required(),
    photoUrl: Joi.string().uri().optional().allow(''),
    contactNumber: Joi.string()
      .pattern(/^[+]?[1-9]\d{1,14}$/)
      .optional(),
    address: Joi.string().trim().optional(),
    city: Joi.string().trim().optional(),
    pincode: Joi.string()
      .pattern(/^\d{6}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please enter a valid 6-digit pincode'
      }),
    state: Joi.string().trim().optional()
  }),

  shopSignup: Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^[+]?[1-9]\d{1,14}$/)
      .required(),
    shopName: Joi.string().trim().max(100).required(),
    ownerName: Joi.string().trim().max(100).required(),
    address: Joi.string().trim().required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    gstNumber: Joi.string()
      .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
      .required(),
    photoUrl: Joi.string().uri().optional(),
    pricePerJar: Joi.number().min(1).required()
  }),

  oneTimeOrder: Joi.object({
    shopId: Joi.string().hex().length(24).required(),
    quantity: Joi.number().min(1).max(50).required(),
    deliveryAddress: Joi.object({
      address: Joi.string().trim().required(),
      landmark: Joi.string().trim().optional(),
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional()
    }).required(),
    paymentMethod: Joi.string().valid('upi', 'card', 'wallet', 'cash').required(),
    notes: Joi.string().max(500).optional()
  }),

  subscription: Joi.object({
    shopId: Joi.string().hex().length(24).required(),
    plan: Joi.string().valid('5-jars', '8-jars', '10-jars', '15-jars', '30-jars', '45-jars').required(),
    deliveryAddress: Joi.object({
      address: Joi.string().trim().required(),
      landmark: Joi.string().trim().optional(),
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional()
    }).required(),
    deliveryFrequency: Joi.string().valid('weekly', 'bi-weekly', 'monthly').default('weekly'),
    paymentMethod: Joi.string().valid('upi', 'card', 'wallet').required()
  })
};

// Validation middleware factory
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({
        success: false,
        message: 'Validation schema not found'
      });
    }

    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = { validate };