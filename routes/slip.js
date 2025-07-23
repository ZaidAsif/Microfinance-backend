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
  try {
    const { userId, loanId } = req.body;

    const token = `MF-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const { date, time } = await getNextAvailableSlot();
    const location = "Saylani Office - Karachi";

    const filePath = path.join('/tmp', `${token}.pdf`);

    await generatePDFSlip({ token, date, time, location, user: req.user }, filePath);
    
    await generateQRCode(`https://microfinance-backend-nine.vercel.app/tmp/${token}`);
    
    const appointment = await Appointments.create({
      userId,
      loanId,
      token,
      date,
      time,
      location,
      slipUrl: `https://microfinance-backend-nine.vercel.app/tmp/${token}.pdf`, // Temporary URL for the file
    });

    await sendEmailFunc(
      req.user.email,
      "Your appointment slip is attached.",
      [
        {
          filename: `${token}.pdf`,
          path: filePath,
          contentType: 'application/pdf',
        }
      ]
    );

    fs.unlinkSync(filePath);

    sendResponse(res, 200, appointment, false, "Slip generated successfully");
    
  } catch (err) {
    console.error(err);
    sendResponse(res, 500, null, true, "Slip generation failed");
  }
});

export default router;









