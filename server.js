require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./docs/swagger');
const { sequelize } = require('./models');

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Docs
const swaggerOptions = {
  customHead: '<meta name="google" content="notranslate">'
};
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, swaggerOptions));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

// 404 handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Veritabanı bağlantısı ve sunucu başlatma
if (process.env.NODE_ENV !== 'test') {
  sequelize.sync().then(() => {
    console.log('PostgreSQL bağlantısı başarılı!');
    app.listen(PORT, () => {
      console.log(`Sunucu ${PORT} portunda çalışıyor.`);
      console.log(`Swagger dokümantasyonu http://localhost:${PORT}/api/docs adresinde mevcut.`);
    });
  }).catch(err => {
    console.error('Veritabanına bağlanılamadı:', err);
  });
}

module.exports = app;
