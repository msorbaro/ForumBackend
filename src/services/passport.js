import passport from 'passport';
import LocalStrategy from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import User from '../models/userModel';

// loads in .env file if needed
// dotenv.config({ silent: true });

const localOptions = { usernameField: 'email' };
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: process.env.AUTH_SECRET,
};


const localLogin = new LocalStrategy(localOptions, (email, password, done) => {
  // Verify this email and password, call done with the user
  // if it is the correct email and password
  // otherwise, call done with false
  User.findOne({ email }, (err, user) => {
    if (err) { return done(err); }

    if (!user) { return done(null, false); }

    // compare passwords - is `password` equal to user.password?
    user.comparePassword(password, (err, isMatch) => {
      if (err) {
        done(err);
      } else if (!isMatch) {
        done(null, false);
      } else {
        done(null, user);
      }
    });
    return undefined;
  });
});


const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  // See if the user ID in the payload exists in our database
  // If it does, call 'done' with that other
  // otherwise, call done without a user object
  User.findById(payload.sub, (err, user) => {
    if (err) {
      done(err, false);
    } else if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

// Tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);

export const requireAuth = passport.authenticate('jwt', { session: false });
export const requireSignin = passport.authenticate('local', { session: false });
