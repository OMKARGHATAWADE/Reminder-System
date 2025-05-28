import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    days: [
      {
        type: Number,
        required: true,
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps:true }
);

export default mongoose.model("Plan", planSchema);
