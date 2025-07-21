import express from 'express';
import Users from '../models/users.js';
import bcrypt from 'bcrypt';
import sendResponse from '../helpers/sendResponse.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

const router = express.Router();

dotenv.config();

const {tokenSecret} = process.env;

router.post('/', async (req, res) => {
    console.log('Request Body:', req.body);  // Log the request body to check

    const user = await Users.findOne({email: req.body.email});

    if (!user) {
        sendResponse(res, 404, null, true, "user not found");
        return;
    }

    const passwordMatched = await bcrypt.compare(req.body.password, user.password);

    if (!passwordMatched) {
        sendResponse(res, 400, null, true, "incorrect password");
        return;
    }

    delete user.password;
    const token = jwt.sign({ ...user }, tokenSecret);

    sendResponse(res, 200, {token, user}, false, 'user logged in sucessfully');

})

export default router;