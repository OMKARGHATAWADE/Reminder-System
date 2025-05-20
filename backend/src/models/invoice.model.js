import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    client: {
      name: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      phone: {
        type: String,  
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    business: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      logoUrl: {
        type: String,
      },
    },
    service: {
      description: {
        type: String,
        required: true,
      },
      amount: {  
        type: Number,
        required: true,
      },
    },
    planDays: {
      type: [Number], 
      required: true,
    },
    reminderEmail: { 
      type: String, 
      required: true,
    },
    remindersSent: [
      {
        day: Number,   
        sentAt: Date,
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
