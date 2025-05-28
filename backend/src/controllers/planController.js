import Invoice from "../models/invoiceModel.js";
import Plan from "../models/planModel.js";

export const createPlan = async (req, res) => {
  try {
    const { name, days } = req.body;
    const userId = req.user._id;

    if (!name || !days || !Array.isArray(days)) {
      return res
        .status(400)
        .json({ message: "Name and days array are required" });
    }

    const newPlan = new Plan({
      name,
      days,
      user: userId,
    });
    await newPlan.save();

    res.status(201).json({ message: "Plan created", plan: newPlan });
  } catch (error) {
    console.error("Plan creation error:", error);
    res.status(500).json({ message: "Server error during plan creation" });
  }
};

export const assignPlanToInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { planId } = req.body;
    const { userId } = req.user._id;

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      createdBy: userId,
    });
    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not Found.",
      });
    }

    invoice.planId = planId;
    await invoice.save();

    res.status(200).json({
      message: "Plan assigned to invoice",
      invoice,
    });
  } catch (error) {}
};
