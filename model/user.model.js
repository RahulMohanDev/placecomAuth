import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

userSchema.pre('save', function (next) {
  const user = this;
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

userSchema.methods.checkPassword = function (password, callback) {
  bcrypt.compare(password, this.password, function (err, result) {
    if (err) return callback(err);
    callback(null, result);
  });
};

const User = mongoose.model('User', userSchema);

export default User;