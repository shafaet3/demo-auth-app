import { randomBytes } from "crypto";
import { User } from "../models";
import { join } from "path";
import { sendEmailWithForgetPasswordLink } from "../helpers/email/sendEmail";

export const signUpOrg = async (req, res) => {
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

    return user;
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    });
  }
};

export const verifyEmailOrg = async (req, res) => {
  try {
    let { verificationCode } = req.params;
    let user = await User.findOne({ verificationCode });
    if (!user) {
      return res.sendFile(join(__dirname, "../templates/errors.html"));
    }
    user.verified = true;
    user.verificationCode = undefined;
    await user.save();

    return user;
  } catch (error) {
    return res.sendFile(join(__dirname, "../templates/errors.html"));
  }
};

export const loginOrg = async (req, res) => {
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
      return { user: user.getUserInfo(), token: `Bearer ${token}` };
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
};

export const forgetPassOrg = async (req, res) => {
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

    return user;
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred.",
    });
  }
};

export const forgetPassTokenOrg = async (req, res) => {
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

    return user;
  } catch (error) {
    return res.sendFile(join(__dirname, "../templates/errors.html"));
  }
};

export default {
  signUpOrg,
  verifyEmailOrg,
  loginOrg,
  forgetPassOrg,
  forgetPassTokenOrg,
};
