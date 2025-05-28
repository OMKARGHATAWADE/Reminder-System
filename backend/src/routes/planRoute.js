import express from "express";
import { authMiddelware } from "../middleware/authMiddleware.js";
import { createPlan } from "../controllers/planController.js";

const router = express.Router();
router.post("/createPlans", authMiddelware, createPlan);

export default router;
