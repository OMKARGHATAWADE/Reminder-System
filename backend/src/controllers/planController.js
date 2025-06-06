import Invoice from "../models/invoiceModel.js";
import Plan from "../models/planModel.js";

export const createPlan = async (req, res) => {
  try {
    const { name, days } = req.body;
    const userId = req.user._id;

    // Validate name and days presence
    if (!name || !days) {
      return res
        .status(400)
        .json({ message: "Name and days array are required" });
    }

    // Validate days is an array
    if (!Array.isArray(days)) {
      return res.status(400).json({ message: "Days must be an array" });
    }

    // Convert days to numbers and validate each day
    const parsedDays = days.map((day) => Number(day));
    if (parsedDays.some((day) => isNaN(day) || day < 0)) {
      return res
        .status(400)
        .json({ message: "Days must be an array of non-negative numbers" });
    }

    const newPlan = new Plan({
      name,
      days: parsedDays,
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
    const userId = req.user._id;

    // Check invoice exists and belongs to user
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      createdBy: userId,
    });
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    // Check plan exists and belongs to user
    const plan = await Plan.findOne({
      _id: planId,
      user: userId,
    });
    if (!plan) {
      return res
        .status(404)
        .json({ message: "Plan not found or not authorized." });
    }

    // Assign planId to invoice and save
    invoice.planId = planId;
    await invoice.save();

    res.status(200).json({
      message: "Plan assigned to invoice",
      invoice,
    });
  } catch (error) {
    console.error("Error assigning plan to invoice:", error);
    res
      .status(500)
      .json({ message: "Server error while assigning plan to invoice." });
  }
};

export const plans = async (req, res) => {
  try {
    const plans = await Plan.find({ user: req.user._id });
    res.status(200).json({ plans });
  } catch (error) {
    console.error("Failed to load plans:", error);
    res.status(500).json({ message: "Failed to load plans" });
  }
};
