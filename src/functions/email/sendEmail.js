import { DOMAIN, from } from "../../constants";
import transporter from "./transporter";

const sendEmailWithVerificationCode = async ({
  email,
  username,
  verificationCode,
}) => {
  try {
    const mailOptions = {
      from,
      to: email,
      subject: "Verify Account",
      html: `<h1>Hello, ${username}</h1>
      <p>Please click the following link to verify your account</p>
      <a href="${DOMAIN}/users/verify-now/${verificationCode}">Verify Now</a>`,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log("ERROR_EMAIL_SENT: " + error.message);
  } finally {
    return;
  }
};

export default sendEmailWithVerificationCode;
