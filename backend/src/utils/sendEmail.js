import nodemailer from "nodemailer";
import SMTPConfig from "../models/smtpConfigModel";
export const sendEmail = async ({ SMTPConfig, to, subject, text, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: SMTPConfig.host,
      port: SMTPConfig.port,
      secure: SMTPConfig.secure,
      auth: {
        user: SMTPConfig.email,
        pass: SMTPConfig.password,
      },
    });

    const mailOptions = {
      from: SMTPConfig.email,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent", info.messageId);

    return {
      success: true,
      message: info.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};
