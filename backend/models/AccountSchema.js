const { Schema } = require('mongoose');

module.exports = new Schema({
  organizationName: { type: String, required: true },
  balance: { type: Number, required: true, default: 0, min: 0 }, // Stored in cents/paise
  currency: { type: String, default: 'USD' }
}, { timestamps: true });
