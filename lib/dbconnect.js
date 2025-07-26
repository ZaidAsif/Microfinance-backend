import mongoose from 'mongoose';
import dotenv from 'dotenv'

dotenv.config();

let isConnected = false; 

const dbConnect = async () => {
  if (isConnected) {
    return;
  }

  const { mongoDBURL } = process.env;

  if (!mongoDBURL) {
    throw new Error('Missing MONGO_DB_URL in environment variables');
  }

  try {
    const db = await mongoose.connect(mongoDBURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = db.connections[0].readyState;
    console.log("***MongoDB connected***");
  } catch (error) {
    console.error("***MongoDB connection error***:", error);
    throw error;
  }
};

export default dbConnect;
