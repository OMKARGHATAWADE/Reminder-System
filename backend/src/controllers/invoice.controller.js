import Invoice from "../models/invoice.model.js";

export const createInvoice = async (req, res) => {
  try {
    const {
      invoiceNumber,
      client,
      business,
      service,
      planDays,
      reminderEmail,
    } = req.body;

    // Basic validation
    if (
      !invoiceNumber ||
      !client?.name ||
      !client?.email ||
      !business?.name ||
      !business?.email ||
      !service?.description ||
      !service?.amount ||
      !planDays ||
      planDays.length === 0 ||
      !reminderEmail
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create invoice document
    const invoice = new Invoice({
      invoiceNumber,
      client,
      business,
      service,
      planDays,
      reminderEmail,
    });

    // Save to DB
    await invoice.save();

    // Respond success with created invoice
    res.status(201).json({
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ message: "Server error" });
  }
};
