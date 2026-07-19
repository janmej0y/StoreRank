const { body } = require('express-validator');
const { dateRangeRules, idParamRule, nameRule, emailRule, addressRule } = require('./common');

const dashboardQueryValidator = [...dateRangeRules('ratedFrom', 'ratedTo')];

const respondToRatingValidator = [
  idParamRule('id'),
  body('response')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Response must be at most 500 characters'),
];

const updateStoreValidator = [nameRule('name'), emailRule('email'), addressRule('address')];

module.exports = { dashboardQueryValidator, respondToRatingValidator, updateStoreValidator };
