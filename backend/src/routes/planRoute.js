import express from "express";
import { authMiddelware } from "../middleware/authMiddleware.js";
import { createPlan, plans } from "../controllers/planController.js";

const router = express.Router();
router.post("/createPlans", authMiddelware, createPlan);
router.get("/plans", authMiddelware, plans)
export default router;
