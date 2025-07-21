
import express from 'express';
import { getNextAvailableSlot } from '../utils/scheduleAppointment.js';
import { generatePDFSlip } from '../utils/generatePDF.js';
import { generateQRCode } from '../utils/generateQRCode.js';
import Appointments from '../models/appointment.js';
import authenticateUser from "../middlewares/authenticateUser.js";
import sendResponse from "../helpers/sendResponse.js";

const router = express.Router();

router.post('/generate', authenticateUser, async (req, res) => {
  try {
    const { userId, loanId } = req.body;

    const token = `MF-${Math.floor(1000 + Math.random() * 9000)}`;

    const { date, time } = await getNextAvailableSlot();
    const location = "Saylani Office - Karachi";

    const filePath = `./slips/${token}.pdf`;

    // Generate PDF and QR Code
    generatePDFSlip({ token, date, time, location, user: req.user }, filePath);
    await generateQRCode(`https://microfinance-backend-nine.vercel.app/slip/${token}`);

    const appointment = await Appointments.create({
      userId, loanId, token, date, time, location,
      slipUrl: `https://microfinance-backend-nine.vercel.app/slips/${token}.pdf`,
    });

    sendResponse(res, 200, appointment, false, "Slip generated successfully");
  } catch (err) {
    console.log(err);
    sendResponse(res, 500, null, true, "Slip generation failed");
  }
});

export default router;