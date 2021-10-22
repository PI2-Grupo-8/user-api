const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { connectDB } = require('./db');
const { JWTValidate } = require('./utils/JWTValidate');
const app = require('./app');

const { PORT, NODE_ENV } = process.env;

connectDB()
  .then(() => {
    console.log(`MongoDB is connected on ${NODE_ENV}`);
  })
  .catch((err) => {
    console.log('Error on connecting to MongoDB', err);
  });

app.use(express.json());
app.use(cors());
app.use(JWTValidate);
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
