const { prisma } = require('../config/db');
const fallbackStore = require('../utils/fallbackStore');

// Get all projects
async function getAllProjects(req, res) {
  try {
    const projects = await prisma.project.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });
    res.json(projects);
  } catch (error) {
    console.warn('[Database Offline] Falling back to memory projects.');
    const mapped = fallbackStore.projects.map(p => {
      const members = fallbackStore.projectMembers
        .filter(pm => pm.projectId === p.id)
        .map(pm => {
          const user = fallbackStore.users.find(u => u.id === pm.userId);
          return {
            id: pm.id,
            projectId: pm.projectId,
            userId: pm.userId,
            user: user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null
          };
        });
      return { ...p, members };
    });
    res.json(mapped);
  }
}

// Get project by ID
async function getProjectById(req, res) {
  const { id } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true
              }
            },
            subTasks: true
          }
        },
        boqCategories: {
          include: {
            items: true
          }
        },
        documents: true
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.warn('[Database Offline] Falling back to memory project details.');
    const project = fallbackStore.projects.find(p => p.id === id || p.id === 'p-pedpedia');
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const members = fallbackStore.projectMembers
      .filter(pm => pm.projectId === project.id)
      .map(pm => {
        const user = fallbackStore.users.find(u => u.id === pm.userId);
        return {
          id: pm.id,
          projectId: pm.projectId,
          userId: pm.userId,
          user: user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null
        };
      });

    const tasks = fallbackStore.tasks
      .filter(t => t.projectId === project.id)
      .map(t => {
        const assignee = fallbackStore.users.find(u => u.id === t.assigneeId);
        return {
          ...t,
          assignee: assignee ? { id: assignee.id, name: assignee.name } : null
        };
      });

    const boqCategories = fallbackStore.boqCategories
      .filter(c => c.projectId === project.id)
      .map(c => ({
        ...c,
        items: c.items.filter(item => item.categoryId === c.id)
      }));

    const documents = fallbackStore.documents ? fallbackStore.documents.filter(d => d.projectId === project.id) : [];

    res.json({
      ...project,
      members,
      tasks,
      boqCategories,
      documents
    });
  }
}

// Create a new project
async function createProject(req, res) {
  const { name, clientName, location, budget, actualCost, startDate, endDate, plannedProgress, actualProgress, status, description } = req.body;

  if (!name || !clientName || !location || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required project fields' });
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        clientName,
        location,
        budget: budget !== undefined ? String(budget) : '0',
        actualCost: actualCost !== undefined ? String(actualCost) : '0',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        plannedProgress: plannedProgress ?? 0,
        actualProgress: actualProgress ?? 0,
        status: status || 'BOQ',
        description: description || ''
      }
    });

    return res.status(201).json(project);
  } catch (error) {
    console.error('Failed to create project in DB, falling back to memory:', error.message);
    
    // Fallback: save to in-memory store
    try {
      const newProject = {
        id: 'p-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        name,
        clientName,
        location,
        budget: budget || 0,
        actualCost: actualCost || 0,
        startDate: startDate || new Date().toISOString(),
        endDate: endDate || new Date().toISOString(),
        plannedProgress: plannedProgress ?? 0,
        actualProgress: actualProgress ?? 0,
        status: status || 'BOQ',
        description: description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      fallbackStore.projects.push(newProject);
      return res.status(201).json({ ...newProject, fallback: true });
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError.message);
      const payload = { error: 'Cannot create project' };
      if (process.env.NODE_ENV !== 'production' && error instanceof Error) {
        payload.detail = error.message;
      }
      return res.status(500).json(payload);
    }
  }
}

async function updateProject(req, res) {
  const { id } = req.params;
  const { name, clientName, location, budget, actualCost, status, startDate, endDate } = req.body;

  try {
    const updated = await prisma.project.update({
      where: { id },
      data: {
        name,
        clientName,
        location,
        budget: budget !== undefined ? String(budget) : undefined,
        actualCost: actualCost !== undefined ? String(actualCost) : undefined,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });
    return res.json(updated);
  } catch (error) {
    console.warn('[Database Offline] Updating memory project.');
    const idx = fallbackStore.projects.findIndex(p => p.id === id || p.id === 'p-pedpedia');
    if (idx === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    fallbackStore.projects[idx] = {
      ...fallbackStore.projects[idx],
      name: name !== undefined ? name : fallbackStore.projects[idx].name,
      clientName: clientName !== undefined ? clientName : fallbackStore.projects[idx].clientName,
      location: location !== undefined ? location : fallbackStore.projects[idx].location,
      budget: budget !== undefined ? budget : fallbackStore.projects[idx].budget,
      actualCost: actualCost !== undefined ? actualCost : fallbackStore.projects[idx].actualCost,
      status: status !== undefined ? status : fallbackStore.projects[idx].status,
      startDate: startDate !== undefined ? startDate : fallbackStore.projects[idx].startDate,
      endDate: endDate !== undefined ? endDate : fallbackStore.projects[idx].endDate,
      updatedAt: new Date().toISOString()
    };

    const project = fallbackStore.projects[idx];
    const members = fallbackStore.projectMembers
      .filter(pm => pm.projectId === project.id)
      .map(pm => {
        const user = fallbackStore.users.find(u => u.id === pm.userId);
        return {
          id: pm.id,
          projectId: pm.projectId,
          userId: pm.userId,
          user: user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null
        };
      });

    return res.json({
      ...project,
      members
    });
  }
}

async function deleteProject(req, res) {
  const { id } = req.params;
  try {
    await prisma.project.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    console.warn('[Database Offline] Deleting memory project.');
    const idx = fallbackStore.projects.findIndex(p => p.id === id || p.id === 'p-pedpedia');
    if (idx !== -1) {
      fallbackStore.projects.splice(idx, 1);
    }
    return res.json({ success: true, fallback: true });
  }
}

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
