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
      subject: `Reminder: Invoice #${invoice.invoiceNumber}`,
      text: `Hi ${invoice.clientName},\n\nThis is reminder for your invoice #${invoice.invoiceNumber} of amount $${invoice.amount} for the service: ${invoice.service}.`,
      html: `<p>Hi <strong>${invoice.clientName}</strong>,</p><p>This is a reminder for your <strong>invoice #${invoice.invoiceNumber}</strong> of amount <strong>$${invoice.amount}</strong> for the service: <em>${invoice.service}</em>.</p>`,
    });
    res.status(200).json({ message: "Reminder email sent successfully." });
  } catch (error) {
    console.error("Error sending reminder:", error);
    res.status(500).json({ message: "Failed to send reminder email." });
  }
};
