import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Users from '../models/users.js';
import sendResponse from '../helpers/sendResponse.js';
import dotenv from 'dotenv';
import sendEmailFunc from '../helpers/sendEmailFunc.js';

const router = express.Router();
dotenv.config();

const { tokenSecret } = process.env;

router.post('/', async (req, res) => {
    try {
        const hashPass = await bcrypt.hash(req.body.password, 10);

        const newUser = new Users({ ...req.body, password: hashPass });

        let savedUser = await newUser.save();

        const token = jwt.sign({ ...savedUser }, tokenSecret);

        sendEmailFunc(savedUser.email, token, (emailError, emailSuccess) => {
            if (emailError) {
                return sendResponse(res, 400, null, true, "Failed to send email: " + emailError.message);
            }

            sendResponse(res, 200, savedUser, false, "User created and email sent successfully");
        });

    } catch (error) {
        console.log(error);
        sendResponse(res, 400, null, true, "Error creating user: " + error.message);
    }
});

export default router;
