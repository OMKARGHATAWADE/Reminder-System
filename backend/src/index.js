import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./Job/reminderJob.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import emailRoute from "./routes/emailRoute.js";
import smtpRoute from "./routes/smtpRoutes.js";
import planRoute from "./routes/planRoute.js";
import clientRoutes from "./routes/clientRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/email", emailRoute);
app.use("/api/smtp", smtpRoute);
app.use("/api/plans", planRoute);
app.use("/api/client/", clientRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
