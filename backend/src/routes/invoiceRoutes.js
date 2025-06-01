import express from "express";
import {
  createInvoice,
  getInvoices,
} from "../controllers/invoiceController.js";
import { authMiddelware } from "../middleware/authMiddleware.js";
import { assignPlanToInvoice } from "../controllers/planController.js";

const router = express.Router();

router.post("/invoice", authMiddelware, createInvoice);
router.get("/getInvoices", authMiddelware, getInvoices);
router.patch("/:invoiceId/assign-plan", authMiddelware, assignPlanToInvoice);

export default router;
