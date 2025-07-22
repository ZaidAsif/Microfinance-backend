import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from 'fs';


dotenv.config();

const { senderEmail, senderPassword } = process.env;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: senderEmail,
    pass: senderPassword,
  },
});

export const sendPDFByEmail = async (pdfFilePath, recipientEmail) => {
  try {
    const pdfFile = fs.createReadStream(pdfFilePath); 

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: recipientEmail,
      subject: 'Your Microfinance Loan Slip',
      text: 'Please find attached your microfinance loan slip.',
      attachments: [
        {
          filename: 'loan-slip.pdf',
          content: pdfFile,
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (err) {
    console.error('Error sending email:', err);
  }
};