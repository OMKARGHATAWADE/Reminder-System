import cron from "node-cron";
import Invoice from "../models/invoiceModel.js";
import ReminderHistory from "../models/reminderHistory.js";
import SMTPConfig from "../models/smtpConfigModel.js";
import { sendEmail } from "../utils/sendEmail.js";

// Utility to calculate date difference in full calendar days
const getDaysBetween = (from, to) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);

  return Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24));
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
        const result = await sendEmail({
          to: invoice.clientEmail,
          subject: `Reminder for Invoice #${invoice.invoiceNumber || invoice._id}`,
          text: `Hello, this is a reminder for your invoice created on ${invoice.createdAt.toDateString()}. Please check your account for details.`,
          smtpConfig,
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

// Cron job every minute (for testing)
cron.schedule("30 9 * * *", () => {
  console.log("🔁 Running reminder job...");
  sendAutomatedReminders();
});
