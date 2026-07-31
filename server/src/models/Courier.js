const mongoose = require('mongoose');

const courierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    website: { type: String, default: '' },
    employees: [
      {
        name: String,
        phone: String,
        role: { type: String, default: 'Rider' },
      },
    ],
    vehicles: [
      {
        type: { type: String, default: 'Bike' },
        number: String,
        model: String,
      },
    ],
    hubs: [{ type: String }],
    isActive: { type: Boolean, default: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Courier', courierSchema);
