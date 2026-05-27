const express = require('express');
const router = express.Router();
const milestoneController = require('../controllers/milestoneController');

router.get('/:projectId', milestoneController.getMilestones);
router.put('/:id', milestoneController.updateMilestone);

module.exports = router;
