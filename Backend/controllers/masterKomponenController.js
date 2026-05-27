const { prisma } = require('../config/db');

// Get all master komponen
async function getAllMasterKomponen(req, res) {
  try {
    const masterKomponen = await prisma.masterKomponen.findMany({
      orderBy: { kode: 'asc' }
    });
    res.json(masterKomponen);
  } catch (error) {
    console.error('Error fetching master komponen:', error);
    res.status(500).json({ error: 'Error fetching master komponen' });
  }
}

// Get master komponen by ID
async function getMasterKomponenById(req, res) {
  const { id } = req.params;
  try {
    const masterKomponen = await prisma.masterKomponen.findUnique({
      where: { id }
    });

    if (!masterKomponen) {
      return res.status(404).json({ error: 'Master komponen not found' });
    }

    res.json(masterKomponen);
  } catch (error) {
    console.error('Error fetching master komponen:', error);
    res.status(500).json({ error: 'Error fetching master komponen' });
  }
}

// Get master komponen by kode
async function getMasterKomponenByKode(req, res) {
  const { kode } = req.params;
  try {
    const masterKomponen = await prisma.masterKomponen.findUnique({
      where: { kode }
    });

    if (!masterKomponen) {
      return res.status(404).json({ error: 'Master komponen not found' });
    }

    res.json(masterKomponen);
  } catch (error) {
    console.error('Error fetching master komponen:', error);
    res.status(500).json({ error: 'Error fetching master komponen' });
  }
}

// Create new master komponen
async function createMasterKomponen(req, res) {
  const {
    kode,
    namaKomponen,
    satuan,
    hargaSatuan,
    tipe
  } = req.body;

  if (!kode || !namaKomponen || !satuan || !hargaSatuan) {
    return res.status(400).json({
      error: 'Missing required fields: kode, namaKomponen, satuan, hargaSatuan'
    });
  }

  try {
    // Check if kode already exists
    const existing = await prisma.masterKomponen.findUnique({
      where: { kode }
    });

    if (existing) {
      return res.status(400).json({
        error: 'Kode already exists'
      });
    }

    const newKomponen = await prisma.masterKomponen.create({
      data: {
        kode,
        namaKomponen,
        satuan,
        hargaSatuan: parseFloat(hargaSatuan),
        tipe: tipe || 'PERANGKAT'
      }
    });

    res.status(201).json({
      message: 'Master komponen created successfully',
      data: newKomponen
    });
  } catch (error) {
    console.error('Error creating master komponen:', error);
    res.status(500).json({ error: 'Error creating master komponen', details: error.message });
  }
}

// Update master komponen
async function updateMasterKomponen(req, res) {
  const { id } = req.params;
  const {
    kode,
    namaKomponen,
    satuan,
    hargaSatuan,
    tipe
  } = req.body;

  try {
    // If kode is being updated, check for uniqueness
    if (kode) {
      const existing = await prisma.masterKomponen.findUnique({
        where: { kode }
      });

      if (existing && existing.id !== id) {
        return res.status(400).json({
          error: 'Kode already exists'
        });
      }
    }

    const updatedKomponen = await prisma.masterKomponen.update({
      where: { id },
      data: {
        ...(kode && { kode }),
        ...(namaKomponen && { namaKomponen }),
        ...(satuan && { satuan }),
        ...(hargaSatuan && { hargaSatuan: parseFloat(hargaSatuan) }),
        ...(tipe && { tipe })
      }
    });

    res.json({
      message: 'Master komponen updated successfully',
      data: updatedKomponen
    });
  } catch (error) {
    console.error('Error updating master komponen:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Master komponen not found' });
    }
    res.status(500).json({ error: 'Error updating master komponen', details: error.message });
  }
}

// Delete master komponen
async function deleteMasterKomponen(req, res) {
  const { id } = req.params;

  try {
    await prisma.masterKomponen.delete({
      where: { id }
    });

    res.json({ message: 'Master komponen deleted successfully' });
  } catch (error) {
    console.error('Error deleting master komponen:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Master komponen not found' });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Cannot delete: master komponen is being used in BOQ' });
    }
    res.status(500).json({ error: 'Error deleting master komponen', details: error.message });
  }
}

// Bulk create/import master komponen
async function bulkCreateMasterKomponen(req, res) {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'Items must be a non-empty array'
    });
  }

  try {
    const created = [];
    const failed = [];

    for (const item of items) {
      try {
        // Check if kode already exists
        const existing = await prisma.masterKomponen.findUnique({
          where: { kode: item.kode }
        });

        if (existing) {
          failed.push({
            kode: item.kode,
            reason: 'Kode already exists'
          });
          continue;
        }

        const newKomponen = await prisma.masterKomponen.create({
          data: {
            kode: item.kode,
            namaKomponen: item.namaKomponen,
            satuan: item.satuan,
            hargaSatuan: parseFloat(item.hargaSatuan),
            tipe: item.tipe || 'PERANGKAT'
          }
        });

        created.push(newKomponen);
      } catch (itemError) {
        failed.push({
          kode: item.kode,
          reason: itemError.message
        });
      }
    }

    res.status(201).json({
      message: `${created.length} master komponen created`,
      created,
      failed,
      summary: {
        total: items.length,
        success: created.length,
        failed: failed.length
      }
    });
  } catch (error) {
    console.error('Error bulk creating master komponen:', error);
    res.status(500).json({ error: 'Error bulk creating master komponen', details: error.message });
  }
}

module.exports = {
  getAllMasterKomponen,
  getMasterKomponenById,
  getMasterKomponenByKode,
  createMasterKomponen,
  updateMasterKomponen,
  deleteMasterKomponen,
  bulkCreateMasterKomponen
};
