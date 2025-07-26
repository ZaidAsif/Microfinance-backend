import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import serverless from 'serverless-http';
import dbConnect from '../lib/dbconnect.js'
import loginRoutes from '../routes/login.js';
import authRoutes from '../routes/auth.js';
import slipRoutes from '../routes/slip.js';
import sendResponse from '../helpers/sendResponse.js';
import emailVerificationRoutes from '../routes/emailverification.js';
import loanRoutes from '../routes/loan.js';
import adminRoutes from '../routes/admin.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: "https://microfinance-platform.vercel.app",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(morgan('short'));

await dbConnect();

app.use('/login', loginRoutes);
app.use('/', emailVerificationRoutes);
app.use('/loan', loanRoutes);
app.use('/auth', authRoutes);
app.use('/slip', slipRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
  sendResponse(res, 200, null, false, 'Welcome to Saylani Microfinance Backend');
});

export const handler = serverless(app);
