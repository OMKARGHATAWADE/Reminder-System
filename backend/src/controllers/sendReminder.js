import Invoice from "../models/invoiceModel.js";
import SMTPConfig from "../models/smtpConfigModel.js";
import { sendEmail } from "../utils/sendEmail.js";

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
        message: "Invoice not found or Not authorized",
      });
    }

    const smtpConfig = await SMTPConfig.findOne({ user: userId });
    if (!smtpConfig) {
      return res.status(400).json({
        message: "smtpConfiguration is not setUp.",
      });
    }

    await sendEmail({
      smtpConfig,
      to: invoice.clientEmail,
      subject: `Payment Reminder - RoamRanger Pvt Ltd | Invoice #${invoice.invoiceNumber}`,
      text: `Dear ${invoice.clientName},

We hope you're doing well.

This is a gentle reminder from RoamRanger Pvt Ltd regarding your pending invoice #${invoice.invoiceNumber}.

Amount Due: $${invoice.amount}
Service: ${invoice.service}

We kindly request you to complete the payment at your earliest convenience. If you’ve already made the payment, please disregard this message.

Thank you for choosing RoamRanger.

Best regards,
RoamRanger Pvt Ltd
`,
      html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #007BFF;">RoamRanger Pvt Ltd</h2>
      <p>Dear <strong>${invoice.clientName}</strong>,</p>
      <p>This is a friendly reminder regarding your pending invoice.</p>
      <ul>
        <li><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</li>
        <li><strong>Amount:</strong> $${invoice.amount}</li>
        <li><strong>Service:</strong> ${invoice.service}</li>
      </ul>
      <p>Please make the payment at your earliest convenience.</p>
      <p>If you've already paid, kindly ignore this message.</p>
      <br>
      <p>Thank you for your business,</p>
      <p><strong>Team RoamRanger Pvt Ltd</strong></p>
    </div>
  `,
    });
    res.status(200).json({ message: "Reminder email sent successfully." });
  } catch (error) {
    console.error("Error sending reminder:", error);
    res.status(500).json({ message: "Failed to send reminder email." });
  }
};
