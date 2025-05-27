import express from "express";
import { createInvoice, getInvoices } from "../controllers/invoiceController";
import { authMiddelware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/invoice", authMiddelware, createInvoice);
router.get("/getInvoices", authMiddelware, getInvoices);

export default router;
