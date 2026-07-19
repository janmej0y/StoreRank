const { body } = require('express-validator');
const { nameRule, emailRule, addressRule, passwordRule } = require('./common');

const registerValidator = [nameRule(), emailRule(), addressRule(), passwordRule()];

const loginValidator = [
  emailRule(),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  passwordRule('newPassword'),
];

module.exports = { registerValidator, loginValidator, changePasswordValidator };
