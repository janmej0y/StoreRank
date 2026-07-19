const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
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
    ratingId: r.id,
    userId: r.user.id,
    name: r.user.name,
    email: r.user.email,
    rating: r.rating,
    comment: r.comment,
    ratedAt: r.updatedAt,
    ownerResponse: r.ownerResponse,
    ownerRespondedAt: r.ownerRespondedAt,
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

const respondToRating = asyncHandler(async (req, res) => {
  const ratingId = req.params.id;
  const { response } = req.body;
  const ownerId = req.user.id;

  const rating = await prisma.rating.findUnique({
    where: { id: ratingId },
    include: { store: { select: { ownerId: true } } },
  });

  if (!rating || rating.store.ownerId !== ownerId) {
    throw new ApiError(404, 'Review not found');
  }

  const updated = await prisma.rating.update({
    where: { id: ratingId },
    data: {
      ownerResponse: response || null,
      ownerRespondedAt: response ? new Date() : null,
    },
  });

  res.json({
    ratingId: updated.id,
    ownerResponse: updated.ownerResponse,
    ownerRespondedAt: updated.ownerRespondedAt,
  });
});

const updateStore = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const { name, email, address } = req.body;

  const store = await prisma.store.findFirst({ where: { ownerId } });
  if (!store) {
    throw new ApiError(404, 'No store is linked to your account');
  }

  const updated = await prisma.store.update({
    where: { id: store.id },
    data: { name, email, address },
  });

  res.json({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    address: updated.address,
  });
});

module.exports = { dashboard, respondToRating, updateStore };
