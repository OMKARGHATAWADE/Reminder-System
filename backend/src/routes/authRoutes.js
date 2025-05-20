import express from "express";

import { logoutUser } from "../controllers/logout.controller.js";
import { loginUser } from "../controllers/login.controller.js";
import { registerUser } from "../controllers/register.controller.js";


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

export default router;
