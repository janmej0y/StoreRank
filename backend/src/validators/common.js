const { body, param, query } = require('express-validator');

const nameRule = (field = 'name') =>
  body(field)
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters');

const emailRule = (field = 'email') =>
  body(field).trim().isEmail().withMessage('Enter a valid email address').normalizeEmail();

const addressRule = (field = 'address') =>
  body(field)
    .trim()
    .isLength({ min: 1, max: 400 })
    .withMessage('Address is required and must be at most 400 characters');

const passwordRule = (field = 'password') =>
  body(field)
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/)
    .withMessage('Password must contain at least one special character');

const ratingRule = (field = 'rating') =>
  body(field).isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5');

const commentRule = (field = 'comment') =>
  body(field)
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment must be at most 500 characters');

const idParamRule = (field = 'id') =>
  param(field).isInt({ min: 1 }).withMessage('Invalid id').toInt();

const sortOrderRule = (field = 'order') =>
  query(field)
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order must be "asc" or "desc"');

const paginationRules = () => [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer').toInt(),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('pageSize must be between 1 and 50')
    .toInt(),
];

const isActiveBodyRule = (field = 'isActive') =>
  body(field).isBoolean().withMessage('isActive must be a boolean').toBoolean();

const dateRangeRules = (fromField, toField) => [
  query(fromField).optional().isISO8601().withMessage(`${fromField} must be a valid date`).toDate(),
  query(toField).optional().isISO8601().withMessage(`${toField} must be a valid date`).toDate(),
];

module.exports = {
  nameRule,
  emailRule,
  addressRule,
  passwordRule,
  ratingRule,
  commentRule,
  idParamRule,
  sortOrderRule,
  paginationRules,
  isActiveBodyRule,
  dateRangeRules,
};
