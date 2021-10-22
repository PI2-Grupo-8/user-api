const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    trim: true
  },
  email: {
    type: String,
    require: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    require: true
  },
  reset_password_token: {
    type: String
  },
  reset_password_expires: {
    type: Date
  }
}, { timestamps: true });

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);