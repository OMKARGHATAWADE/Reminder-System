// routes/clientRoutes.js
import express from "express";
import {  getClientDetailsByInvoiceNumber } from "../controllers/clientDetails.js";
import { authMiddelware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/invoice/:invoiceNumber", authMiddelware, getClientDetailsByInvoiceNumber);

export default router;
