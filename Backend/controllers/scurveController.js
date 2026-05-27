const { prisma } = require('../config/db');
const fallbackStore = require('../utils/fallbackStore');

// Helper to recalculate project actual progress based on BOQ items
async function calculateBoqActualProgress(projectId) {
  try {
    const categories = await prisma.boqCategory.findMany({
      where: { projectId },
      include: { items: true }
    });

    let totalBoqValue = 0;
    let completedBoqValue = 0;

    categories.forEach(cat => {
      cat.items.forEach(item => {
        const itemVal = parseFloat(item.totalPrice);
        totalBoqValue += itemVal;
        completedBoqValue += itemVal * ((item.progress || 0) / 100);
      });
    });

    if (totalBoqValue === 0) return 0;
    const progress = parseFloat(((completedBoqValue / totalBoqValue) * 100).toFixed(1));
    return progress;
  } catch (error) {
    // Fallback calculation in-memory
    const categories = fallbackStore.boqCategories.filter(c => c.projectId === projectId || c.projectId === 'p-pedpedia');
    let totalBoqValue = 0;
    let completedBoqValue = 0;

    categories.forEach(cat => {
      cat.items.forEach(item => {
        const itemVal = parseFloat(item.totalPrice);
        totalBoqValue += itemVal;
        completedBoqValue += itemVal * ((item.progress || 0) / 100);
      });
    });

    if (totalBoqValue === 0) return 0;
    return parseFloat(((completedBoqValue / totalBoqValue) * 100).toFixed(1));
  }
}

async function getScurve(req, res) {
  const { projectId } = req.params;
  try {
    const logs = await prisma.progressLog.findMany({
      where: { projectId },
      orderBy: { week: 'asc' }
    });
    return res.json(logs);
  } catch (error) {
    console.warn('[Database Offline] Falling back to memory progressLogs.');
    const filtered = fallbackStore.progressLogs.filter(pl => pl.projectId === projectId || pl.projectId === 'p-pedpedia');
    return res.json(filtered);
  }
}

async function saveWeeklyLog(req, res) {
  const { projectId } = req.params;
  const { week, plannedProgress, actualProgress } = req.body;

  try {
    // Upsert week log
    const log = await prisma.progressLog.upsert({
      where: {
        projectId_week: {
          projectId,
          week: parseInt(week)
        }
      },
      update: {
        plannedProgress: parseFloat(plannedProgress),
        actualProgress: parseFloat(actualProgress)
      },
      create: {
        projectId,
        week: parseInt(week),
        plannedProgress: parseFloat(plannedProgress),
        actualProgress: parseFloat(actualProgress)
      }
    });

    // Also update project's current progress based on the latest week
    // We get the maximum week that has actualProgress > 0
    const latestLogs = await prisma.progressLog.findMany({
      where: { projectId, actualProgress: { gt: 0 } },
      orderBy: { week: 'desc' },
      take: 1
    });

    if (latestLogs.length > 0) {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          plannedProgress: latestLogs[0].plannedProgress,
          actualProgress: latestLogs[0].actualProgress
        }
      });
    }

    return res.json(log);
  } catch (error) {
    console.warn('[Database Offline] Saving weekly log in-memory.');
    
    let logIdx = fallbackStore.progressLogs.findIndex(pl => pl.projectId === projectId && pl.week === parseInt(week));
    if (logIdx === -1) {
      const newLog = {
        id: `pl-${Date.now()}`,
        projectId,
        week: parseInt(week),
        plannedProgress: parseFloat(plannedProgress),
        actualProgress: parseFloat(actualProgress),
        logDate: new Date().toISOString()
      };
      fallbackStore.progressLogs.push(newLog);
    } else {
      fallbackStore.progressLogs[logIdx] = {
        ...fallbackStore.progressLogs[logIdx],
        plannedProgress: parseFloat(plannedProgress),
        actualProgress: parseFloat(actualProgress)
      };
    }

    // Sort by week
    fallbackStore.progressLogs.sort((a, b) => a.week - b.week);

    // Update in-memory project progress
    const activeProj = fallbackStore.projects.find(p => p.id === projectId || p.id === 'p-pedpedia');
    if (activeProj) {
      // Find latest week with actualProgress > 0
      const activeLogs = fallbackStore.progressLogs.filter(pl => pl.projectId === projectId && pl.actualProgress > 0);
      if (activeLogs.length > 0) {
        const latest = activeLogs[activeLogs.length - 1];
        activeProj.plannedProgress = latest.plannedProgress;
        activeProj.actualProgress = latest.actualProgress;
      }
    }

    return res.json({ success: true, week, plannedProgress, actualProgress });
  }
}

module.exports = {
  getScurve,
  saveWeeklyLog,
  calculateBoqActualProgress
};
