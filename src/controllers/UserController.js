const User = require('../models/UserSchema'),
  mongoose = require('mongoose'),
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcrypt'),
  { validateUserData, catchRepeatedValueError } = require('../utils/ValidateUser');

const register = async (req, res) => {
  try {
    validateUserData(req.body);
    var newUser = new User(req.body);
    newUser.password = bcrypt.hashSync(req.body.password, 10);
    newUser.save(function (err, user) {
      if (!err) {
        let response = { ...user._doc, token: jwt.sign({ email: user.email, name: user.name, _id: user._id }, 'RESTFULAPIs') };
        response.password = undefined;
        return res.json(response);
      } else {
        handleRegistrationError(res, err);
      }
    });
  } catch (err) {
    handleRegistrationError(res, err);
  }
}

const updateUser = async (req, res) => {
  const { _id } = req.user;
  const updateObject = { ...req.body };
  if (req.body.password) updateObject.password = bcrypt.hashSync(req.body.password, 10);
  try {
    validateUserData(req.body, true);
    let user = await User.findOneAndUpdate({ _id }, {
      ...updateObject
    }, { new: true });
    user.password = undefined;
    return res.json(user)
  } catch (err) {
    err = catchRepeatedValueError(err)
    return res.status(400).json({
      message: "Could not update user",
      error: err
    });
  }
};

const handleRegistrationError = (res, err) => {
  err = catchRepeatedValueError(err);
  return res.status(400).json({
    message: "Could not create user",
    error: err
  });
}

const signIn = (req, res) => {
  User.findOne({
    email: req.body.email
  }, function (err, user) {
    if (err) throw err;
    if (!user || !user.comparePassword(req.body.password)) {
      return res.status(401).json({ message: 'Authentication failed. Invalid user or password.' });
    }
    let response = { ...user._doc, token: jwt.sign({ email: user.email, name: user.name, _id: user._id }, 'RESTFULAPIs') };
    response.password = undefined;
    return res.json(response);
  });
}

const loginRequired = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    return res.status(401).json({ message: 'Unauthorized user!' });
  }
}

module.exports = {
  register,
  signIn,
  updateUser,
  loginRequired
}