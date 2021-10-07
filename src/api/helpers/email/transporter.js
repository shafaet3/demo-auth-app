import { service, host, auth } from "../../../config";
const smtpTransport = require("nodemailer-smtp-transport");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport(
  smtpTransport({
    service,
    host,
    auth,
  })
);

export default transporter;
