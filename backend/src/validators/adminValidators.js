const { body } = require('express-validator');
const {
  nameRule,
  emailRule,
  addressRule,
  passwordRule,
  idParamRule,
  paginationRules,
  isActiveBodyRule,
  dateRangeRules,
} = require('./common');

const createUserValidator = [
  nameRule(),
  emailRule(),
  addressRule(),
  passwordRule(),
  body('role')
    .optional()
    .isIn(['ADMIN', 'USER', 'OWNER'])
    .withMessage('Role must be one of ADMIN, USER, OWNER'),
];

const createStoreValidator = [
  nameRule(),
  emailRule(),
  addressRule(),
  body('ownerId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Invalid owner id').toInt(),
];

const userIdParamValidator = [idParamRule()];

const listQueryValidator = [...paginationRules(), ...dateRangeRules('createdFrom', 'createdTo')];

const updateStatusValidator = [idParamRule(), isActiveBodyRule()];

module.exports = {
  createUserValidator,
  createStoreValidator,
  userIdParamValidator,
  listQueryValidator,
  updateStatusValidator,
};
