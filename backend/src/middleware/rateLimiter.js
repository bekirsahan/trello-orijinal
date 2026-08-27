const rateLimit = require('express-rate-limit');

// Genel API rate limiter (15 dakikada en fazla 100 istek)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına maksimum istek
  message: {
    success: false,
    message: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true, // `RateLimit-*` başlıklarını ekler
  legacyHeaders: false, // `X-RateLimit-*` başlıklarını kaldırır
});

// Auth endpoints için daha sıkı rate limiter (Giriş/Kayıt denemeleri için 15 dakikada en fazla 15 istek)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 15,
  message: {
    success: false,
    message: 'Çok fazla giriş veya kayıt denemesi yaptınız. Lütfen daha sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter
};
