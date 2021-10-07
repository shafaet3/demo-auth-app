import passport from "passport";
import User from "../models/User";
import { SECRET } from "../../config";
import { Strategy, ExtractJwt } from "passport-jwt";

const opt = {
  secretOrKey: SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new Strategy(opt, async ({ id }, done) => {
    try {
      let user = await User.findById(id);
      if (!user) {
        throw new Error("User not found.");
      }
      return done(null, user.getUserInfo());
    } catch (error) {
      done(null, false);
    }
  })
);
