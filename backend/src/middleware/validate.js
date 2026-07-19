const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  const fieldErrors = {};
  for (const err of result.array()) {
    if (!fieldErrors[err.path]) {
      fieldErrors[err.path] = err.msg;
    }
  }

  next(new ApiError(400, 'Validation failed', fieldErrors));
};

module.exports = validate;
