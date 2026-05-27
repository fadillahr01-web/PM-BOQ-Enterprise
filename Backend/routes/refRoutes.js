const express = require('express');
const router = express.Router();
const refController = require('../controllers/refController');

// Material routes
router.get('/materials', refController.listMaterials);
router.post('/materials', refController.createMaterial);
router.put('/materials/:id', refController.updateMaterial);
router.delete('/materials/:id', refController.deleteMaterial);

// Service routes
router.get('/services', refController.listServices);
router.post('/services', refController.createService);
router.put('/services/:id', refController.updateService);
router.delete('/services/:id', refController.deleteService);

module.exports = router;
