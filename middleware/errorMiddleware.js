const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Sunucu hatası',
    details: err.details || null
  });
};

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Bulunamadı: İstek yapılan rota mevcut değil.',
    details: null
  });
};

module.exports = { errorHandler, notFoundHandler };
