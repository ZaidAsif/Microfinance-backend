import express from 'express';
import { getNextAvailableSlot } from '../utils/scheduleAppointment.js';
import { generatePDFSlip } from '../utils/generatePDF.js';
import { generateQRCode } from '../utils/generateQRCode.js';
import Appointments from '../models/appointment.js';
import authenticateUser from "../middlewares/authenticateUser.js";
import sendResponse from "../helpers/sendResponse.js";
import sendEmailFunc from "../helpers/sendEmailFunc.js";
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.post('/generate', authenticateUser, async (req, res) => {
  let appointment;
let attempts = 0;
const maxAttempts = 5;

while (!appointment && attempts < maxAttempts) {
  try {
    const { date, time } = await getNextAvailableSlot();
    const token = `MF-${Math.floor(1000 + Math.random() * 9000)}`;
    const location = "Saylani Office - Karachi";
    const filePath = path.join('/tmp', `${token}.pdf`);
    const {loanId, userId} = req.body;

    await generatePDFSlip({ token, date, time, location, user: req.user }, filePath);
    await generateQRCode(`https://microfinance-backend-nine.vercel.app/tmp/${token}`);

    appointment = await Appointments.create({
      userId,
      loanId,
      token,
      date,
      time,
      location,
      slipUrl: `https://microfinance-backend-nine.vercel.app/tmp/${token}.pdf`,
    });

    await sendEmailFunc(
      req.user.email,
      "Your appointment slip is attached.",
      [{
        filename: `${token}.pdf`,
        path: filePath,
        contentType: 'application/pdf',
      }]
    );

    fs.unlinkSync(filePath);
    sendResponse(res, 200, appointment, false, "Slip generated successfully");
  } catch (err) {
    if (err.code === 11000) {
      attempts++;
    } else {
      console.error(err);
      return sendResponse(res, 500, null, true, "Slip generation failed");
    }
  }
}

if (!appointment) {
  sendResponse(res, 409, null, true, "Could not assign appointment. Please try again.");
}
});

export default router;









