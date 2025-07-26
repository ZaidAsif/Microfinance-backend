import express from "express";
import bcrypt from "bcrypt";
import sendEmailFunc from "../helpers/sendEmailFunc.js";
import sendResponse from "../helpers/sendResponse.js";
import Users from "../models/users.js";
import Loans from "../models/loans.js";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import authenticateUser from "../middlewares/authenticateUser.js";

const router = express.Router();

dotenv.config();

const {tokenSecret} = process.env;

const loanCategories = [
    {
        name: "Wedding Loans",
        subcategories: ["Valima", "Furniture", "Valima Food", "Jahez"],
        maxLoan: 500000,
        duration: 3,
    },  
    {
        name: "Home Construction Loans",
        subcategories: ["Structure", "Finishing", "Loan"],
        maxLoan: 1000000,
        duration: 5,
    },
    {
        name: "Business Startup Loans",
        subcategories: ["Buy Stall", "Advance Rent for Shop", "Shop Assets", "Shop Machinery"],
        maxLoan: 1000000,
        duration: 5,
    },
    {
        name: "Education Loans",
        subcategories: ["University Fees", "Child Fees Loan"],
        maxLoan: 100000,
        duration: 4,
    },
];






router.get('/categories', (req, res) => {
    sendResponse(res, 200, loanCategories, false, 'Successfully retrived loan categories');
});






router.post("/apply", async (req, res) => {
    try {
      const { email, name, cnic, category, subcategory, amount, period, monthlyInstallment } = req.body;
  
      let user = await Users.findOne({ email });
  
      let password;
      if (!user) {
        password = Math.random().toString(36).slice(-8); 
        const hashedPassword = await bcrypt.hash(password, 10);
  
        user = new Users({ name, email, cnic, password: hashedPassword });
        await user.save();
  
        sendEmailFunc(email, `Your login password: ${password}`);
      }
  
      const token = jwt.sign({ _id: user._id, email: user.email }, tokenSecret, { expiresIn: "7d" });
  

  
      const newLoan = new Loans({
        userId: user._id,
        category,
        subcategory,
        amount,
        period,
        monthlyInstallment, 
      });
  
      await newLoan.save();
  
      return sendResponse(res, 201, { user, loan: newLoan, token }, false, "Loan request submitted successfully");
    } catch (error) {
      console.error(error);
      return sendResponse(res, 500, null, true, "Error submitting loan request");
    }
  });



  router.get("/myLoans", authenticateUser, async (req, res) => {
    try {
      const userLoans = await Loans.find({ userId: req.user._id });
  
      console.log(userLoans);
      if (!userLoans.length > 0) {
        return sendResponse(res, 404, null, true, "No loan requests found.");
      }
  
      sendResponse(res, 200, userLoans, false, "Loans fetched successfully!");
    } catch (error) {
      console.error("Error fetching loans:", error);
      sendResponse(res, 500, null, true, "Failed to fetch loan details.");
    }
  });


router.get("/myPendingLoans", authenticateUser, async (req, res) => {
  try {
    const pendingLoans = await Loans.find({ userId: req.user._id, status: "Pending" });

    if (!pendingLoans.length > 0) {
      return sendResponse(res, 404, null, true, "No pending loan requests found.");
    }

    sendResponse(res, 200, pendingLoans, false, "Pending loans fetched successfully!");
  } catch (error) {
    console.error("Error fetching pending loans:", error);
    sendResponse(res, 500, null, true, "Failed to fetch pending loan details.");
  }
});

export default router;


router.post("/pendingLoanDetail", authenticateUser, async (req, res) => {
  try {
    const loanDetail = await Loans.find({userId: req.user._id, status: "Pending", _id: req.body.id});
        if (!loanDetail.length > 0) {
      return sendResponse(res, 404, null, true, "No pending loan requests found.");
    }

    sendResponse(res, 200, loanDetail[0], false, "Pending loans fetched successfully!");
  } catch (error) {
    console.error("Error fetching pending loan details:", error);
    sendResponse(res, 500, null, true, "Failed to fetch pending loan details.");
  }
}
)


router.post("/additionalInfo", authenticateUser, async (req, res) => {
  try {
    const {
      id,
      city,
      phone,
      guarantor1Name,
      guarantor1Cnic,
      guarantor1Email,
      guarantor1Location,
      guarantor2Name,
      guarantor2Cnic,
      guarantor2Email,
      guarantor2Location
    } = req.body;

    const loan = await Loans.findOne({ _id: id, userId: req.user._id });
    if (!loan) {
      return sendResponse(res, 404, null, true, "Loan not found.");
    }

    loan.city = city;
    loan.phone = phone;
    loan.guarantor1Name = guarantor1Name;
    loan.guarantor1Cnic = guarantor1Cnic;
    loan.guarantor1Email = guarantor1Email;
    loan.guarantor1Location = guarantor1Location;
    loan.guarantor2Name = guarantor2Name;
    loan.guarantor2Cnic = guarantor2Cnic;
    loan.guarantor2Email = guarantor2Email;
    loan.guarantor2Location = guarantor2Location;

    await loan.save();

    sendResponse(res, 200, loan, false, "Additional info added successfully!");
  } catch (error) {
    console.error("Error adding additional info:", error);
    sendResponse(res, 500, null, true, "Failed to add additional info.");
  }
});