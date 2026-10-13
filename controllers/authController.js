const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email and password are required',
        details: null
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz e-posta formatı',
        details: null
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Bu e-posta zaten kayıtlı',
        details: null
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Let's assume default role is 'Ekip Üyesi', we'll find or create it
    const [role] = await Role.findOrCreate({ where: { name: 'Ekip Üyesi' } });

    const newUser = await User.create({
      name,
      email,
      password_hash,
      role_id: role.id
    });

    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role_id: newUser.role_id,
      created_at: newUser.created_at
    };

    return res.status(201).json(userResponse);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        details: null
      });
    }

    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, attributes: ['id', 'name'] }]
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'E-posta veya şifre hatalı',
        details: null
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'E-posta veya şifre hatalı',
        details: null
      });
    }

    const payload = {
      user: {
        id: user.id,
        role_id: user.role_id,
        role: user.Role ? user.Role.name : null
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        Role: user.Role ? { id: user.Role.id, name: user.Role.name } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: Role,
          attributes: ['id', 'name']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı',
        details: null
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
