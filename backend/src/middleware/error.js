const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const status = err.status || 500;
  const message = err.message || 'Sunucuda beklenmeyen bir hata oluştu.';

  res.status(status).json({
    success: false,
    message,
    // Sadece development ortamında hata detaylarını göster
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
