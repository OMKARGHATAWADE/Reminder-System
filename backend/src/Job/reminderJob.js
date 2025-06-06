import cron from "node-cron";
import Invoice from "../models/invoiceModel.js";
import ReminderHistory from "../models/reminderHistory.js";
import SMTPConfig from "../models/smtpConfigModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateInvoicePdf } from "../utils/generateInvoicePdf.js"; // <-- You must create this

// Utility to calculate date difference in full calendar days
const getDaysBetween = (from, to) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);

  return Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24));
};

// Helper to generate polite, professional email text with gentle final reminder
const getEmailText = (invoice, reminderDay, planDays) => {
  const lastDay = Math.max(...planDays);

  const invoiceDetails =
`Invoice Number: ${invoice.invoiceNumber}  
Amount Due: ₹${invoice.amount}  
Service: ${invoice.service}  
Invoice Date: ${new Date(invoice.createdAt).toDateString()}\n\n`;

  if (reminderDay === lastDay) {
    // Polite final reminder
    return `Dear ${invoice.clientName || "Customer"},\n\n` +
      `We hope this message finds you well.\n\n` +
      `This is a kind final reminder regarding your outstanding payment for the invoice detailed below:\n\n` +
      invoiceDetails +
      `We kindly request that you process the payment at your earliest convenience to avoid any unintended disruptions.\n\n` +
      `If you have already completed the payment, please disregard this message.\n\n` +
      `Thank you for your attention to this matter.\n\n` +
      `Warm regards,\n${invoice.businessName || "Your Company"}\n${invoice.businessEmail}`;
  } else {
    // Regular polite reminder
    return `Dear ${invoice.clientName || "Customer"},\n\n` +
      `We hope this message finds you well.\n\n` +
      `This is a friendly reminder that your payment for the following invoice is pending:\n\n` +
      invoiceDetails +
      `Please make the payment at your earliest convenience.\n\n` +
      `If you’ve already completed the payment, please disregard this message.\n\n` +
      `Warm regards,\n${invoice.businessName || "Your Company"}\n${invoice.businessEmail}`;
  }
};

export const sendAutomatedReminders = async () => {
  try {
    const invoices = await Invoice.find({ planId: { $ne: null } })
      .populate({ path: "planId", select: "days" })
      .populate({ path: "createdBy", select: "_id" });

    console.log("Fetched invoices with populated plans:");
    invoices.forEach(inv => {
      console.log(`Invoice ${inv._id}: plan.days =`, inv.planId?.days);
    });

    for (const invoice of invoices) {
      const plan = invoice.planId;
      const user = invoice.createdBy;

      if (!plan || !Array.isArray(plan.days)) {
        console.log(`Skipping invoice ${invoice._id}: Invalid or missing plan.`);
        continue;
      }

      if (!user) {
        console.log(`Skipping invoice ${invoice._id}: Missing user.`);
        continue;
      }

      const smtpConfig = await SMTPConfig.findOne({ user: user._id });
      if (!smtpConfig) {
        console.log(`Skipping invoice ${invoice._id}: Missing SMTP config.`);
        continue;
      }

      const invoiceAge = getDaysBetween(invoice.createdAt, Date.now());
      console.log(`Invoice ${invoice._id}: invoiceAge = ${invoiceAge}`);

      if (!plan.days.includes(invoiceAge)) {
        console.log(`Skipping invoice ${invoice._id}: Day ${invoiceAge} not in plan.`);
        continue;
      }

      const alreadySent = await ReminderHistory.findOne({
        invoiceId: invoice._id,
        reminderDay: invoiceAge,
      });
      if (alreadySent) {
        console.log(`Reminder already sent for invoice ${invoice._id} on day ${invoiceAge}`);
        continue;
      }

      try {
        // Generate PDF and get buffer
        const pdfBuffer = await generateInvoicePdf(invoice);

        // Compose polite professional message with final reminder logic
        const emailText = getEmailText(invoice, invoiceAge, plan.days);

        const result = await sendEmail({
          to: invoice.clientEmail,
          subject: `Payment Reminder: Invoice #${invoice.invoiceNumber}`,
          text: emailText,
          smtpConfig,
          attachments: [
            {
              filename: `Invoice-${invoice.invoiceNumber}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf"
            }
          ]
        });

        if (result.success) {
          await ReminderHistory.create({
            invoiceId: invoice._id,
            reminderDay: invoiceAge,
          });
          console.log(`✅ Sent reminder for invoice ${invoice._id} (day ${invoiceAge})`);
        } else {
          console.error(`❌ Failed to send email for invoice ${invoice._id}:`, result.error);
        }
      } catch (err) {
        console.error(`❌ Email sending error for invoice ${invoice._id}:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Error in sendAutomatedReminders:", err);
  }
};

// Cron job (9:30 AM every day)
cron.schedule("* * * * *", () => {
  console.log("🔁 Running reminder job at 9AM IST...");
  sendAutomatedReminders();
}, {
  timezone: "Asia/Kolkata"
});

