import express from "express";
import { sendReminder } from "../controllers/sendReminder.js";
import { authMiddelware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/send-reminder/:invoiceId", authMiddelware, sendReminder);
export default router;
