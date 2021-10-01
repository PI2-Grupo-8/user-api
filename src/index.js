const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { connectDB } = require('./db');
const { JWTValidate } = require('./utils/JWTValidate');

const { PORT, NODE_ENV } = process.env;

connectDB()
  .then(() => {
    console.log(`MongoDB is connected on ${NODE_ENV}`);
  })
  .catch((err) => {
    console.log('Error on connecting to MongoDB', err);
  });

const app = express();
app.use(express.json());
app.use(cors());
app.use(JWTValidate);
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;