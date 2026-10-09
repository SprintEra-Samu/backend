const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Erişim reddedildi. Geçerli bir token sağlanmadı.',
      details: null
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Geçersiz veya süresi dolmuş token.',
      details: null
    });
  }
};

module.exports = authenticate;
