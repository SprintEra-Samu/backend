const sequelize = require('../config/database');
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const Project = require('./Project');
const Task = require('./Task');

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  Project,
  Task
};
