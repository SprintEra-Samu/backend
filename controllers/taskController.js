const { Task, Project, User } = require('../models');

const ALLOWED_STATUSES = ['To Do', 'In Progress', 'Done'];

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const projectId = req.body.projectId || req.body.project_id;
    const assignedTo = req.body.assignedTo || req.body.assigned_to;

    // Title validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Görev başlığı zorunludur.',
        details: null
      });
    }

    // Project validation
    if (!projectId || isNaN(parseInt(projectId, 10))) {
      return res.status(400).json({
        success: false,
        error: 'Geçerli bir proje kimliği (projectId) zorunludur.',
        details: null
      });
    }

    const project = await Project.findByPk(parseInt(projectId, 10));
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Bağlı olduğu proje bulunamadı.',
        details: null
      });
    }

    // Assignee validation
    let validAssignedTo = null;
    if (assignedTo !== undefined && assignedTo !== null && assignedTo !== '') {
      const parsedAssignedTo = parseInt(assignedTo, 10);
      if (isNaN(parsedAssignedTo)) {
        return res.status(400).json({
          success: false,
          error: 'Geçersiz atanan kullanıcı kimliği.',
          details: null
        });
      }

      const assignee = await User.findByPk(parsedAssignedTo);
      if (!assignee) {
        return res.status(404).json({
          success: false,
          error: 'Atanan kullanıcı bulunamadı.',
          details: null
        });
      }
      validAssignedTo = parsedAssignedTo;
    }

    // Status validation
    let taskStatus = 'To Do';
    if (status) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Geçersiz görev durumu. İzin verilen durumlar: ${ALLOWED_STATUSES.join(', ')}`,
          details: null
        });
      }
      taskStatus = status;
    }

    const newTask = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : null,
      status: taskStatus,
      project_id: project.id,
      assigned_to: validAssignedTo
    });

    const fullTask = await Task.findByPk(newTask.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    return res.status(201).json(fullTask || newTask);
  } catch (error) {
    next(error);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const where = {};
    const projectId = req.query.projectId || req.query.project_id;
    const assignedTo = req.query.assignedTo || req.query.assigned_to;
    const { status } = req.query;

    if (projectId) {
      const parsedProjectId = parseInt(projectId, 10);
      if (!isNaN(parsedProjectId)) {
        where.project_id = parsedProjectId;
      }
    }

    if (assignedTo) {
      const parsedAssignedTo = parseInt(assignedTo, 10);
      if (!isNaN(parsedAssignedTo)) {
        where.assigned_to = parsedAssignedTo;
      }
    }

    if (status && ALLOWED_STATUSES.includes(status)) {
      where.status = status;
    }

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz görev kimliği.',
        details: null
      });
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Görev bulunamadı.',
        details: null
      });
    }

    const { status, title, description } = req.body;
    const assignedTo = req.body.assignedTo !== undefined ? req.body.assignedTo : req.body.assigned_to;

    // Status update check
    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Geçersiz görev durumu. İzin verilen durumlar: ${ALLOWED_STATUSES.join(', ')}`,
          details: null
        });
      }
      task.status = status;
    }

    // Assignee update check
    if (assignedTo !== undefined) {
      if (assignedTo === null || assignedTo === '') {
        task.assigned_to = null;
      } else {
        const parsedAssignedTo = parseInt(assignedTo, 10);
        if (isNaN(parsedAssignedTo)) {
          return res.status(400).json({
            success: false,
            error: 'Geçersiz atanan kullanıcı kimliği.',
            details: null
          });
        }

        const assignee = await User.findByPk(parsedAssignedTo);
        if (!assignee) {
          return res.status(404).json({
            success: false,
            error: 'Atanan kullanıcı bulunamadı.',
            details: null
          });
        }
        task.assigned_to = parsedAssignedTo;
      }
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Görev başlığı boş olamaz.',
          details: null
        });
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description ? description.trim() : null;
    }

    await task.save();

    const updatedTask = await Task.findByPk(taskId, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    return res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};
