import Invoice from "../models/invoiceModel.js";

export const createInvoice = async (req, res) => {
  try {
    const {
      invoiceNumber,
      clientName,
      clientEmail,
      businessEmail,
      service,
      amount,
    } = req.body;

    if (
      !invoiceNumber ||
      !clientName ||
      !clientEmail ||
      !businessEmail ||
      !service ||
      !amount
    ) {
      return res.status(400).json({
        message: "All fiels are required to create Invoice.",
      });
    }

    const existingInvoice = await Invoice.findOne({ invoiceNumber });
    if (existingInvoice) {
      return res.status(400).json({
        message: `Invoice number "${invoiceNumber}" already exists.`,
      });
    }

    const newInvoice = new Invoice({
      invoiceNumber,
      clientName,
      clientEmail,
      businessEmail,
      service,
      amount,
      createdBy: req.user._id,
    });

    await newInvoice.save();

    res.status(200).json({
      message: "Invoice created Successfully.",
      invoice: newInvoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const userId = req.user._id;
    const invoices = await Invoice.find({ createdBy: userId });
    res.status(200).json({
      message: "All invoices created by the User.",
      success: true,
      invoices,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
