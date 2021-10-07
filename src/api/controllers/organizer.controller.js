import {
  signUpOrg,
  verifyEmailOrg,
  loginOrg,
  forgetPassOrg,
  forgetPassTokenOrg,
} from "../services/organizer.service";
import { join } from "path";

export const signUpOrganizer = async (req, res) => {
  const organizer = await signUpOrg(req, res);

  if (organizer) {
    res.status(201).json({
      success: true,
      message: "Your account is created please verify your email address",
    });
  }
};

export const verifyEmailOrganizer = async (req, res) => {
  const organizer = await verifyEmailOrg(req, res);

  if (organizer) {
    res.sendFile(
      join(__dirname, "../templates/email-verification-success.html")
    );
  }
};

export const loginOrganizer = async (req, res) => {
  const organizer = await loginOrg(req, res);

  if (organizer) {
    return res.status(200).json({
      success: true,
      user: organizer.user,
      token: organizer.token,
      message: "Successfully logged in",
    });
  }
};

export const forgetPassOrganizer = async (req, res) => {
  const organizer = await forgetPassOrg(req, res);

  if (organizer) {
    res.status(200).json({
      success: true,
      message: "Forget password link is sent to your email",
    });
  }
};

export const forgetPassTokenOrganizer = async (req, res) => {
  const organizer = await forgetPassTokenOrg(req, res);

  if (organizer) {
    res.status(200).json({
      success: true,
      message: "Successfully get forget password token",
      organizer,
    });
  }
};

export default {
  signUpOrganizer,
  verifyEmailOrganizer,
  loginOrganizer,
  forgetPassOrganizer,
  forgetPassTokenOrganizer,
};
