const { Project, User, Task } = require('../models');

exports.createProject = async (req, res, next) => {
  try {
    const { name, description, date } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Proje adı zorunludur.',
        details: null
      });
    }

    if (date && isNaN(Date.parse(date))) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz tarih formatı.',
        details: null
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description ? description.trim() : null,
      date: date || null,
      created_by: req.user ? req.user.id : null
    });

    const fullProject = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    return res.status(201).json(fullProject || project);
  } catch (error) {
    next(error);
  }
};

exports.getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz proje kimliği.',
        details: null
      });
    }

    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'title', 'status', 'assigned_to']
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Proje bulunamadı.',
        details: null
      });
    }

    return res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};
