import mongoose from "mongoose";

const reminderConfigurationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    configName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    reminderDays: {
      type: [Number], // Example: [1, 7, 14, 30]
      required: true,
    },
    alternateEmail: {
      type: String,
      match: /.+\@.+\..+/,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ReminderConfiguration = mongoose.model("ReminderConfiguration", reminderConfigurationSchema);
export default ReminderConfiguration;
