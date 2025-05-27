import express from "express";
import { createInvoice, getInvoices } from "../controllers/invoiceController.js";
import { authMiddelware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/invoice", authMiddelware, createInvoice);
router.get("/getInvoices", authMiddelware, getInvoices);

export default router;
