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

    // Generate a unique token for the appointment slip
    const token = `MF-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Get the next available slot
    const { date, time } = await getNextAvailableSlot();
    const location = "Saylani Office - Karachi";

    // Define the file path for Vercel's temporary directory
    const filePath = path.join('/tmp', `${token}.pdf`);

    // Generate the PDF slip
    await generatePDFSlip({ token, date, time, location, user: req.user }, filePath);
    
    // Generate the QR Code (optional, if you need to use the QR for something)
    await generateQRCode(`https://microfinance-backend-nine.vercel.app/tmp/${token}`);
    
    // Create a new appointment record in the database with the PDF URL (we'll use a temporary URL for this)
    const appointment = await Appointments.create({
      userId,
      loanId,
      token,
      date,
      time,
      location,
      slipUrl: `https://microfinance-backend-nine.vercel.app/tmp/${token}.pdf`, // Temporary URL for the file
    });

    // Send email with the generated PDF as an attachment
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

    // Optionally, delete the temporary file after sending the email
    fs.unlinkSync(filePath);

    // Send the success response with appointment data
    sendResponse(res, 200, appointment, false, "Slip generated successfully");
    
  } catch (err) {
    console.error(err);
    sendResponse(res, 500, null, true, "Slip generation failed");
  }
});

export default router;









// import express from 'express';
// import { getNextAvailableSlot } from '../utils/scheduleAppointment.js';
// import { generatePDFSlip } from '../utils/generatePDF.js';
// import { generateQRCode } from '../utils/generateQRCode.js';
// import Appointments from '../models/appointment.js';
// import authenticateUser from "../middlewares/authenticateUser.js";
// import sendResponse from "../helpers/sendResponse.js";
// import sendEmailFunc from "../helpers/sendEmailFunc.js";

// const router = express.Router();

// router.post('/generate', authenticateUser, async (req, res) => {
//   try {
//     const { userId, loanId } = req.body;

//     const token = `MF-${Math.floor(1000 + Math.random() * 9000)}`;

//     const { date, time } = await getNextAvailableSlot();
//     const location = "Saylani Office - Karachi";

//     const filePath = `./slips/${token}.pdf`;

//     // Generate PDF and QR Code
//     generatePDFSlip({ token, date, time, location, user: req.user }, filePath);
//     await generateQRCode(`https://microfinance-backend-nine.vercel.app/tmp/${token}`);

//     const appointment = await Appointments.create({
//       userId, loanId, token, date, time, location,
//       slipUrl: `https://microfinance-backend-nine.vercel.app/tmp/${token}.pdf`,
//     });

//     // After appointment is created
//     await sendEmailFunc(
//       req.user.email,
//       "Your appointment slip is attached.",
//       [
//         {
//           filename: `${token}.pdf`,
//           path: filePath,
//           contentType: 'application/pdf'
//         }
//       ]
//     );

//     sendResponse(res, 200, appointment, false, "Slip generated successfully");
//   } catch (err) {
//     console.log(err);
//     sendResponse(res, 500, null, true, "Slip generation failed");
//   }
// });

// export default router;