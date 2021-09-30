const ValidationError = require("./ValidationError");
const notBlank = (item, label) => {
  if (!item) {
    return `${label} must not be blank`
  }
}


const nameValidation = (name) => {
  const regex = /\d/;
  if (name && regex.test(name)) {
    return 'name must have only letters.';
  }
}

const mailValidation = (mail) => {
  const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (mail && !regex.test(mail)) {
    return 'mail must be valid.';
  }
}

const passwordValidation = (password) => {
  if (password && password.length < 4) {
    return 'password must be at least 4 characters.';
  }
}
const validateUserData = (req_body, update = false) => {
  const { name, email, password } = req_body;
  errors = []
  if (!update)
    Object.keys({ name, email, password }).map((key) => {
      errors.push(notBlank(req_body[key], key))
    })

  errors.push(passwordValidation(password))
  errors.push(nameValidation(name))
  errors.push(mailValidation(email))

  errors = removeUndefinedValues(errors)

  if (errors.length > 0) {
    throw new ValidationError(errors)
  }
}

const removeUndefinedValues = (arr) => {
  return arr.filter((element) => {
    return element !== undefined;
  });
}

const catchRepeatedValueError = (error) => {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    let nonUniqueValues = Object.keys(error.keyPattern)
    return new ValidationError([`${nonUniqueValues} must be unique`])
  }
  return error
}


module.exports = {
  validateUserData,
  catchRepeatedValueError,
}