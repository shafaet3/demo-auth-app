import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import passport from "passport";
import { DB, PORT } from "./src/constants";
import userApis from "./src/apis/users";
import startCronJob from "./src/functions/startCronJob";
require("./src/middlewares/passport-middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/users", userApis);

const main = async () => {
  try {
    await mongoose.connect(DB);

    console.log(`DB Connected Successfully`);

    startCronJob();

    app.listen(PORT, () => {
      console.log(`Server app listening at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log(`DB Connection Error: ${err}`);
    main();
  }
};

main();
