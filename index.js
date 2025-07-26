import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import loginRoutes from './routes/login.js'
import authRoutes from './routes/auth.js'
import slipRoutes from './routes/slip.js';
import sendResponse from './helpers/sendResponse.js';
import emailVerificationRoutes from './routes/emailverification.js';
import loanRoutes from './routes/loan.js'
import adminRoutes from './routes/admin.js'





const app = express();
app.use(express.json());
app.use(cors({
    origin: "https://microfinance-platform.vercel.app",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(morgan('short'));

dotenv.config()

const { port, mongoDBURL, senderEmail, senderPassword, tokenSecret } = process.env;

mongoose
    .connect(mongoDBURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 20000,
        socketTimeoutMS: 30000
    })
    .then(() => console.log("=====DATABASE CONNECTED====="))
    .catch(() => console.log("=====DATABASE CONNECTION FAILED"))





app.use('/login', loginRoutes);

app.use('/', emailVerificationRoutes);

app.use('/loan', loanRoutes);

app.use('/auth', authRoutes);

app.use('/slip', slipRoutes);

app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
    sendResponse(res, 200, null, false, 'Welcome to Saylani Microfinance Backend');
});



app.listen(port, () => {
    console.log(`server is running on Port:${port}`);
})