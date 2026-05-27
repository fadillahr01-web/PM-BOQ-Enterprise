const { prisma } = require('../config/db');

// MATERIAL
exports.listMaterials = async (req, res) => {
  try {
    const materials = await prisma.material.findMany();
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
};

exports.createMaterial = async (req, res) => {
  const { name, unit, unitPrice, merk } = req.body;
  const parsedUnitPrice = unitPrice !== undefined && unitPrice !== null && unitPrice !== ''
    ? parseFloat(unitPrice)
    : 0.0;

  try {
    const material = await prisma.material.create({
      data: {
        name,
        unit,
        unitPrice: Number.isNaN(parsedUnitPrice) ? 0.0 : parsedUnitPrice,
        merk: merk || null
      }
    });
    res.json(material);
  } catch (err) {
    console.error('Error creating material:', err);
    res.status(500).json({ error: 'Failed to create material' });
  }
};

exports.updateMaterial = async (req, res) => {
  const { id } = req.params;
  const { name, unit, unitPrice, merk } = req.body;
  const parsedUnitPrice = unitPrice !== undefined && unitPrice !== null && unitPrice !== ''
    ? parseFloat(unitPrice)
    : undefined;

  try {
    const material = await prisma.material.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(unit !== undefined && { unit }),
        ...(parsedUnitPrice !== undefined && !Number.isNaN(parsedUnitPrice) && { unitPrice: parsedUnitPrice }),
        ...(merk !== undefined && { merk: merk || null })
      }
    });
    res.json(material);
  } catch (err) {
    console.error('Error updating material:', err);
    res.status(500).json({ error: 'Failed to update material' });
  }
};

exports.deleteMaterial = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.material.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete material' });
  }
};

// SERVICE
exports.listServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

exports.createService = async (req, res) => {
  const { name, unit, unitPrice, merk } = req.body;
  const parsedUnitPrice = unitPrice !== undefined && unitPrice !== null && unitPrice !== ''
    ? parseFloat(unitPrice)
    : 0.0;

  try {
    const service = await prisma.service.create({
      data: {
        name,
        unit,
        unitPrice: Number.isNaN(parsedUnitPrice) ? 0.0 : parsedUnitPrice,
        merk: merk || null
      }
    });
    res.json(service);
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({ error: 'Failed to create service' });
  }
};

exports.updateService = async (req, res) => {
  const { id } = req.params;
  const { name, unit, unitPrice, merk } = req.body;
  const parsedUnitPrice = unitPrice !== undefined && unitPrice !== null && unitPrice !== ''
    ? parseFloat(unitPrice)
    : undefined;

  try {
    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(unit !== undefined && { unit }),
        ...(parsedUnitPrice !== undefined && !Number.isNaN(parsedUnitPrice) && { unitPrice: parsedUnitPrice }),
        ...(merk !== undefined && { merk: merk || null })
      }
    });
    res.json(service);
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({ error: 'Failed to update service' });
  }
};

exports.deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.service.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
};
