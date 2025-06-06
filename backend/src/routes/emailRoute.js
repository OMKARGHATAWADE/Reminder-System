import express from "express";
import { sendReminder } from "../controllers/sendReminder.js";
import { authMiddelware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/send/:invoiceId", authMiddelware, sendReminder);
export default router;
