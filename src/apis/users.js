import { randomBytes } from "crypto";
import { Router } from "express";
import { join } from "path";
import sendEmailWithVerificationCode from "../functions/email/sendEmail";
import Validator from "../middlewares/validator-middleware";
import { User } from "../models";
import {
  RegisterValidations,
  AuthenticateValidations,
} from "../validators/user-validators";
import { userAuth } from "../middlewares/auth-guard";

const router = Router();

// /api/register - CREATE a new User Account
router.post(
  "/api/register",
  RegisterValidations,
  Validator,
  async (req, res) => {
    try {
      const { name, email, role, username, password } = req.body;

      //check if the username is taken or not
      let user = await User.findOne({ username });
      if (user) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken",
        });
      }

      //check if the email is taken or not
      user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          success: false,
          message:
            "Email is already registered. Did you forget the password? Try resetting it.",
        });
      }

      user = new User({
        name,
        email,
        role,
        username,
        password,
        verificationCode: randomBytes(20).toString("hex"),
      });
      await user.save();

      // send email to the user with verification code
      await sendEmailWithVerificationCode(user).catch(console.error);

      return res.status(201).json({
        success: true,
        message: "Your account is created please verify your email address",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred",
      });
    }
  }
);

// /verify-now/:verificationCode VERIFY User Account
router.get("/verify-now/:verificationCode", async (req, res) => {
  try {
    let { verificationCode } = req.params;
    let user = await User.findOne({ verificationCode });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Invalid verification code.",
      });
    }
    user.verified = true;
    user.verificationCode = undefined;
    await user.save();
    return res.sendFile(
      join(__dirname, "../templates/verification-success.html")
    );
  } catch (error) {
    return res.sendFile(join(__dirname, "../templates/errors.html"));
  }
});

// /api/authenticate LOGIN user
router.post(
  "/api/authenticate",
  AuthenticateValidations,
  Validator,
  async (req, res) => {
    try {
      let { username, password } = req.body;
      let user = await User.findOne({ username });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Username not found",
        });
      }
      if (!(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: "Incorrect password",
        });
      }
      let token = await user.generateJWT();
      if (user.verified == true) {
        return res.status(200).json({
          success: true,
          user: user.getUserInfo(),
          token: `Bearer ${token}`,
          message: "Successfully logged in",
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Please verify your email",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred",
      });
    }
  }
);

// /api/authenticate GET Users
router.get("/api/authenticate", userAuth, async (req, res) => {
  return res.status(200).json({
    user: req.user,
    success: true,
    message: "Successfully get authenticated user",
  });
});

export default router;
