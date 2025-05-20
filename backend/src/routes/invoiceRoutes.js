import express from "express";
import { createInvoice } from "../controllers/invoice.controller.js";

const router = express.Router();

// POST /api/invoices - create a new invoice
router.post("/invoice", createInvoice);

export default router;
