import { DOMAIN, from } from "../../../config";
import transporter from "./transporter";

export const sendEmailWithVerificationCode = async ({
  email,
  username,
  verificationCode,
}) => {
  let emailAddress = "";
  try {
    const mailOptions = {
      from,
      to: email,
      // to: [
      //   { name: "Shafaet", address: "shafaet@yopmail.com" },
      //   { name: "Shafaet3", address: "shafaet3@yopmail.com" },
      // ],
      subject: "Verify Account",
      html: `<h1>Hello, ${username}</h1>
      <p>Please click the following link to verify your account</p>
      <button><a href="${DOMAIN}/org/email-verify/${verificationCode}">Verify Now</a></button>`,
    };

    // http://localhost:4000/users/email-verify/107603e5b42b430e41adce53dcebcc056822ed9f

    let info = await transporter.sendMail(mailOptions);

    emailAddress = info.accepted[0];

    console.log(
      "Email Sent: " +
        emailAddress +
        " Time: " +
        new Date().toLocaleTimeString()
    );

    //   info:{
    //     "accepted":[
    //        "shafaet@yopmail.com",
    //        "shafaet3@yopmail.com"
    //     ],
    //     "rejected":[

    //     ],
    //     "response":"250 2.0.0 OK  1632218100 d19sm5061736pfn.102 - gsmtp",
    //     "envelope":{
    //        "from":"newgenbabylon@gmail.com",
    //        "to":[
    //           "shafaet@yopmail.com",
    //           "shafaet3@yopmail.com"
    //        ]
    //     },
    //     "messageId":"4865d047-98f1-9223-7a60-9d4e214a3f46@gmail.com"
    //  }

    // console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log("ERROR_EMAIL_SENT: " + error.message);
  } finally {
    return emailAddress;
  }
};

export const sendEmailWithForgetPasswordLink = async ({
  email,
  username,
  forgetPasswordToken,
}) => {
  let emailAddress = "";
  try {
    const mailOptions = {
      from,
      to: email,
      // to: [
      //   { name: "Shafaet", address: "shafaet@yopmail.com" },
      //   { name: "Shafaet3", address: "shafaet3@yopmail.com" },
      // ],
      subject: "Forget Password",
      html: `<h1>Hello, ${username}</h1>
      <strong style="color:red;">If this password change request is not created by you then you can ignore this email.</strong>
      <p>Please click the following link to change your password</p>
      <button><a href="${DOMAIN}/org/forget-password/${forgetPasswordToken}">Change Password</a></button>`,
    };

    let info = await transporter.sendMail(mailOptions);

    emailAddress = info.accepted[0];

    console.log(
      "Email Sent: " +
        emailAddress +
        " Time: " +
        new Date().toLocaleTimeString()
    );

    // console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log("ERROR_EMAIL_SENT: " + error.message);
  } finally {
    return emailAddress;
  }
};

export const sendEmailPasswordChangedSuccessful = async ({
  email,
  username,
}) => {
  let emailAddress = "";
  try {
    const mailOptions = {
      from,
      to: email,
      // to: [
      //   { name: "Shafaet", address: "shafaet@yopmail.com" },
      //   { name: "Shafaet3", address: "shafaet3@yopmail.com" },
      // ],
      subject: "Password Changed",
      html: `<h1>Hello, ${username}</h1></br>
      <h2><strong style="color:green;">Congrats!!! Your password has been changed successfully.</strong></h2>`,
    };

    let info = await transporter.sendMail(mailOptions);

    emailAddress = info.accepted[0];

    console.log(
      "Email Sent: " +
        emailAddress +
        " Time: " +
        new Date().toLocaleTimeString()
    );

    // console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log("ERROR_EMAIL_SENT: " + error.message);
  } finally {
    return emailAddress;
  }
};

export default {
  sendEmailWithVerificationCode,
  sendEmailWithForgetPasswordLink,
};
