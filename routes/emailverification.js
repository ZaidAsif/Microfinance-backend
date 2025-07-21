import express from 'express'
import sendResponse from '../helpers/sendResponse.js';
import sendEmailFunc from '../helpers/sendEmailFunc.js';
import jwt from 'jsonwebtoken';
import Users from '../models/users.js';
import dotenv from 'dotenv'

const router = express.Router();

dotenv.config();

const { tokenSecret } = process.env;

router.post('/sendEmail', (req, res) => {
    sendEmailFunc(req.body.recipientEmail, req.headers.token, (error, success) => {
        if (error) {
            return sendResponse(res, 400, null, true, error.message || "Failed to send email");
        }
        sendResponse(res, 200, null, false, "Email sent successfully");
    });
});

router.post('/verifyEmail', async (req, res) => {
    try {
        const verified = jwt.verify(req.headers.token, tokenSecret);
        const user = await Users.findById(verified._doc._id);

        if (!user) return sendResponse(res, 404, null, true, "User not found: Token Incorrect")

        if (user.emailVerified) return sendResponse(res, 400, null, true, "Email already verified");

        user.emailVerified = true
        await user.save();

        sendResponse(res, 200, null, false, "Email verified successfully")

    } catch (error) {
        console.log('error verifying email', error);
        sendResponse(res, 400, null, true, "Invalid or expired token")
    }

    // const update = await Users.findByIdAndUpdate(verified._doc._id, {emailVerified: true})
})

export default router