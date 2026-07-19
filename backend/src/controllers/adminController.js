const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ROLES } = require('../utils/roles');
const { parsePagination, paginateArray } = require('../utils/paginate');
const { buildTrend, DAY_MS } = require('../utils/trends');
const { buildDateRangeFilter } = require('../utils/dateRange');

const SALT_ROUNDS = 10;

const ALLOWED_USER_SORT = ['name', 'email', 'address', 'role', 'createdAt'];
const ALLOWED_STORE_SORT = ['name', 'email', 'address', 'createdAt', 'rating'];
const MIN_RATINGS_FOR_TOP_STORES = 2;
const TREND_DAYS = 7;

const dashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const sinceTwoWindows = new Date(now.getTime() - 2 * TREND_DAYS * DAY_MS);

  const [
    totalUsers,
    totalStores,
    totalRatings,
    recent,
    allStores,
    roleGroups,
    recentUsers,
    recentStores,
    recentRatingRows,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count(),
    prisma.rating.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: { select: { name: true } },
        store: { select: { name: true } },
      },
    }),
    prisma.store.findMany({
      where: { isActive: true },
      select: { id: true, name: true, ratings: { select: { rating: true } } },
    }),
    prisma.user.groupBy({ by: ['role'], _count: { role: true } }),
    prisma.user.findMany({ where: { createdAt: { gte: sinceTwoWindows } }, select: { createdAt: true } }),
    prisma.store.findMany({ where: { createdAt: { gte: sinceTwoWindows } }, select: { createdAt: true } }),
    prisma.rating.findMany({ where: { createdAt: { gte: sinceTwoWindows } }, select: { createdAt: true } }),
  ]);

  const recentRatings = recent.map((r) => ({
    storeName: r.store.name,
    userName: r.user.name,
    rating: r.rating,
    ratedAt: r.createdAt,
  }));

  const topStores = allStores
    .map((s) => {
      const totalRatingsForStore = s.ratings.length;
      const avg =
        totalRatingsForStore > 0
          ? s.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatingsForStore
          : null;
      return {
        id: s.id,
        name: s.name,
        averageRating: avg !== null ? Number(avg.toFixed(2)) : null,
        totalRatings: totalRatingsForStore,
      };
    })
    .filter((s) => s.totalRatings >= MIN_RATINGS_FOR_TOP_STORES)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 5);

  const roleBreakdown = { ADMIN: 0, OWNER: 0, USER: 0 };
  roleGroups.forEach((g) => {
    roleBreakdown[g.role] = g._count.role;
  });

  const usersTrend = buildTrend(recentUsers, { days: TREND_DAYS, now });
  const storesTrend = buildTrend(recentStores, { days: TREND_DAYS, now });
  const ratingsTrend = buildTrend(recentRatingRows, { days: TREND_DAYS, now });

  res.json({
    totalUsers,
    totalStores,
    totalRatings,
    recentRatings,
    topStores,
    roleBreakdown,
    trends: {
      users: { series: usersTrend.series, delta: usersTrend.delta },
      stores: { series: storesTrend.series, delta: storesTrend.delta },
      ratings: { series: ratingsTrend.series, delta: ratingsTrend.delta },
    },
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const { name, email, address, role, sortBy = 'createdAt', order = 'desc', createdFrom, createdTo } = req.query;
  const { page, pageSize, skip } = parsePagination(req.query);

  const where = {};
  if (name) where.name = { contains: String(name), mode: 'insensitive' };
  if (email) where.email = { contains: String(email), mode: 'insensitive' };
  if (address) where.address = { contains: String(address), mode: 'insensitive' };
  if (role) where.role = String(role).toUpperCase();
  const createdAtFilter = buildDateRangeFilter(createdFrom, createdTo);
  if (createdAtFilter) where.createdAt = createdAtFilter;

  const orderField = ALLOWED_USER_SORT.includes(sortBy) ? sortBy : 'createdAt';
  const orderDir = order === 'asc' ? 'asc' : 'desc';

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [orderField]: orderDir },
      select: { id: true, name: true, email: true, address: true, role: true, isActive: true, createdAt: true },
      skip,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    items: users,
    pagination: { page, pageSize, total, totalPages: Math.max(Math.ceil(total / pageSize), 1) },
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, address: true, role: true, isActive: true, createdAt: true },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  let storeRating = null;
  if (user.role === ROLES.OWNER) {
    const store = await prisma.store.findFirst({
      where: { ownerId: user.id },
      include: { _count: { select: { ratings: true } }, ratings: { select: { rating: true } } },
    });
    if (store) {
      const avg =
        store.ratings.length > 0
          ? store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length
          : null;
      storeRating = {
        storeId: store.id,
        storeName: store.name,
        averageRating: avg !== null ? Number(avg.toFixed(2)) : null,
        totalRatings: store._count.ratings,
      };
    }
  }

  res.json({ user, storeRating });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, address, password, role = ROLES.USER } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(400, 'Validation failed', { email: 'Email is already registered' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, address, passwordHash, role },
    select: { id: true, name: true, email: true, address: true, role: true, isActive: true, createdAt: true },
  });

  res.status(201).json({ user });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (id === req.user.id) {
    throw new ApiError(400, 'Validation failed', { isActive: 'You cannot deactivate your own account' });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: { id: true, name: true, email: true, address: true, role: true, isActive: true, createdAt: true },
  });

  res.json({ user: updated });
});

const listStores = asyncHandler(async (req, res) => {
  const { name, email, address, sortBy = 'createdAt', order = 'desc', createdFrom, createdTo } = req.query;
  const { page, pageSize } = parsePagination(req.query);

  const where = {};
  if (name) where.name = { contains: String(name), mode: 'insensitive' };
  if (email) where.email = { contains: String(email), mode: 'insensitive' };
  if (address) where.address = { contains: String(address), mode: 'insensitive' };
  const createdAtFilter = buildDateRangeFilter(createdFrom, createdTo);
  if (createdAtFilter) where.createdAt = createdAtFilter;

  const stores = await prisma.store.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true, email: true } },
      ratings: { select: { rating: true } },
    },
    orderBy: ALLOWED_STORE_SORT.includes(sortBy) && sortBy !== 'rating'
      ? { [sortBy]: order === 'asc' ? 'asc' : 'desc' }
      : { createdAt: 'desc' },
  });

  let shaped = stores.map((s) => {
    const avg = s.ratings.length > 0 ? s.ratings.reduce((sum, r) => sum + r.rating, 0) / s.ratings.length : null;
    return {
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      owner: s.owner,
      isActive: s.isActive,
      createdAt: s.createdAt,
      averageRating: avg !== null ? Number(avg.toFixed(2)) : null,
      totalRatings: s.ratings.length,
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

const updateStoreStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) {
    throw new ApiError(404, 'Store not found');
  }

  const updated = await prisma.store.update({
    where: { id },
    data: { isActive },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });

  res.json({ store: updated });
});

const createStore = asyncHandler(async (req, res) => {
  const { name, email, address, ownerId } = req.body;

  if (ownerId) {
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) {
      throw new ApiError(400, 'Validation failed', { ownerId: 'Owner not found' });
    }
    if (owner.role !== ROLES.OWNER) {
      throw new ApiError(400, 'Validation failed', { ownerId: 'Assigned user must have the OWNER role' });
    }
  }

  const store = await prisma.store.create({
    data: { name, email, address, ownerId: ownerId || null },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });

  res.status(201).json({ store });
});

module.exports = {
  dashboard,
  listUsers,
  getUserById,
  createUser,
  updateUserStatus,
  listStores,
  createStore,
  updateStoreStatus,
};
