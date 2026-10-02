function errorHandler(err, req, res, next) {
  console.error('[Error]', err);

  if (err.name === 'ZodError') {
    const formatted = {};
    err.errors.forEach((e) => {
      const field = e.path.join('.');
      formatted[field] = e.message;
    });
    return res.status(422).json({
      success: false,
      message: 'Validasi gagal',
      errors: formatted,
    });
  }

  if (err.code === 'P2002') {
    const target = err.meta && err.meta.target ? err.meta.target.join(', ') : 'field';
    return res.status(409).json({
      success: false,
      message: 'Data duplikat pada: ' + target,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Data tidak ditemukan',
    });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
}

module.exports = errorHandler;
