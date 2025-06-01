import cron from "node-cron";
import Invoice from "../models/invoiceModel.js";
import ReminderHistory from "../models/reminderHistory.js";
import SMTPConfig from "../models/smtpConfigModel.js";  // import SMTPConfig model
import { sendEmail } from "../utils/sendEmail.js";

export const sendAutomatedReminders = async () => {
  try {
    // Fetch invoices with planId and user populated (just _id)
    const invoices = await Invoice.find({ planId: { $ne: null } })
      .populate({ path: "planId", select: "days" })    // Populate only plan.days
      .populate({ path: "createdBy", select: "_id" }); // Populate user _id only

    console.log("Fetched invoices with populated plans:");
    invoices.forEach(inv => {
      console.log(`Invoice ${inv._id}: plan.days =`, inv.planId?.days);
    });

    for (const invoice of invoices) {
      const plan = invoice.planId;
      const user = invoice.createdBy;

      if (!plan) {
        console.log(`Skipping invoice ${invoice._id}: No plan assigned.`);
        continue;
      }

      if (!Array.isArray(plan.days)) {
        console.log(`Skipping invoice ${invoice._id}: plan.days is not an array.`);
        continue;
      }

      if (plan.days.length === 0 || plan.days.some(day => typeof day !== "number")) {
        console.log(`Skipping invoice ${invoice._id}: Invalid plan days.`);
        continue;
      }

      if (!user) {
        console.log(`Skipping invoice ${invoice._id}: Missing user.`);
        continue;
      }

      // Fetch SMTP config for the user explicitly
      const smtpConfig = await SMTPConfig.findOne({ user: user._id });
      if (!smtpConfig) {
        console.log(`Skipping invoice ${invoice._id}: Missing SMTP config.`);
        continue;
      }

      // Calculate invoice age in days
      const invoiceAge = Math.floor(
        (Date.now() - new Date(invoice.createdAt)) / (1000 * 60 * 60 * 24)
      );

      if (!plan.days.includes(invoiceAge)) {
        continue; // Not a day to send reminder yet
      }

      // Check if reminder already sent
      const alreadySent = await ReminderHistory.findOne({
        invoiceId: invoice._id,
        reminderDay: invoiceAge,
      });
      if (alreadySent) {
        continue;
      }

      try {
        const result = await sendEmail({
          to: invoice.clientEmail,
          subject: `Reminder for Invoice #${invoice.invoiceNumber || invoice._id}`,
          text: `Hello, this is a reminder for your invoice created on ${invoice.createdAt.toDateString()}. Please check your account for details.`,
          smtpConfig,  // pass smtpConfig here
        });

        if (result.success) {
          await ReminderHistory.create({
            invoiceId: invoice._id,
            reminderDay: invoiceAge,
          });
          console.log(`Sent reminder for invoice ${invoice._id} (day ${invoiceAge})`);
        } else {
          console.error(`Failed to send email for invoice ${invoice._id}:`, result.error);
        }
      } catch (err) {
        console.error(`Email sending error for invoice ${invoice._id}:`, err.message);
      }
    }
  } catch (err) {
    console.error("Error in sendAutomatedReminders:", err);
  }
};

// Cron job every minute for testing (adjust as needed)
cron.schedule("30 9 * * *", () => {
  console.log("Running reminder job...");
  sendAutomatedReminders();
});

