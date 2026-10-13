const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Project = require('./Project');
const User = require('./User');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('To Do', 'In Progress', 'Done'),
    allowNull: false,
    defaultValue: 'To Do'
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Project,
      key: 'id'
    }
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  tableName: 'tasks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// İlişkiler
Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks' });

Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
User.hasMany(Task, { foreignKey: 'assigned_to', as: 'assignedTasks' });

module.exports = Task;
