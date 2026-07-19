const { ratingRule, commentRule, idParamRule, paginationRules, dateRangeRules } = require('./common');

const rateStoreValidator = [idParamRule('id'), ratingRule(), commentRule()];

const storeIdParamValidator = [idParamRule('id')];

const listQueryValidator = [...paginationRules(), ...dateRangeRules('createdFrom', 'createdTo')];

module.exports = { rateStoreValidator, storeIdParamValidator, listQueryValidator };
