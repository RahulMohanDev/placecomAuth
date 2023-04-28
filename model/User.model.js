import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
})

userSchema.pre('save', function (next) {
  const user = this
  bcrypt.hash(user.password, process.env.PASSWORD_SALT, (err, hash) => {
    if (err) {
      return next(err)
    }
    user.password = hash
    next()
  })
})

userSchema.methods.validatePassword = function (password, callback) {
  bcrypt.compare(password, this.password, (err, isValid) => {
    if (err) {
      callback(err)
    }
    callback(null, isValid)
  })
}

const User = mongoose.model('User', userSchema)
export default User
