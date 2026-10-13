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

  // Swagger UI'da bazen kullanıcı "Bearer <token>" yapıştırdığında "Bearer Bearer <token>" oluşabilir
  const token = authHeader.replace(/^Bearer\s+/i, '').replace(/^Bearer\s+/i, '').trim();

  if (!token || token === '') {
    return res.status(401).json({
      success: false,
      error: 'Erişim reddedildi. Geçerli bir token sağlanmadı.',
      details: null
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.user) {
      return res.status(401).json({
        success: false,
        error: 'Geçersiz token yapısı.',
        details: null
      });
    }
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
