import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loans', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  location: { type: String, default: "Saylani Head Office Karachi - Bahadurabad" },
  slipUrl: { type: String }, 
}, { timestamps: true });

appointmentSchema.index({ date: 1, time: 1 }, { unique: true });

const Appointments = mongoose.model('Appointments', appointmentSchema);
export default Appointments;