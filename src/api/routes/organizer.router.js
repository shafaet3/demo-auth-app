import { randomBytes } from "crypto";
import { Router } from "express";
import { join } from "path";
import { userAuth } from "../middlewares/auth-guard";
import validationResp from "../middlewares/validator-middleware";
import { User } from "../models";
import {
  sendEmailWithForgetPasswordLink,
  sendEmailPasswordChangedSuccessful,
} from "../helpers/email/sendEmail";
import {
  AuthValidation,
  SignUpValidation,
  ForgetPassValidation,
} from "../validations/user-validators";
import passport from "passport";
import {
  signUpOrganizer,
  verifyEmailOrganizer,
  loginOrganizer,
  forgetPassOrganizer,
  forgetPassTokenOrganizer,
} from "../controllers/organizer.controller";
const router = Router();

// /api/sign-up - CREATE a new Organizer Account
router.post("/api/sign-up", SignUpValidation, validationResp, signUpOrganizer);

// /email-verify/:verificationCode VERIFY Organizer Account
router.get("/email-verify/:verificationCode", verifyEmailOrganizer);

// /api/login LOGIN Organizer
router.post("/api/login", AuthValidation, validationResp, loginOrganizer);

// /api/user-authenticate GET Organizer
router.get("/api/user-authenticate", userAuth, async (req, res) => {
  return res.status(200).json({
    user: req.user,
    success: true,
    message: "Successfully get authenticated user",
  });
});

// /api/forget-password
router.post(
  "/api/forget-password",
  ForgetPassValidation,
  validationResp,
  forgetPassOrganizer
);

//get forget password token
router.get("/forget-password/:forgetPasswordToken", forgetPassTokenOrganizer);

router.post("/api/change-password", async (req, res) => {
  try {
    let { password, forgetPasswordToken } = req.body;
    let user = await User.findOne({
      forgetPasswordToken,
      forgetPasswordExpiresIn: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Forget password token is invalid or has expired.",
      });
    }
    user.password = password;
    user.forgetPasswordToken = undefined;
    user.forgetPasswordExpiresIn = undefined;

    // send password changed successful notification to email
    await sendEmailPasswordChangedSuccessful(user).catch(console.error);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Successfully changed password",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred.",
    });
  }
});

export default router;
