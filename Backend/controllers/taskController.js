const { prisma } = require('../config/db');
const fallbackStore = require('../utils/fallbackStore');

// Get all tasks, option to filter by project
async function getAllTasks(req, res) {
  const { projectId } = req.query;
  try {
    const where = projectId ? { projectId } : {};
    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        subTasks: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    res.json(tasks);
  } catch (error) {
    console.warn('[Database Offline] Falling back to memory tasks.');
    const filtered = fallbackStore.tasks
      .filter(t => !projectId || t.projectId === projectId)
      .map(t => {
        const assignee = fallbackStore.users.find(u => u.id === t.assigneeId);
        return {
          ...t,
          assignee: assignee ? { id: assignee.id, name: assignee.name, email: assignee.email, role: assignee.role } : null,
          subTasks: fallbackStore.subTasks ? fallbackStore.subTasks.filter(st => st.taskId === t.id) : []
        };
      });
    res.json(filtered);
  }
}

// Create a task
async function createTask(req, res) {
  const { projectId, name, description, startDate, endDate, status, priority, progress, assigneeId } = req.body;
  
  if (!projectId || !name || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required fields (projectId, name, startDate, endDate)' });
  }

  try {
    const task = await prisma.task.create({
      data: {
        projectId,
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || 'NOT_STARTED',
        priority: priority || 'MEDIUM',
        progress: parseFloat(progress) || 0.0,
        assigneeId: assigneeId || null
      },
      include: {
        assignee: true,
        subTasks: true
      }
    });
    res.status(201).json(task);
  } catch (error) {
    console.warn('[Database Offline] Creating task in memory.');
    const newTask = {
      id: `task-${Date.now()}`,
      projectId,
      name,
      description,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status: status || 'NOT_STARTED',
      priority: priority || 'MEDIUM',
      progress: parseFloat(progress) || 0.0,
      assigneeId: assigneeId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    fallbackStore.tasks.push(newTask);
    const assignee = fallbackStore.users.find(u => u.id === assigneeId);
    res.status(201).json({
      ...newTask,
      assignee: assignee ? { id: assignee.id, name: assignee.name, email: assignee.email, role: assignee.role } : null,
      subTasks: []
    });
  }
}

// Update task (e.g. status, progress, assignee, subtasks)
async function updateTask(req, res) {
  const { id } = req.params;
  const { name, description, startDate, endDate, status, priority, progress, assigneeId, subTasks } = req.body;

  try {
    // Basic task update
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (progress !== undefined) updateData.progress = parseFloat(progress);
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;

    // Handle subtasks if provided (e.g., toggle complete)
    if (subTasks && Array.isArray(subTasks)) {
      for (const st of subTasks) {
        if (st.id) {
          await prisma.subTask.update({
            where: { id: st.id },
            data: {
              name: st.name,
              isCompleted: st.isCompleted
            }
          });
        } else {
          await prisma.subTask.create({
            data: {
              taskId: id,
              name: st.name,
              isCompleted: st.isCompleted || false
            }
          });
        }
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        subTasks: true
      }
    });

    res.json(updatedTask);
  } catch (error) {
    console.warn('[Database Offline] Updating task in memory.');
    const idx = fallbackStore.tasks.findIndex(t => t.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const current = fallbackStore.tasks[idx];
    const updated = {
      ...current,
      name: name !== undefined ? name : current.name,
      description: description !== undefined ? description : current.description,
      startDate: startDate !== undefined ? new Date(startDate).toISOString() : current.startDate,
      endDate: endDate !== undefined ? new Date(endDate).toISOString() : current.endDate,
      status: status !== undefined ? status : current.status,
      priority: priority !== undefined ? priority : current.priority,
      progress: progress !== undefined ? parseFloat(progress) : current.progress,
      assigneeId: assigneeId !== undefined ? (assigneeId || null) : current.assigneeId,
      updatedAt: new Date().toISOString()
    };
    fallbackStore.tasks[idx] = updated;

    // Handle subtasks
    if (subTasks && Array.isArray(subTasks)) {
      if (!fallbackStore.subTasks) fallbackStore.subTasks = [];
      for (const st of subTasks) {
        if (st.id) {
          const sIdx = fallbackStore.subTasks.findIndex(item => item.id === st.id);
          if (sIdx !== -1) {
            fallbackStore.subTasks[sIdx] = {
              ...fallbackStore.subTasks[sIdx],
              name: st.name,
              isCompleted: st.isCompleted
            };
          }
        } else {
          fallbackStore.subTasks.push({
            id: `subtask-${Date.now()}-${Math.random()}`,
            taskId: id,
            name: st.name,
            isCompleted: st.isCompleted || false
          });
        }
      }
    }

    const assignee = fallbackStore.users.find(u => u.id === updated.assigneeId);
    const matchedSubTasks = fallbackStore.subTasks ? fallbackStore.subTasks.filter(st => st.taskId === id) : [];

    res.json({
      ...updated,
      assignee: assignee ? { id: assignee.id, name: assignee.name, email: assignee.email, role: assignee.role } : null,
      subTasks: matchedSubTasks
    });
  }
}

// Delete task
async function deleteTask(req, res) {
  const { id } = req.params;
  try {
    await prisma.task.delete({
      where: { id }
    });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.warn('[Database Offline] Deleting task from memory.');
    const idx = fallbackStore.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      fallbackStore.tasks.splice(idx, 1);
    }
    res.json({ message: 'Task deleted successfully' });
  }
}

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask
};
