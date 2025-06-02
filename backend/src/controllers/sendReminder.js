import Invoice from "../models/invoiceModel.js";
import SMTPConfig from "../models/smtpConfigModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateInvoicePdf } from "../utils/generateInvoicePdf.js";

export const sendReminder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { invoiceId } = req.params;

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      createdBy: userId,
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found or you are not authorized to access it.",
      });
    }

    const smtpConfig = await SMTPConfig.findOne({ user: userId });
    if (!smtpConfig) {
      return res.status(400).json({
        message: "SMTP configuration is not set up. Please configure it before sending reminders.",
      });
    }

    // Generate PDF buffer for the invoice
    const pdfBuffer = await generateInvoicePdf(invoice);

    // Compose professional email text and HTML
    const emailText = `Dear ${invoice.clientName},

We hope this message finds you well.

This is a courteous reminder regarding your pending invoice #${invoice.invoiceNumber}.

Amount Due: ₹${invoice.amount}
Service: ${invoice.service}
Invoice Date: ${new Date(invoice.createdAt).toLocaleDateString()}

Please find the attached invoice in PDF format for your reference.

Kindly process the payment at your earliest convenience. If you have already made the payment, please disregard this message.

Should you have any questions or require assistance, feel free to contact us.

Best regards,
RoamRanger Pvt Ltd`;

    const emailHtml = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #007BFF;">RoamRanger Pvt Ltd</h2>
      <p>Dear <strong>${invoice.clientName}</strong>,</p>
      <p>This is a courteous reminder regarding your pending invoice.</p>
      <ul>
        <li><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</li>
        <li><strong>Amount Due:</strong> ₹${invoice.amount}</li>
        <li><strong>Service:</strong> ${invoice.service}</li>
        <li><strong>Invoice Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</li>
      </ul>
      <p>Please find the attached invoice in PDF format for your reference.</p>
      <p>Kindly process the payment at your earliest convenience. If you have already paid, please ignore this email.</p>
      <br />
      <p>Should you have any questions or require assistance, feel free to contact us.</p>
      <p><strong>Best regards,</strong><br />RoamRanger Pvt Ltd</p>
    </div>
    `;

    await sendEmail({
      smtpConfig,
      to: invoice.clientEmail,
      subject: `Payment Reminder - RoamRanger Pvt Ltd | Invoice #${invoice.invoiceNumber}`,
      text: emailText,
      html: emailHtml,
      attachments: [
        {
          filename: `Invoice-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    res.status(200).json({ message: "Reminder email sent successfully." });
  } catch (error) {
    console.error("Error sending reminder:", error);
    res.status(500).json({ message: "Failed to send reminder email." });
  }
};
