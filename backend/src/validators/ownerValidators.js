const { dateRangeRules } = require('./common');

const dashboardQueryValidator = [...dateRangeRules('ratedFrom', 'ratedTo')];

module.exports = { dashboardQueryValidator };
