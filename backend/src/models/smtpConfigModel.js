import mongoose from "mongoose";

const smtpConfigSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    host: {
      type: String,
      required: true,
    },
    port: {
      type: Number,
      required: true,
    },
    secure: {
      type: Boolean,
      default: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const SMTPConfig = mongoose.model("SMTPConfig", smtpConfigSchema);
export default SMTPConfig;
