const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    orderNumber: String,
    to: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'order_placed',
        'payment_success',
        'order_confirmed',
        'packed',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'refunded',
        'status_update',
      ],
      required: true,
    },
    subject: String,
    message: String,
    channel: { type: String, enum: ['email', 'sms', 'in_app'], default: 'email' },
    sent: { type: Boolean, default: false },
    error: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
