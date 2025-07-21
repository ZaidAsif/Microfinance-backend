import jwt from 'jsonwebtoken';
import Users from '../models/users.js';
import dotenv from 'dotenv';
import sendResponse from '../helpers/sendResponse.js';  

dotenv.config();

const {tokenSecret} = process.env;

const authenticateUser = async (req, res, next) => {
    try {
        let token = req.headers.authorization.split(" ")[1]
        console.log(token)
        if (!token) {
            return sendResponse(res, 401, null, true, 'Unauthorized. No token provided.');
        }
        token = token.replace(/['"]+/g, ''); 

        const decoded = jwt.verify(token, tokenSecret);
        const user = await Users.findById(decoded._doc._id);

        console.log(decoded)
        if (!user) {
            return sendResponse(res, 401, null, true, 'Unauthorized. User not found.');
        }

        req.user = user; 
        next();
    } catch (error) {
        console.log(error);
        return sendResponse(res, 401, null, true, 'Invalid or expired token');
    }
};

export default authenticateUser;
