const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const ensureInvoiceDir = () => {
  const dir = path.join(__dirname, '../uploads/invoices');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const generateInvoicePDF = (invoice, vendor, purchaseOrder) => {
  return new Promise((resolve, reject) => {
    const dir = ensureInvoiceDir();
    const filePath = path.join(dir, `${invoice.invoiceNumber}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`PO Number: ${purchaseOrder.poNumber}`);
    doc.text(`Date: ${new Date(invoice.generatedAt).toLocaleDateString()}`);
    doc.text(`Vendor: ${vendor.companyName}`);
    doc.text(`GST: ${vendor.gstNumber}`);
    doc.moveDown();

    doc.text('Items:', { underline: true });
    invoice.lineItems.forEach((item) => {
      doc.text(
        `${item.productService} | Qty: ${item.quantity} | Unit: ${item.unitPrice} | Total: ${item.totalPrice}`
      );
    });

    doc.moveDown();
    doc.text(`Subtotal: ${invoice.subtotal}`);
    doc.text(`Tax (${invoice.taxRate}%): ${invoice.taxAmount}`);
    doc.fontSize(14).text(`Total: ${invoice.totalAmount}`, { underline: true });

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};

module.exports = { generateInvoicePDF };
