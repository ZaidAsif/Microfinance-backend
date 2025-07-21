import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const { senderEmail, senderPassword } = process.env;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: senderEmail,
    pass: senderPassword,
  },
});

const sendEmailFunc = async (to, message, attachments = []) => {
  try {
    await transporter.sendMail({
      from: `"Microfinance App" <${senderEmail}>`,
      to,
      subject: "Loan Application Credentials",
      text: message,
      attachments, // <-- this line is required
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default sendEmailFunc;
