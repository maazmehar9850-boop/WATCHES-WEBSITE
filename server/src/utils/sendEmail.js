const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

const getTransporter = () => {
  const user = (process.env.EMAIL_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || '').trim();
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

const formatPKR = (amount) => `Rs ${Number(amount || 0).toLocaleString('en-PK')}`;

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleString('en-PK', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—';

const trackUrl = (orderNumber) => {
  const base = (
    process.env.CLIENT_URL?.split(',')[0]?.trim() ||
    'https://watches-website-psi.vercel.app'
  ).replace(/\/$/, '');
  return `${base}/track-order?id=${encodeURIComponent(orderNumber)}`;
};

const wrapTemplate = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#0a0a0b;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0b;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#141416;border:1px solid #c9a22744;max-width:600px;">
        <tr>
          <td style="padding:28px 32px;border-bottom:1px solid #c9a22733;">
            <p style="margin:0;font-size:28px;color:#c9a227;letter-spacing:2px;">LuxeWatch</p>
            <p style="margin:8px 0 0;font-size:13px;color:#aaa;font-family:Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;">${title}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;color:#f5f2eb;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #c9a22722;color:#888;font-size:12px;font-family:Arial,sans-serif;">
            © ${new Date().getFullYear()} LuxeWatch · Premium Timepieces
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const itemsTable = (order) => {
  const rows = (order.orderItems || [])
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #333;">${i.name}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #333;text-align:center;">${i.quantity}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #333;text-align:right;">${formatPKR(i.price * i.quantity)}</td>
      </tr>`
    )
    .join('');
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border-collapse:collapse;">
      <tr style="background:#1c1c1e;">
        <th style="padding:10px 8px;text-align:left;color:#c9a227;font-size:12px;">PRODUCT</th>
        <th style="padding:10px 8px;text-align:center;color:#c9a227;font-size:12px;">QTY</th>
        <th style="padding:10px 8px;text-align:right;color:#c9a227;font-size:12px;">TOTAL</th>
      </tr>
      ${rows}
    </table>`;
};

const addressBlock = (order) => {
  const a = order.shippingAddress || {};
  return `${a.fullName || ''}<br/>${a.street || ''}<br/>${a.city || ''}, ${a.state || ''} ${a.zipCode || ''}<br/>${a.country || ''}<br/>Phone: ${a.phone || ''}`;
};

const trackButton = (orderNumber) => `
  <p style="margin:28px 0 8px;">
    <a href="${trackUrl(orderNumber)}" style="display:inline-block;background:#c9a227;color:#0a0a0b;text-decoration:none;padding:14px 28px;font-weight:bold;letter-spacing:1px;font-size:13px;">
      TRACK ORDER
    </a>
  </p>`;

const TEMPLATES = {
  order_placed: (order) => ({
    subject: `Order Confirmed — ${order.orderNumber}`,
    html: wrapTemplate(
      'Order Placed',
      `
      <p>Dear <strong>${order.shippingAddress?.fullName || 'Customer'}</strong>,</p>
      <p>Thank you for shopping with LuxeWatch. Your order has been placed successfully.</p>
      <p><strong>Order ID:</strong> ${order.orderNumber}<br/>
      <strong>Total:</strong> ${formatPKR(order.totalPrice)}<br/>
      <strong>Payment:</strong> ${(order.paymentMethod || 'cod').toUpperCase()} (${order.paymentStatus})<br/>
      <strong>Estimated Delivery:</strong> ${formatDate(order.estimatedDelivery)}</p>
      ${itemsTable(order)}
      <p><strong>Shipping Address</strong><br/>${addressBlock(order)}</p>
      ${trackButton(order.orderNumber)}
      `
    ),
  }),
  payment_success: (order) => ({
    subject: `Payment Received — ${order.orderNumber}`,
    html: wrapTemplate(
      'Payment Successful',
      `<p>We have received your payment of <strong>${formatPKR(order.totalPrice)}</strong> for order <strong>${order.orderNumber}</strong>.</p>
       <p>Transaction ID: ${order.transactionId || order.paymentId || '—'}</p>
       ${trackButton(order.orderNumber)}`
    ),
  }),
  order_confirmed: (order) => ({
    subject: `Order Confirmed — ${order.orderNumber}`,
    html: wrapTemplate(
      'Order Confirmed',
      `<p>Your order <strong>${order.orderNumber}</strong> has been confirmed and is being prepared.</p>
       ${trackButton(order.orderNumber)}`
    ),
  }),
  packed: (order) => ({
    subject: `Order Packed — ${order.orderNumber}`,
    html: wrapTemplate(
      'Packed',
      `<p>Your package for order <strong>${order.orderNumber}</strong> is packed and ready for courier pickup.</p>
       ${trackButton(order.orderNumber)}`
    ),
  }),
  shipped: (order) => ({
    subject: `Order Shipped — ${order.orderNumber}`,
    html: wrapTemplate(
      'Shipped',
      `<p>Your order <strong>${order.orderNumber}</strong> is on the way!</p>
       <p><strong>Courier:</strong> ${order.courierName || '—'}<br/>
       <strong>Tracking #:</strong> ${order.trackingNumber || '—'}<br/>
       <strong>Location:</strong> ${order.currentLocation || '—'}</p>
       ${trackButton(order.orderNumber)}`
    ),
  }),
  out_for_delivery: (order) => ({
    subject: `Out for Delivery — ${order.orderNumber}`,
    html: wrapTemplate(
      'Out for Delivery',
      `<p>Great news! Order <strong>${order.orderNumber}</strong> is out for delivery today.</p>
       <p>Courier: ${order.courierName || '—'} · Rider: ${order.courierEmployee || '—'}</p>
       ${trackButton(order.orderNumber)}`
    ),
  }),
  delivered: (order) => ({
    subject: `Delivered — ${order.orderNumber}`,
    html: wrapTemplate(
      'Delivered',
      `<p>Your order <strong>${order.orderNumber}</strong> has been delivered. We hope you love your timepiece.</p>
       ${trackButton(order.orderNumber)}`
    ),
  }),
  cancelled: (order) => ({
    subject: `Order Cancelled — ${order.orderNumber}`,
    html: wrapTemplate(
      'Cancelled',
      `<p>Order <strong>${order.orderNumber}</strong> has been cancelled.${order.cancelReason ? ` Reason: ${order.cancelReason}` : ''}</p>`
    ),
  }),
  refunded: (order) => ({
    subject: `Refund Processed — ${order.orderNumber}`,
    html: wrapTemplate(
      'Refunded',
      `<p>A refund of <strong>${formatPKR(order.totalPrice)}</strong> for order <strong>${order.orderNumber}</strong> has been processed.</p>`
    ),
  }),
  status_update: (order, extra = {}) => ({
    subject: `Order Update — ${order.orderNumber}`,
    html: wrapTemplate(
      'Status Update',
      `<p>Your order <strong>${order.orderNumber}</strong> is now: <strong>${extra.stage || order.currentStage}</strong></p>
       <p>${extra.description || ''}</p>
       <p>Location: ${order.currentLocation || '—'}</p>
       ${trackButton(order.orderNumber)}`
    ),
  }),
};

const getCustomerEmail = (order) =>
  order.guestEmail || order.shippingAddress?.email || order.user?.email || '';

/**
 * Send customer email + log notification. Never throws to caller.
 */
const sendOrderEmail = async (type, order, extra = {}) => {
  const to = getCustomerEmail(order);
  const adminCc = (process.env.ORDER_NOTIFY_EMAIL || '').trim();
  const builder = TEMPLATES[type] || TEMPLATES.status_update;
  const { subject, html } = builder(order, extra);

  const record = await Notification.create({
    order: order._id,
    orderNumber: order.orderNumber,
    to: to || adminCc || 'unknown',
    type,
    subject,
    message: extra.description || subject,
    channel: 'email',
    sent: false,
  });

  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email skipped: set EMAIL_USER and EMAIL_PASS in server/.env');
    record.error = 'Email credentials missing';
    await record.save();
    return { sent: false };
  }

  if (!to && !adminCc) {
    record.error = 'No recipient';
    await record.save();
    return { sent: false };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"LuxeWatch" <${process.env.EMAIL_USER}>`,
      to: to || adminCc,
      bcc: to && adminCc && to !== adminCc ? adminCc : undefined,
      subject,
      html,
    });
    record.sent = true;
    await record.save();
    console.log(`Email [${type}] sent:`, info.messageId, '→', to || adminCc);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`Email [${type}] failed:`, err.message);
    record.error = err.message;
    await record.save();
    return { sent: false, error: err.message };
  }
};

/** Legacy admin-only notify (kept for compatibility) */
const sendOrderNotification = async (order) =>
  sendOrderEmail('order_placed', order);

module.exports = {
  sendOrderEmail,
  sendOrderNotification,
  formatPKR,
  trackUrl,
};
