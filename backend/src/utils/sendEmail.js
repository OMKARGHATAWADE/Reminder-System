import nodemailer from "nodemailer";

export const sendEmail = async ({ smtpConfig, to, subject, text, html, attachments }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.email,
        pass: smtpConfig.password,
      },
    });

    const mailOptions = {
      from: smtpConfig.email,
      to,
      subject,
      text,
      html,
      attachments: attachments || [], // support attachments, default empty array
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent", info.messageId);

    return {
      success: true,
      message: info.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error.response || error.message);
    return { success: false, error: error.message };
  }
};
