const Counter = require('../models/Counter');

/** Generate unique order ID: WM-YYYYMMDD-000123 */
const generateOrderNumber = async () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const dateKey = `${y}${m}${d}`;
  const key = `order-${dateKey}`;

  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  const seq = String(counter.seq).padStart(6, '0');
  return `WM-${dateKey}-${seq}`;
};

const generateTrackingNumber = (courierCode = 'LX') => {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  const ts = Date.now().toString().slice(-6);
  return `${courierCode}-${ts}${rand}`;
};

const generateInvoiceNumber = (orderNumber) =>
  `INV-${orderNumber.replace('WM-', '')}`;

/** Estimated delivery: +5 days from now */
const getEstimatedDelivery = (days = 5) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

const addTimelineEvent = (order, { stage, title, description, location }) => {
  order.timeline.push({
    stage,
    title: title || stage,
    description: description || '',
    location: location || order.currentLocation || '',
    completed: true,
    at: new Date(),
  });
  order.currentStage = stage;
};

module.exports = {
  generateOrderNumber,
  generateTrackingNumber,
  generateInvoiceNumber,
  getEstimatedDelivery,
  addTimelineEvent,
};
