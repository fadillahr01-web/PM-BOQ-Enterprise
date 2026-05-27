const express = require('express');
const router = express.Router();
const boqController = require('../controllers/boqController');

// Existing routes for BoqCategory
router.get('/components', boqController.getBoqComponents);
router.get('/:projectId', boqController.getProjectBoq);
router.post('/:projectId', boqController.saveProjectBoq);
router.put('/:projectId', boqController.saveProjectBoq);
router.get('/:projectId/export', boqController.exportProjectBoq);

// New routes for BOQ Model
router.get('/list/all', boqController.getAllBOQs);
router.get('/by-project/:projectId', boqController.getBOQsByProjectId);
router.get('/details/:id', boqController.getBOQById);
router.post('/create', boqController.createBOQ);
router.put('/update/:id', boqController.updateBOQ);
router.delete('/delete/:id', boqController.deleteBOQ);
router.get('/export/project/:projectId', boqController.exportBOQToExcel);

module.exports = router;

