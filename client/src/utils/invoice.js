export const downloadInvoicePdf = async (invoice) => {
  const [{ jsPDF }, autoTableMod] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const autoTable = autoTableMod.default;
  const doc = new jsPDF();
  const gold = [201, 162, 39];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...gold);
  doc.text('LuxeWatch', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium Timepieces · Invoice', 14, 28);

  doc.setTextColor(20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice: ${invoice.invoiceNumber}`, 14, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Order: ${invoice.orderNumber}`, 14, 48);
  doc.text(`Date: ${new Date(invoice.date).toLocaleDateString('en-PK')}`, 14, 54);
  doc.text(`Payment: ${(invoice.paymentMethod || '').toUpperCase()} (${invoice.paymentStatus})`, 14, 60);

  const c = invoice.customer || {};
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To', 120, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(c.fullName || '', 120, 48);
  doc.text(c.street || '', 120, 54);
  doc.text(`${c.city || ''}, ${c.state || ''} ${c.zipCode || ''}`, 120, 60);
  doc.text(`Phone: ${c.phone || ''}`, 120, 66);
  if (invoice.email) doc.text(invoice.email, 120, 72);

  autoTable(doc, {
    startY: 82,
    head: [['Product', 'Qty', 'Price', 'Total']],
    body: (invoice.items || []).map((i) => [
      i.name,
      String(i.quantity),
      `Rs ${Number(i.price).toLocaleString()}`,
      `Rs ${Number(i.price * i.quantity).toLocaleString()}`,
    ]),
    headStyles: { fillColor: gold, textColor: 20 },
    styles: { fontSize: 9 },
  });

  const y = (doc.lastAutoTable?.finalY || 100) + 10;
  doc.text(`Subtotal: Rs ${Number(invoice.itemsPrice).toLocaleString()}`, 140, y);
  doc.text(`Shipping: Rs ${Number(invoice.shippingPrice).toLocaleString()}`, 140, y + 6);
  doc.text(`Tax: Rs ${Number(invoice.taxPrice).toLocaleString()}`, 140, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...gold);
  doc.text(`Total: Rs ${Number(invoice.totalPrice).toLocaleString()}`, 140, y + 20);

  doc.save(`${invoice.invoiceNumber || 'invoice'}.pdf`);
};
