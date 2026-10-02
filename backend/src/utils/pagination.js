function getPagination(req, defaultLimit = 20) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(1000, parseInt(req.query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function formatPaginatedResponse(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

module.exports = { getPagination, formatPaginatedResponse };
