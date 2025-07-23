import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    amount: { type: Number, required: true },
    period: { type: Number, required: true },
    monthlyInstallment: { type: Number, required: true },
    status: {type: String, enum: ["Pending", "Approved", "Rejected"], required: true, default: "Pending"},
    address: { type: String },
    phone: { type: String },
    guarantor1Name: { type: String },
    guarantor1Cnic: { type: String },
    guarantor1Email: { type: String },
    guarantor1Location: { type: String },
    guarantor2Name: { type: String },
    guarantor2Cnic: { type: String },
    guarantor2Email: { type: String },
    guarantor2Location: { type: String }
  },
  { timestamps: true }
);

loanSchema.virtual('appointmentDetails', {
  ref: 'Appointments',
  localField: '_id',
  foreignField: 'loanId',
  justOne: true,
});

loanSchema.set('toJSON', { virtuals: true });
loanSchema.set('toObject', { virtuals: true });

const Loans =  mongoose.model("Loans", loanSchema);

export default Loans;
