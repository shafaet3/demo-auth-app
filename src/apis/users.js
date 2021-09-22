import { randomBytes } from "crypto";
import { Router } from "express";
import { join } from "path";
import { userAuth } from "../middlewares/auth-guard";
import Validator from "../middlewares/validator-middleware";
import { User } from "../models";
import {
  sendEmailWithForgetPasswordLink,
  sendEmailPasswordChangedSuccessful,
} from "../functions/email/sendEmail";
import {
  AuthenticateValidations,
  RegisterValidations,
  ForgetPasswordValidations,
} from "../validators/user-validators";
import passport from "passport";

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

// /email-verify/:verificationCode VERIFY User Account
router.get("/email-verify/:verificationCode", async (req, res) => {
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
      join(__dirname, "../templates/email-verification-success.html")
    );
  } catch (error) {
    return res.sendFile(join(__dirname, "../templates/errors.html"));
  }
});

// /api/login LOGIN user
router.post(
  "/api/login",
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
      if (user.verified === true) {
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

// /api/user-authenticate GET User
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
  ForgetPasswordValidations,
  Validator,
  async (req, res) => {
    try {
      let { email } = req.body;
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User with this email is not found",
        });
      }

      user.generateForgetPassword();

      // send forget password link to email
      await sendEmailWithForgetPasswordLink(user).catch(console.error);

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Forget password link is sent to your email",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred.",
      });
    }
  }
);

//get forget password token
router.get("/forget-password/:forgetPasswordToken", async (req, res) => {
  try {
    let { forgetPasswordToken } = req.params;
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

    return res.status(200).json({
      success: true,
      message: "Successfully get forget password token",
      user,
    });
  } catch (error) {
    return res.sendFile(join(__dirname, "../templates/errors.html"));
  }
});

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
