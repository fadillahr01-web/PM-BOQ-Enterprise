const express = require('express');
const router = express.Router();
const scurveController = require('../controllers/scurveController');

router.get('/:projectId', scurveController.getScurve);
router.post('/:projectId', scurveController.saveWeeklyLog);

module.exports = router;
