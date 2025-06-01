import mongoose, { mongo } from "mongoose";

const reminderHistorySchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
    required: true,
  },
  reminderDay: {
    type: Number,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("ReminderHistory", reminderHistorySchema);
