const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: false, index: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open', index: true },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);


