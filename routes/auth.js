import authenticateUser from "../middlewares/authenticateUser.js";
import express from "express";
import bcrypt from "bcrypt";
import Users from "../models/users.js";
import jwt from "jsonwebtoken";
import sendEmailFunc from "../helpers/sendEmailFunc.js";
import sendResponse from "../helpers/sendResponse.js";
import dotenv from "dotenv";

dotenv.config();
const { tokenSecret } = process.env;

const router = express.Router();
// ✅ Send reset link (email)
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Users.findOne({ email });
    if (!user) return sendResponse(res, 404, null, true, "User not found");

    const resetToken = jwt.sign({ _id: user._id }, tokenSecret, { expiresIn: "1h" });

    const resetLink = `http://localhost:3000/resetPassword?token=${resetToken}`;
    sendEmailFunc(user.email, resetLink, (emailError) => {
      if (emailError) {
        return sendResponse(res, 500, null, true, "Failed to send reset email");
      }
      sendResponse(res, 200, null, false, "Password reset email sent!");
    });
  } catch (error) {
    console.error("Reset email error:", error);
    sendResponse(res, 500, null, true, "Failed to process reset request");
  }
});

// ✅ Reset password
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, tokenSecret);
    const user = await Users.findById(decoded._id);
    if (!user) return sendResponse(res, 404, null, true, "Invalid or expired token");

    const hashPass = await bcrypt.hash(newPassword, 10);
    user.password = hashPass;
    await user.save();

    sendResponse(res, 200, null, false, "Password reset successfully");
  } catch (error) {
    console.error("Reset password error:", error);
    sendResponse(res, 500, null, true, "Failed to reset password");
  }
});

export default router;


// ✅ Change password (authenticated user)

router.post("/changePassword", authenticateUser, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    // Find user by id from token
    const user = await Users.findById(req.user._id);
    if (!user) return sendResponse(res, 404, null, true, "User not found");

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return sendResponse(res, 400, null, true, "Old password is incorrect");

    // Hash and set new password
    const hashPass = await bcrypt.hash(newPassword, 10);
    user.password = hashPass;
    await user.save();

    sendResponse(res, 200, null, false, "Password changed successfully");
  } catch (error) {
    console.error("Change password error:", error);
    sendResponse(res, 500, null, true, "Failed to change password");
  }
});
