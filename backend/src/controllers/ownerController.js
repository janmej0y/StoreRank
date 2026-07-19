const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { buildTrend } = require('../utils/trends');
const { buildDateRangeFilter } = require('../utils/dateRange');

const ALLOWED_SORT = ['name', 'email', 'rating', 'ratedAt'];
const TREND_DAYS = 7;

const dashboard = asyncHandler(async (req, res) => {
  const { sortBy = 'name', order = 'asc', ratedFrom, ratedTo } = req.query;
  const ownerId = req.user.id;

  const store = await prisma.store.findFirst({ where: { ownerId } });

  if (!store) {
    return res.json({
      store: null,
      raters: [],
      averageRating: null,
      totalRatings: 0,
      ratingsTrend: buildTrend([], { days: TREND_DAYS }),
    });
  }

  const where = { storeId: store.id };
  const ratedAtFilter = buildDateRangeFilter(ratedFrom, ratedTo);
  if (ratedAtFilter) where.createdAt = ratedAtFilter;

  let orderBy;
  if (sortBy === 'rating') {
    orderBy = { rating: order === 'asc' ? 'asc' : 'desc' };
  } else if (sortBy === 'ratedAt') {
    orderBy = { createdAt: order === 'asc' ? 'asc' : 'desc' };
  } else if (ALLOWED_SORT.includes(sortBy)) {
    orderBy = { user: { [sortBy]: order === 'asc' ? 'asc' : 'desc' } };
  } else {
    orderBy = { user: { name: 'asc' } };
  }

  const ratings = await prisma.rating.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy,
  });

  // Overall average/total reflect the full rating history, not the filtered date range.
  const allRatings = ratedAtFilter
    ? await prisma.rating.findMany({ where: { storeId: store.id }, select: { rating: true, createdAt: true } })
    : ratings;

  const totalRatings = allRatings.length;
  const averageRating =
    totalRatings > 0
      ? Number((allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(2))
      : null;

  const raters = ratings.map((r) => ({
    userId: r.user.id,
    name: r.user.name,
    email: r.user.email,
    rating: r.rating,
    ratedAt: r.updatedAt,
  }));

  const ratingsTrend = buildTrend(
    allRatings.map((r) => ({ createdAt: r.createdAt })),
    { days: TREND_DAYS }
  );

  res.json({
    store: { id: store.id, name: store.name, email: store.email, address: store.address },
    raters,
    averageRating,
    totalRatings,
    ratingsTrend,
  });
});

module.exports = { dashboard };
