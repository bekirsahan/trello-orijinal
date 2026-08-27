const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/error');
const routes = require('./routes');

const app = express();

// Güvenlik Hardening Middleware'leri
app.use(helmet()); // HTTP Başlıklarını güvenceye alır
app.use(cors({
  origin: '*', // Çok platformlu (web, mobil, electron) olduğu için tüm kökenlere izin veriyoruz
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // JSON gövdelerini işler

// Rate Limiter
app.use('/api', apiLimiter);

// API Route'ları
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
