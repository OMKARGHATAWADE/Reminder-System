import SMTPConfig from "../models/smtpConfigModel";
import bcrypt from "bcrypt";

export const createSMTPConfig = async (req, res) => {
  try {
    const userId = req.user._id;

    const { host, port, secure, email, password } = req.body;
    if (host || port || secure === undefined || email || password) {
      return res.status(400).json({
        message: "All fields are required for creation of SMTP Configuration.",
      });
    }

    const existingConfig = await SMTPConfig.findOne({ user: userId });
    if (existingConfig) {
      return res.status(400).json({
        message:
          "SMTP already Setup You Can Procced to Send Reminders or Update the SMTP cofiguration",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newSMTPConfig = new SMTPConfig({
      user: userId,
      host,
      port,
      secure,
      email,
      password: hashPassword,
    });

    await newSMTPConfig.save();
    res
      .status(201)
      .json({ message: "SMTP configuration created successfully." });
  } catch (error) {
    console.error("Error creating SMTP config:", error);
    res
      .status(500)
      .json({ message: "Server error while creating SMTP config." });
  }
};
