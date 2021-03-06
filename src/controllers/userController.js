import jwt from 'jwt-simple';
import dotenv from 'dotenv';


import User from '../models/userModel';

dotenv.config({ silent: true });


function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, process.env.AUTH_SECRET);
}


export const signin = (req, res, next) => {
  // User has already had their email and password auth'd
  // We just need to give them a token
  // console.log('in this method');
  console.log(req.user);
  res.send({ token: tokenForUser(req.user), email: req.user.email, id: req.user._id });
};


export const signup = (req, res, next) => {
  const { email } = req.body;
  const { password } = req.body;
  const {
    firstName, lastName, school, debateApp, photo,
  } = req.body;
  let status = 'NOT_DEBATOR';
  let bio = '';
  if (debateApp) {
    status = 'PENDING';
    bio = req.body.bio;
  }

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
      firstName,
      lastName,
      school,
      status,
      bio,
      photo,
    });
    return user.save();
  })
    .then((user) => {
      console.log(user);
      res.json({ token: tokenForUser(user), email, id: user._id });
    })
    .catch((error) => {
      return res.status(422).send({ error });
    });

  return null;
};

export const getPendingStatus = (req, res) => {
  User.find({ status: 'PENDING' })
    .then((post) => {
      res.json(post);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

export const getApprovedUsers = (req, res) => {
  User.find({ status: 'APPROVED' }).sort({ mostRecentlyRequestedDate: -1 }).limit(10)
    .then((post) => {
      res.json(post);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// export const updateRecentlyAcceptedDate = (req, res) => {
//   user
// }

export const getUserByEmail = (req, res) => {
  // console.log(req.body);
  // console.log(req.body.email);
  User.find({ email: req.body.email })
    .then((post) => {
      res.json(post);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

export const updateStatus = (req, res) => {
  // console.log(req.params.id);
  // console.log('ABove is ID');
  User.findById(req.params.id)
    .then((post) => {
      // console.log(post);
      // console.log('this was found');
      post.status = req.body.status;
      // console.log(post.status);
      // console.log('status after changing ^');
      // console.log(req.body);
      return post.save();
    })
    .then((post) => {
    //  console.log('trying to send');
      res.send(post);
    })
    .catch((error) => {
      res.status(422).json({ error });
    });
};

export const updatePhoto = (req, res) => {
  // console.log(req.params.id);
  // console.log('ABove is ID');
  User.findById(req.params.id)
    .then((post) => {
      // console.log(post);
      // console.log('this was found');
      post.photo = req.body.photo;
      // console.log(post.status);
      // console.log('status after changing ^');
      // console.log(req.body);
      return post.save();
    })
    .then((post) => {
    //  console.log('trying to send');
      res.send(post);
    })
    .catch((error) => {
      res.status(422).json({ error });
    });
};

export const updateProfile = (req, res) => {
  // console.log(req.params.id);
  // console.log('ABove is ID');
  User.findById(req.params.id)
    .then((user) => {
      // console.log(post);
      // console.log('this was found');
      if (req.body.email !== '') {
        user.email = req.body.email;
      }
      if (req.body.firstName !== '') {
        user.firstName = req.body.firstName;
      }
      if (req.body.lastName !== '') {
        user.lastName = req.body.lastName;
      }
      if (req.body.school !== '') {
        user.school = req.body.school;
      }
      if (req.body.bio !== '') {
        user.bio = req.body.bio;
      }
      if (req.body.photo !== '') {
        user.photo = req.body.photo;
      }
      if (req.body.status !== '') {
        user.status = req.body.status;
      }
      // console.log(post.status);
      // console.log('status after changing ^');
      // console.log(req.body);
      return user.save();
    })
    .then((post) => {
    //  console.log('trying to send');
      res.send(post);
    })
    .catch((error) => {
      res.status(422).json({ error });
    });
};
