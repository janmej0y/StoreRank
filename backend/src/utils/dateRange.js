const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Builds a Prisma date-range filter object ({ gte, lte }) from optional
 * from/to Date instances (already coerced by express-validator's .toDate()).
 * "to" is treated as inclusive of the whole day.
 */
const buildDateRangeFilter = (from, to) => {
  const range = {};
  if (from) range.gte = from;
  if (to) range.lte = endOfDay(to);
  return Object.keys(range).length > 0 ? range : undefined;
};

module.exports = { buildDateRangeFilter };
