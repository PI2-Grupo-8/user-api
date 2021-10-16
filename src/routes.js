const express = require('express');

const UserController = require('./controllers/UserController')

const routes = express.Router();

const { NODE_ENV } = process.env;

routes.get('/', (req, res) => {
  return res.status(200).json({ message: `User API is running on ${NODE_ENV}` });
});

routes.post('/login', UserController.signIn);
routes.post('/register', UserController.register);
routes.put('/update', UserController.loginRequired, UserController.updateUser)

module.exports = routes;
