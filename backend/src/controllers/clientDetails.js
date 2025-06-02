// controllers/clientDetails.js
import Invoice from "../models/invoiceModel.js";
import ReminderHistory from "../models/reminderHistory.js";
import Plan from "../models/planModel.js";

export const getClientDetailsByInvoiceNumber = async (req, res) => {
  try {
    const invoiceNumber = req.params.invoiceNumber;

    // Find invoice by invoiceNumber
    const invoice = await Invoice.findOne({ invoiceNumber })
      .populate({
        path: "planId",
        select: "name days",
      })
      .lean();

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Get reminder history for this invoice
    const reminderHistory = await ReminderHistory.find({ invoiceId: invoice._id })
      .select("reminderDay createdAt")
      .lean();

    invoice.reminderHistory = reminderHistory.map((r) => ({
      _id: r._id,
      reminderDay: r.reminderDay,
      sentAt: r.createdAt,
    }));

    // Prepare client details from invoice fields
    const client = {
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      businessEmail: invoice.businessEmail,
    };

    res.json({
      client,
      invoice,
    });
  } catch (err) {
    console.error("Error in getClientDetailsByInvoiceNumber:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const getInvoicesByClientEmail = async (req, res) => {
  try {
    const clientEmail = req.params.clientEmail;

    if (!clientEmail) {
      return res.status(400).json({ error: "clientEmail param is required" });
    }

    // Get all invoices for this clientEmail
    const invoices = await Invoice.find({ clientEmail })
      .populate({ path: "planId", select: "name days" })
      .lean();

    // Attach reminder history to each invoice
    for (let invoice of invoices) {
      const history = await ReminderHistory.find({
        invoiceId: invoice._id,
      }).select("reminderDay createdAt");

      invoice.reminderHistory = history.map((r) => ({
        _id: r._id,
        reminderDay: r.reminderDay,
        sentAt: r.createdAt,
      }));
    }

    res.json({ clientEmail, invoices });
  } catch (err) {
    console.error("Error in getInvoicesByClientEmail:", err);
    res.status(500).json({ error: "Server error" });
  }
};