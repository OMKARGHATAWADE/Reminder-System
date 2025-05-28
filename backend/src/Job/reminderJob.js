import cron from 'node-cron';
import Invoice from './models/Invoice.js';
import ReminderHistory from './models/ReminderHistory.js';
import sendEmail from './utils/sendEmail.js';

// 💡 Main logic to send reminders
const sendAutomatedReminders = async () => {
  const invoices = await Invoice.find({ planId: { $ne: null } }).populate('planId userId');

  for (const invoice of invoices) {
    const invoiceAge = Math.floor((Date.now() - new Date(invoice.createdAt)) / (1000 * 60 * 60 * 24));
    const plan = invoice.planId;

    if (!plan?.days.includes(invoiceAge)) continue;

    const alreadySent = await ReminderHistory.findOne({
      invoiceId: invoice._id,
      reminderDay: invoiceAge,
    });

    if (alreadySent) continue;

    const smtpConfig = invoice.userId.smtpConfig;
    if (!smtpConfig) continue;

    try {
      await sendEmail({
        to: invoice.clientEmail,
        subject: `Reminder for Invoice #${invoice._id}`,
        text: `Hello, this is a reminder for your invoice.`,
        smtpConfig,
      });

      await ReminderHistory.create({
        invoiceId: invoice._id,
        reminderDay: invoiceAge,
      });

      console.log(`✅ Sent reminder for invoice ${invoice._id} (day ${invoiceAge})`);
    } catch (err) {
      console.error(`❌ Email failed for invoice ${invoice._id}:`, err.message);
    }
  }
};

// ⏰ Run daily at 9 AM
cron.schedule('0 9 * * *', () => {
  console.log('🔔 Running reminder job at 9 AM...');
  sendAutomatedReminders();
});
