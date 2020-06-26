import jwt from 'jwt-simple';

import User from '../models/userModel';

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, process.env.AUTH_SECRET);
}


export const signin = (req, res, next) => {
  // User has already had their email and password auth'd
  // We just need to give them a token
  res.send({ token: tokenForUser(req.user), username: req.user.username, email: req.user.email });
};


export const signup = (req, res, next) => {
  const { email } = req.body;
  const { password } = req.body;
  const { username } = req.body;

  if (!email || !password) {
    return res.status(422).send('You must provide email and password');
  }

  // See if a user with the given email exists
  User.findOne({ email }).then((existingUser) => {
    if (existingUser) {
      // If a user with email does exist, return an error
      throw new Error('Email is in use');
    }
    // If a user with email does NOT exist, create and save user record
    const user = new User({
      email,
      password,
      username,
    });
    return user.save();
  })
    .then((user) => {
      res.json({ token: tokenForUser(user), username, email });
    })
    .catch((error) => {
      return res.status(422).send({ error });
    });

  return null;
};
