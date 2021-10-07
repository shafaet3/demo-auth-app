import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import passport from "passport";
import { DB, PORT } from "./config";
import organizerRoutes from "./api/routes/organizer.router";
import startCronJob from "./api/helpers/startCronJob";
require("./api/middlewares/passport-middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/org", organizerRoutes);

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
