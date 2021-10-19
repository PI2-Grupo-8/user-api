const User = require('../models/UserSchema'),
  async = require('async'),
  jwt = require('jsonwebtoken'),
  { smtpTransport, email } = require('../utils/SMTPConfig'),
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
    return res.json({ ...user._doc })
  } catch (err) {
    console.log(err);
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
    try {
      if (err) throw err;
      if (!user || !user.comparePassword(req.body.password)) {
        return res.status(401).json({ message: 'Authentication failed. Invalid user or password.' });
      }
      let response = { ...user._doc, token: jwt.sign({ email: user.email, name: user.name, _id: user._id }, 'RESTFULAPIs') };
      response.password = undefined;
      return res.json(response);
    } catch (error) {
      return res.status(400).json({
        message: "Could not login",
        error: error
      });
    }
  });
}

const forgot_password = (req, res) => {
  async.waterfall([
    function (callback) {
      User.findOne({
        email: req.body.email
      }).exec(function (err, user) {
        if (user) {
          callback(err, user);
        } else {
          callback('User not found.');
        }
      });
    },
    function (user, callback) {
      // create a unique token
      var tokenObject = {
        email: user.email,
        id: user._id
      };
      var secret = user._id + '_' + user.email + '_' + new Date().getTime();
      var token = jwt.sign(tokenObject, secret);
      callback(null, user, token);
    },
    function (user, token, callback) {
      User.findByIdAndUpdate({ _id: user._id }, { reset_password_token: token, reset_password_expires: Date.now() + 86400000 }, { new: true }).exec(function (err, new_user) {
        callback(err, token, new_user);
      });
    },
    function (token, user, callback) {
      var data = {
        to: user.email,
        from: email,
        template: 'forgot-password-email',
        subject: 'Recuperação de senha StrongBerry!',
        context: {
          url: 'http://localhost:3000/auth/reset_password?token=' + token,
          name: user.name.split(' ')[0]
        }
      };

      smtpTransport.sendMail(data, function (err) {
        if (!err) {
          return res.json({ message: 'Kindly check your email for further instructions' });
        } else {
          return callback(err);
        }
      });
    }
  ], function (err) {
    console.log(err);
    return res.status(422).json({ message: err });
  });
};

const reset_password = (req, res, next) => {
  User.findOne({
    reset_password_token: req.body.token,
    reset_password_expires: {
      $gt: Date.now()
    }
  }).exec(function (err, user) {
    try {
      if (!err && user) {
        validateUserData(req.body.newPassword, true);
        user.password = bcrypt.hashSync(req.body.newPassword, 10);
        user.reset_password_token = undefined;
        user.reset_password_expires = undefined;
        user.save(function (err) {
          if (err) {
            return res.status(422).send({
              message: err
            });
          } else {
            //var data = {
            //  to: user.email,
            //  from: email,
            //  template: 'reset-password-email',
            //  subject: 'Password Reset Confirmation',
            //  context: {
            //    name: user.name.split(' ')[0]
            //  }
            //};

            //smtpTransport.sendMail(data, function (err) {
            //  if (!err) {
            //    return res.json({ message: 'Password reset' });
            //  } else {
            //    return callback(err);
            //  }
            //});
          }
        });
      } else {
        return res.status(400).send({
          message: 'Password reset token is invalid or has expired.'
        });
      }
    } catch (err) {
      err = catchRepeatedValueError(err)
      return res.status(400).json({
        message: "Could not update user",
        error: err
      });
    }
  });
};


module.exports = {
  register,
  signIn,
  updateUser,
  forgot_password,
  reset_password
}