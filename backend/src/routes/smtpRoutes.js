import express from "express";
import { createSMTPConfig } from "../controllers/smtpConfig.js";
import { authMiddelware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/smtpSetup", authMiddelware, createSMTPConfig);

export default router;
