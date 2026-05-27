const express = require('express');
const router = express.Router();
const masterKomponenController = require('../controllers/masterKomponenController');

// Get all master komponen
router.get('/', masterKomponenController.getAllMasterKomponen);

// Get master komponen by ID
router.get('/:id', masterKomponenController.getMasterKomponenById);

// Get master komponen by kode
router.get('/kode/:kode', masterKomponenController.getMasterKomponenByKode);

// Create new master komponen
router.post('/', masterKomponenController.createMasterKomponen);

// Bulk create master komponen
router.post('/bulk/create', masterKomponenController.bulkCreateMasterKomponen);

// Update master komponen
router.put('/:id', masterKomponenController.updateMasterKomponen);

// Delete master komponen
router.delete('/:id', masterKomponenController.deleteMasterKomponen);

module.exports = router;
