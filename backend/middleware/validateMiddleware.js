const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    const errorMessages = error.errors ? error.errors.map((e) => e.message).join(', ') : error.message;
    return next(new AppError(`Validation Error: ${errorMessages}`, 400, error.errors));
  }
};

module.exports = validate;