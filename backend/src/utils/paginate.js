const DEFAULT_PAGE_SIZE = 10;

const parsePagination = (query) => {
  const page = query.page || 1;
  const pageSize = query.pageSize || DEFAULT_PAGE_SIZE;
  return { page, pageSize, skip: (page - 1) * pageSize };
};

const paginateArray = (items, page, pageSize) => {
  const total = items.length;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    pagination: { page, pageSize, total, totalPages },
  };
};

module.exports = { parsePagination, paginateArray, DEFAULT_PAGE_SIZE };
