import PDFDocument from "pdfkit";

export const generateInvoicePdf = async (invoice) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks = [];

    doc.on("data", chunk => chunks.push(chunk));
    doc.on("end", () => {
      const result = Buffer.concat(chunks);
      resolve(result);
    });

    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Client: ${invoice.clientName}`);
    doc.text(`Email: ${invoice.clientEmail}`);
    doc.text(`Service: ${invoice.service}`);
    doc.text(`Amount: ₹${invoice.amount}`);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);

    doc.end();
  });
};
