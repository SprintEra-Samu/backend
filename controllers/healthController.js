const sequelize = require('../config/database');

exports.checkHealth = async (req, res, next) => {
  try {
    await sequelize.authenticate();
    return res.status(200).json({
      status: 'ok',
      database: 'connected'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
  }
};
