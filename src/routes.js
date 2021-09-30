const express = require('express');

const UserController = require('./controllers/UserController');
const { loginRequired } = require('./utils/JWTValidate');

const routes = express.Router();

const { NODE_ENV } = process.env;

routes.post('/login', UserController.signIn);
routes.post('/register', UserController.register);
routes.post('/forgot_password', UserController.forgot_password);
routes.post('/reset_password', UserController.reset_password);
routes.put('/update', loginRequired, UserController.updateUser)


module.exports = routes;
