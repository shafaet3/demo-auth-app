import cron from "node-cron";
import { sendEmailWithVerificationCode } from "./email/sendEmail";
import { User } from "../models";

const startCronJob = async () => {
  try {
    cron.schedule("* * * * *", async () => {
      console.log("CRONJOB RUNNING AT: " + new Date().toLocaleTimeString());

      // find users where email is not verified and verification email not sent
      let users = await User.find({
        verified: false,
        isVerificationEmailSent: false,
      });

      if (users) {
        users.map(async (user) => {
          // send email to the user with verification code
          await sendEmailWithVerificationCode(user).catch(console.error);

          user.isVerificationEmailSent = true;
          await user.save();
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
};

export default startCronJob;
