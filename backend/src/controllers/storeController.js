const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { parsePagination, paginateArray } = require('../utils/paginate');
const { buildDateRangeFilter } = require('../utils/dateRange');

const ALLOWED_SORT = ['name', 'address', 'rating', 'createdAt'];

const listStores = asyncHandler(async (req, res) => {
  const { name, address, sortBy = 'name', order = 'asc', createdFrom, createdTo } = req.query;
  const { page, pageSize } = parsePagination(req.query);
  const userId = req.user.id;

  const where = { isActive: true };
  if (name) where.name = { contains: String(name), mode: 'insensitive' };
  if (address) where.address = { contains: String(address), mode: 'insensitive' };
  const createdAtFilter = buildDateRangeFilter(createdFrom, createdTo);
  if (createdAtFilter) where.createdAt = createdAtFilter;

  const stores = await prisma.store.findMany({
    where,
    include: {
      ratings: { select: { rating: true, userId: true } },
    },
    orderBy: ALLOWED_SORT.includes(sortBy) && sortBy !== 'rating'
      ? { [sortBy]: order === 'asc' ? 'asc' : 'desc' }
      : { name: 'asc' },
  });

  let shaped = stores.map((s) => {
    const avg = s.ratings.length > 0 ? s.ratings.reduce((sum, r) => sum + r.rating, 0) / s.ratings.length : null;
    const own = s.ratings.find((r) => r.userId === userId);
    return {
      id: s.id,
      name: s.name,
      address: s.address,
      createdAt: s.createdAt,
      averageRating: avg !== null ? Number(avg.toFixed(2)) : null,
      totalRatings: s.ratings.length,
      myRating: own ? own.rating : null,
    };
  });

  if (sortBy === 'rating') {
    shaped = shaped.sort((a, b) => {
      const av = a.averageRating ?? -1;
      const bv = b.averageRating ?? -1;
      return order === 'asc' ? av - bv : bv - av;
    });
  }

  const { items, pagination } = paginateArray(shaped, page, pageSize);

  res.json({ items, pagination });
});

const getStoreById = asyncHandler(async (req, res) => {
  const storeId = req.params.id;
  const userId = req.user.id;

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      ratings: {
        orderBy: { updatedAt: 'desc' },
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });

  if (!store || (!store.isActive && req.user.role !== 'ADMIN')) {
    throw new ApiError(404, 'Store not found');
  }

  const totalRatings = store.ratings.length;
  const averageRating =
    totalRatings > 0
      ? Number((store.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(2))
      : null;

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  store.ratings.forEach((r) => {
    distribution[r.rating] += 1;
  });

  const own = store.ratings.find((r) => r.user.id === userId);

  const reviews = store.ratings.map((r) => ({
    userName: r.user.name,
    rating: r.rating,
    comment: r.comment,
    ratedAt: r.updatedAt,
  }));

  res.json({
    store: {
      id: store.id,
      name: store.name,
      address: store.address,
      isActive: store.isActive,
    },
    averageRating,
    totalRatings,
    distribution,
    myRating: own ? own.rating : null,
    myComment: own ? own.comment : null,
    reviews,
  });
});

const rateStore = asyncHandler(async (req, res) => {
  const storeId = req.params.id;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store || !store.isActive) {
    throw new ApiError(404, 'Store not found');
  }

  const data = { rating };
  if (comment !== undefined) {
    data.comment = comment || null;
  }

  const saved = await prisma.rating.upsert({
    where: { userId_storeId: { userId, storeId } },
    update: data,
    create: { userId, storeId, ...data },
  });

  const agg = await prisma.rating.aggregate({
    where: { storeId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  res.json({
    myRating: saved.rating,
    myComment: saved.comment,
    averageRating: agg._avg.rating !== null ? Number(agg._avg.rating.toFixed(2)) : null,
    totalRatings: agg._count.rating,
  });
});

module.exports = { listStores, getStoreById, rateStore };
