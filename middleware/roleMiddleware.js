const { User, Role } = require('../models');

/**
 * Role-based authorization middleware
 * @param {Array<string>} allowedRoles List of allowed role names (e.g. ['Yönetici', 'Ekip Üyesi'])
 */
const authorize = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Erişim reddedildi. Kimlik doğrulama gereklidir.',
          details: null
        });
      }

      let userRoleName = req.user.role;

      // If role name is not yet in req.user, resolve from database
      if (!userRoleName && req.user.id) {
        const user = await User.findByPk(req.user.id, {
          include: [{ model: Role, attributes: ['name'] }]
        });
        if (user && user.Role) {
          userRoleName = user.Role.name;
          req.user.role = userRoleName;
        }
      }

      if (allowedRoles.length > 0 && (!userRoleName || !allowedRoles.includes(userRoleName))) {
        return res.status(403).json({
          success: false,
          error: 'Bu işlemi gerçekleştirmek için yetkiniz bulunmamaktadır.',
          details: null
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = authorize;
