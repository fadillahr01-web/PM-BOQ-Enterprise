const { prisma } = require('../config/db');
const fallbackStore = require('../utils/fallbackStore');

async function getMilestones(req, res) {
  const { projectId } = req.params;
  try {
    const milestones = await prisma.projectMilestone.findMany({
      where: { projectId },
      orderBy: { stage: 'asc' },
      include: { pic: true }
    });
    return res.json(milestones);
  } catch (error) {
    console.warn('[Database Offline] Falling back to memory milestones.');
    const filtered = fallbackStore.milestones.filter(m => m.projectId === projectId || m.projectId === 'p-pedpedia');
    // Map with PIC information from fallback
    const mapped = filtered.map(m => {
      const picUser = fallbackStore.users.find(u => u.id === m.picId);
      return { ...m, pic: picUser ? { id: picUser.id, name: picUser.name } : null };
    });
    return res.json(mapped);
  }
}

async function updateMilestone(req, res) {
  const { id } = req.params;
  const { status, picId, metadata } = req.body;

  try {
    const updated = await prisma.projectMilestone.update({
      where: { id },
      data: {
        status,
        picId,
        metadata: metadata ? JSON.stringify(metadata) : undefined
      },
      include: { pic: true }
    });
    return res.json(updated);
  } catch (error) {
    console.warn('[Database Offline] Updating memory milestone.');
    const idx = fallbackStore.milestones.findIndex(m => m.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    fallbackStore.milestones[idx] = {
      ...fallbackStore.milestones[idx],
      status: status !== undefined ? status : fallbackStore.milestones[idx].status,
      picId: picId !== undefined ? picId : fallbackStore.milestones[idx].picId,
      metadata: metadata !== undefined ? metadata : fallbackStore.milestones[idx].metadata,
      updatedAt: new Date().toISOString()
    };

    const updated = fallbackStore.milestones[idx];
    const picUser = fallbackStore.users.find(u => u.id === updated.picId);
    
    return res.json({
      ...updated,
      pic: picUser ? { id: picUser.id, name: picUser.name } : null
    });
  }
}

module.exports = {
  getMilestones,
  updateMilestone
};
