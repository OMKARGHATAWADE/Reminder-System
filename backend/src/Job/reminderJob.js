import cron from "node-cron";
import Invoice from "../models/invoiceModel.js";
import ReminderHistory from "../models/reminderHistoryModel.js";
import sendEmail from "../utils/sendEmail.js";

export const sendAutomatedReminders = async () => {
  try {
    const invoices = await Invoice.find({ planId: { $ne: null } })
      .populate({ path: "planId", select: "days" })
      .populate({ path: "userId", select: "smtpConfig" });

    for (const invoice of invoices) {
      const plan = invoice.planId;
      const user = invoice.userId;

      if (!plan || !plan.days) continue;
      if (!user || !user.smtpConfig) continue;

      const invoiceAge = Math.floor(
        (Date.now() - new Date(invoice.createdAt)) / (1000 * 60 * 60 * 24)
      );

      if (!plan.days.includes(invoiceAge)) continue;

      const alreadySent = await ReminderHistory.findOne({
        invoiceId: invoice._id,
        reminderDay: invoiceAge,
      });
      if (alreadySent) continue;

      try {
        await sendEmail({
          to: invoice.clientEmail,
          subject: `Reminder for Invoice #${invoice._id}`,
          text: `Hello, this is a reminder for your invoice created on ${invoice.createdAt.toDateString()}. Please check your account for details.`,
          smtpConfig: user.smtpConfig,
        });

        await ReminderHistory.create({
          invoiceId: invoice._id,
          reminderDay: invoiceAge,
        });

        console.log(
          `Sent reminder for invoice ${invoice._id} (day ${invoiceAge})`
        );
      } catch (err) {
        console.error(` Email failed for invoice ${invoice._id}:`, err.message);
      }
    }
  } catch (err) {
    console.error(" Error in sendAutomatedReminders:", err);
  }
};

cron.schedule("0 9 * * *", () => {
  console.log(" Running reminder job at 9 AM...");
  sendAutomatedReminders();
});
