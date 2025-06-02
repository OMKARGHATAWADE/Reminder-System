// routes/clientRoutes.js
import express from "express";
import {  getClientDetailsByInvoiceNumber, getInvoicesByClientEmail } from "../controllers/clientDetails.js";
import { authMiddelware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/invoice/:invoiceNumber", authMiddelware, getClientDetailsByInvoiceNumber);
router.get("/invoices/:clientEmail", authMiddelware, getInvoicesByClientEmail);

export default router;
