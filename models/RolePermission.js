const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Role = require('./Role');
const Permission = require('./Permission');

const RolePermission = sequelize.define('RolePermission', {
  role_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Role,
      key: 'id'
    }
  },
  permission_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Permission,
      key: 'id'
    }
  }
}, {
  tableName: 'role_permissions',
  timestamps: false
});

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'role_id' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permission_id' });

module.exports = RolePermission;
