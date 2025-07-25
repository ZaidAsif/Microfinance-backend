import express from "express";
import Loans from "../models/loans.js";
import Users from "../models/users.js";
import Appointments from "../models/appointment.js";
import authenticateAdmin from "../middlewares/authenticateAdmin.js";
import authenticateUser from "../middlewares/authenticateUser.js";
import sendResponse from "../helpers/sendResponse.js";
import bcrypt from "bcrypt";
import sendEmailFunc from "../helpers/sendEmailFunc.js";

const router = express.Router();

router.get(
  "/applications/filter",
  authenticateUser,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { city } = req.query;

      let loanFilter = {};
      if (city) loanFilter["city"] = city;

      const loans = await Loans.find(loanFilter)
        .populate("userId")
        .populate("appointmentDetails");
      console.log("Filtered Populated Loans:", JSON.stringify(loans, null, 2));
      sendResponse(
        res,
        200,
        loans,
        false,
        "Filtered loan applications fetched"
      );
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, null, true, "Failed to filter applications");
    }
  }
);

router.put(
  "/applications/:id/update-status",
  authenticateUser,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !["Approved", "Rejected"].includes(status)) {
        return sendResponse(
          res,
          400,
          null,
          true,
          "Invalid status provided. Status must be 'Approved' or 'Rejected'."
        );
      }

      const updatedLoan = await Loans.findByIdAndUpdate(
        id,
        { status: status },
        { new: true }
      );

      if (!updatedLoan) {
        return sendResponse(res, 404, null, true, "Loan application not found");
      }

      sendResponse(
        res,
        200,
        updatedLoan,
        false,
        `Loan application ${status.toLowerCase()} successfully`
      );
    } catch (error) {
      console.error(error);
      sendResponse(
        res,
        500,
        null,
        true,
        "Failed to update loan application status"
      );
    }
  }
);

router.get("/users", authenticateUser, authenticateAdmin, async (req, res) => {
  try {
    const users = await Users.find();
    sendResponse(res, 200, users, false, "All users fetched successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Failed to fetch users");
  }
});

router.put(
  "/users/:id",
  authenticateUser,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone, isAdmin } = req.body;

      if (!name && !email && !phone && isAdmin === undefined) {
        return sendResponse(
          res,
          400,
          null,
          true,
          "No fields provided for update"
        );
      }

      const updatedUser = await Users.findByIdAndUpdate(
        id,
        { name, email, phone, isAdmin },
        { new: true }
      );

      if (!updatedUser) {
        return sendResponse(res, 404, null, true, "User not found");
      }

      sendResponse(res, 200, updatedUser, false, "User updated successfully");
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, null, true, "Failed to update user");
    }
  }
);

router.delete(
  "/users/:id",
  authenticateUser,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Delete the user
      const deletedUser = await Users.findByIdAndDelete(id);

      if (!deletedUser) {
        return sendResponse(res, 404, null, true, "User not found");
      }

      sendResponse(res, 200, null, false, "User deleted successfully");
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, null, true, "Failed to delete user");
    }
  }
);

router.post(
  "/users/create",
  authenticateUser,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { name, email, cnic, password, isAdmin } = req.body;

      // Check if all required fields are provided
      if (!name || !email || !cnic || !password || isAdmin === undefined) {
        return sendResponse(res, 400, null, true, "All fields are required.");
      }

      // Check if user already exists by email or CNIC
      const existingUserByEmail = await Users.findOne({ email });
      const existingUserByCnic = await Users.findOne({ cnic });

      if (existingUserByEmail) {
        return sendResponse(
          res,
          400,
          null,
          true,
          "Email is already registered."
        );
      }

      if (existingUserByCnic) {
        return sendResponse(
          res,
          400,
          null,
          true,
          "CNIC is already registered."
        );
      }

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = new Users({
        name,
        email,
        cnic,
        password: hashedPassword,
        isAdmin,
      });

      await newUser.save();

      sendEmailFunc(email, `Your login password: ${password}`);

      sendResponse(res, 201, newUser, false, "User created successfully!");
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, null, true, "Error while creating user.");
    }
  }
);

router.get(
  "/applications",
  authenticateUser,
  authenticateAdmin,
  async (req, res) => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      const applications = await Loans.find({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      })
        .populate("userId")
        .populate("appointmentDetails");

      sendResponse(
        res,
        200,
        applications,
        false,
        "Applications fetched for current month"
      );
    } catch (err) {
      console.error(err);
      sendResponse(res, 500, null, true, "Error fetching applications");
    }
  }
);

router.get('/applications/month', authenticateUser, authenticateAdmin, async (req, res) => {
  const { start, end } = req.query;

  try {
    const apps = await Loans.find({
      createdAt: { $gte: new Date(start), $lte: new Date(end) },
    })
    .populate('userId')
    .populate('appointmentDetails');

    sendResponse(res, 200, apps, false, 'Monthly applications fetched');
  } catch (error) {
    sendResponse(res, 500, null, true, 'Error loading applications');
  }
});

export default router;
