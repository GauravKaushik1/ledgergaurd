const { Schema } = require('mongoose');

module.exports = new Schema({
  idempotencyKey: { type: String, required: true, unique: true, index: true },
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['COMPLETED', 'ROLLED_BACK'], default: 'COMPLETED' },
  metadata: { type: Object }
}, { timestamps: true });
