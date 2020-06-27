import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';


// create a schema for posts with a field
const UserSchema = new Schema({
  email: { type: String, unique: true, lowercase: true },
  password: String,
  firstName: String,
  lastName: String,
  status: String,
  school: String,
  bio: String,
});

UserSchema.set('toJSON', {
  virtuals: true,
});

// On Save Hook, encrypt password
// Before saving a model, run this function
//  note use of named function rather than arrow notation
//  arrow notation is lexically scoped and prevents binding scope, which mongoose relies on
UserSchema.pre('save', function beforeUserSave(next) {
  // get access to the user model
  const user = this;

  if (!user.isModified('password')) return next();


  // generate a salt then run callback
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }

    // hash (encrypt) our password using the salt
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) { return next(err); }

      // overwrite plain text password with encrypted password
      user.password = hash;
      return next();
    });
    return undefined;
  });
  return undefined;
});


// note use of named function rather than arrow notation
//  this arrow notation is lexically scoped and prevents binding scope, which mongoose relies on
UserSchema.methods.comparePassword = function comparePassword(candidatePassword, callback) {
  console.log('Comparing password');
  bcrypt.compare(candidatePassword, this.password).then((result) => {
    callback(null, result);
  }).catch((error) => {
    callback(error);
  });
};

// create model class
const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
