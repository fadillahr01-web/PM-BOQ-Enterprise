const { prisma } = require('../config/db');
const { exportBoqToExcel } = require('../utils/boqExporter');
const fallbackStore = require('../utils/fallbackStore');
const { calculateBoqActualProgress } = require('./scurveController');

async function getProjectBoq(req, res) {
  const { projectId } = req.params;
  try {
    const categories = await prisma.boqCategory.findMany({
      where: { projectId },
      include: { items: { orderBy: { id: 'asc' } } }
    });
    return res.json(categories);
  } catch (error) {
    console.warn('[Database Offline] Falling back to memory BOQ data.');
    const filtered = fallbackStore.boqCategories.filter(c => c.projectId === projectId || c.projectId === 'p-pedpedia');
    return res.json(filtered);
  }
}

async function saveProjectBoq(req, res) {
  const { projectId } = req.params;
  const { categories } = req.body;

  if (!categories || !Array.isArray(categories)) {
    return res.status(400).json({ error: 'Invalid categories payload' });
  }

  try {
    // DB transactional update
    await prisma.$transaction(async (tx) => {
      // 1. Get existing categories
      const existingCats = await tx.boqCategory.findMany({
        where: { projectId },
        include: { items: true }
      });

      const payloadCatIds = categories.filter(c => c.id).map(c => c.id);
      
      // Delete removed categories
      for (const exCat of existingCats) {
        if (!payloadCatIds.includes(exCat.id)) {
          await tx.boqCategory.delete({ where: { id: exCat.id } });
        }
      }

      // Upsert categories & items
      for (const cat of categories) {
        let catId = cat.id;

        if (catId) {
          // Update category
          await tx.boqCategory.update({
            where: { id: catId },
            data: { name: cat.name }
          });

          // Handle items
          const existingItems = existingCats.find(c => c.id === catId)?.items || [];
          const payloadItemIds = cat.items.filter(i => i.id).map(i => i.id);

          // Delete removed items
          for (const exItem of existingItems) {
            if (!payloadItemIds.includes(exItem.id)) {
              await tx.boqItem.delete({ where: { id: exItem.id } });
            }
          }

          // Create / update items
          for (const item of cat.items) {
            const totalPrice = parseFloat(item.volume) * parseFloat(item.unitPrice);
            if (item.id) {
              await tx.boqItem.update({
                where: { id: item.id },
                data: {
                  description: item.description,
                  volume: parseFloat(item.volume),
                  unit: item.unit,
                  unitPrice: parseFloat(item.unitPrice),
                  totalPrice: totalPrice,
                  progress: parseFloat(item.progress || 0),
                  type: item.type || 'PERANGKAT',
                  remarks: item.remarks
                }
              });
            } else {
              await tx.boqItem.create({
                data: {
                  categoryId: catId,
                  description: item.description,
                  volume: parseFloat(item.volume),
                  unit: item.unit,
                  unitPrice: parseFloat(item.unitPrice),
                  totalPrice: totalPrice,
                  progress: parseFloat(item.progress || 0),
                  type: item.type || 'PERANGKAT',
                  remarks: item.remarks
                }
              });
            }
          }

        } else {
          // Create new category & items
          const createdCat = await tx.boqCategory.create({
            data: {
              projectId,
              name: cat.name
            }
          });

          for (const item of cat.items) {
            const totalPrice = parseFloat(item.volume) * parseFloat(item.unitPrice);
            await tx.boqItem.create({
              data: {
                categoryId: createdCat.id,
                description: item.description,
                volume: parseFloat(item.volume),
                unit: item.unit,
                unitPrice: parseFloat(item.unitPrice),
                totalPrice: totalPrice,
                progress: parseFloat(item.progress || 0),
                type: item.type || 'PERANGKAT',
                remarks: item.remarks
              }
            });
          }
        }
      }
    });

    // 2. Recalculate Actual Progress
    const actualProgressVal = await calculateBoqActualProgress(projectId);

    // 3. Update project actual progress
    await prisma.project.update({
      where: { id: projectId },
      data: { actualProgress: actualProgressVal }
    });

    // 4. Update the latest week's progress log as well
    const latestLogs = await prisma.progressLog.findMany({
      where: { projectId },
      orderBy: { week: 'desc' },
      take: 1
    });
    if (latestLogs.length > 0) {
      await prisma.progressLog.update({
        where: { id: latestLogs[0].id },
        data: { actualProgress: actualProgressVal }
      });
    }

    return res.json({ success: true, actualProgress: actualProgressVal });

  } catch (error) {
    console.warn('[Database Offline] Saving BOQ data in-memory fallback.');
    
    // In-memory fallback CRUD
    const filteredCats = [];

    categories.forEach(cat => {
      let catId = cat.id || `cat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const items = (cat.items || []).map(item => {
        const itemId = item.id || `bi-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const totalPrice = parseFloat(item.volume) * parseFloat(item.unitPrice);
        return {
          id: itemId,
          categoryId: catId,
          description: item.description,
          volume: parseFloat(item.volume),
          unit: item.unit,
          unitPrice: parseFloat(item.unitPrice),
          totalPrice: totalPrice,
          progress: parseFloat(item.progress || 0),
          type: item.type || 'PERANGKAT',
          remarks: item.remarks || ""
        };
      });

      filteredCats.push({
        id: catId,
        projectId,
        name: cat.name,
        items
      });
    });

    // Replace the memory cache
    // Remove existing for this project
    const others = fallbackStore.boqCategories.filter(c => c.projectId !== projectId && c.projectId !== 'p-pedpedia');
    fallbackStore.boqCategories.length = 0;
    fallbackStore.boqCategories.push(...others, ...filteredCats);

    // Calculate progress
    const actualProgressVal = await calculateBoqActualProgress(projectId);
    
    // Update memory project
    const activeProj = fallbackStore.projects.find(p => p.id === projectId || p.id === 'p-pedpedia');
    if (activeProj) {
      activeProj.actualProgress = actualProgressVal;
    }

    // Update weekly progress logs in memory
    const activeLogs = fallbackStore.progressLogs.filter(pl => pl.projectId === projectId || pl.projectId === 'p-pedpedia');
    if (activeLogs.length > 0) {
      // Find latest week and update actual progress
      const latest = activeLogs[activeLogs.length - 1];
      latest.actualProgress = actualProgressVal;
    }

    return res.json({ success: true, actualProgress: actualProgressVal, demoMode: true });
  }
}

async function getBoqComponents(req, res) {
  try {
    const materials = await prisma.material.findMany();
    const services = await prisma.service.findMany();
    return res.json({ materials, services });
  } catch (error) {
    console.warn('[Database Offline] Falling back to in-memory BOQ component data.');
    return res.json({
      materials: fallbackStore.materials || [],
      services: fallbackStore.services || []
    });
  }
}

async function exportProjectBoq(req, res) {
  const { projectId } = req.params;
  let project;
  let boqCats;

  try {
    // 1. Fetch project data from DB
    project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      // Fallback check
      project = fallbackStore.projects.find(p => p.id === projectId || p.id === 'p-pedpedia');
    }

    // 2. Fetch BOQ categories and items from DB
    boqCats = await prisma.boqCategory.findMany({
      where: { projectId },
      include: { items: true }
    });
  } catch (error) {
    console.warn('[Database Offline] Exporting using memory fallback data.');
    project = fallbackStore.projects.find(p => p.id === projectId || p.id === 'p-pedpedia');
    boqCats = fallbackStore.boqCategories.filter(c => c.projectId === projectId || c.projectId === 'p-pedpedia');
  }

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  try {
    // 3. Call ExcelJS exporter
    const workbook = await exportBoqToExcel(project, boqCats);

    // 4. Send the file back to client
    const filename = `BOQ_${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting BOQ:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  getProjectBoq,
  saveProjectBoq,
  getBoqComponents,
  exportProjectBoq,
  // New BOQ Model Functions
  getAllBOQs,
  getBOQById,
  getBOQsByProjectId,
  createBOQ,
  updateBOQ,
  deleteBOQ,
  exportBOQToExcel
};

// ==================== NEW BOQ MODEL FUNCTIONS ====================

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Get all BOQs
async function getAllBOQs(req, res) {
  try {
    const boqs = await prisma.boq.findMany({
      include: {
        items: true,
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    res.json(boqs);
  } catch (error) {
    console.error('Error fetching BOQs:', error);
    res.status(500).json({ error: 'Error fetching BOQs' });
  }
}

// Get BOQ by ID
async function getBOQById(req, res) {
  const { id } = req.params;
  try {
    const boq = await prisma.boq.findUnique({
      where: { id },
      include: {
        items: true,
        project: true
      }
    });

    if (!boq) {
      return res.status(404).json({ error: 'BOQ not found' });
    }

    res.json(boq);
  } catch (error) {
    console.error('Error fetching BOQ:', error);
    res.status(500).json({ error: 'Error fetching BOQ' });
  }
}

// Get BOQs by Project ID
async function getBOQsByProjectId(req, res) {
  const { projectId } = req.params;
  try {
    const boqs = await prisma.boq.findMany({
      where: { projectId },
      include: {
        items: true
      }
    });

    res.json(boqs);
  } catch (error) {
    console.error('Error fetching BOQs:', error);
    res.status(500).json({ error: 'Error fetching BOQs' });
  }
}

// Create new BOQ
async function createBOQ(req, res) {
  const {
    projectId,
    namaBoq,
    keterangan,
    items
  } = req.body;

  if (!projectId || !namaBoq || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'Missing required fields: projectId, namaBoq, items (non-empty array)'
    });
  }

  try {
    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Calculate total harga
    let totalHarga = 0;
    const processedItems = items.map(item => {
      const total = parseFloat(item.volume) * parseFloat(item.hargaSatuan);
      totalHarga += total;
      return {
        masterKomponenId: item.masterKomponenId,
        volume: parseFloat(item.volume),
        hargaSatuan: parseFloat(item.hargaSatuan),
        totalHarga: total,
        keterangan: item.keterangan || ''
      };
    });

    const newBOQ = await prisma.boq.create({
      data: {
        projectId,
        namaBoq,
        keterangan: keterangan || '',
        status: 'DRAFT',
        totalHarga,
        items: {
          createMany: {
            data: processedItems
          }
        }
      },
      include: {
        items: true,
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'BOQ created successfully',
      data: newBOQ
    });
  } catch (error) {
    console.error('Error creating BOQ:', error);
    res.status(500).json({ error: 'Error creating BOQ', details: error.message });
  }
}

// Update BOQ
async function updateBOQ(req, res) {
  const { id } = req.params;
  const { namaBoq, keterangan, status, items } = req.body;

  try {
    const boq = await prisma.boq.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!boq) {
      return res.status(404).json({ error: 'BOQ not found' });
    }

    // If items are provided, recalculate total
    let totalHarga = boq.totalHarga;
    if (items && Array.isArray(items)) {
      // Delete old items
      await prisma.boqItemDetail.deleteMany({
        where: { boqId: id }
      });

      // Create new items
      totalHarga = 0;
      const processedItems = items.map(item => {
        const total = parseFloat(item.volume) * parseFloat(item.hargaSatuan);
        totalHarga += total;
        return {
          masterKomponenId: item.masterKomponenId,
          volume: parseFloat(item.volume),
          hargaSatuan: parseFloat(item.hargaSatuan),
          totalHarga: total,
          keterangan: item.keterangan || ''
        };
      });

      await prisma.boqItemDetail.createMany({
        data: processedItems.map(item => ({
          boqId: id,
          ...item
        }))
      });
    }

    const updatedBOQ = await prisma.boq.update({
      where: { id },
      data: {
        ...(namaBoq && { namaBoq }),
        ...(keterangan !== undefined && { keterangan }),
        ...(status && { status }),
        ...(items && { totalHarga })
      },
      include: {
        items: true,
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      message: 'BOQ updated successfully',
      data: updatedBOQ
    });
  } catch (error) {
    console.error('Error updating BOQ:', error);
    res.status(500).json({ error: 'Error updating BOQ', details: error.message });
  }
}

// Delete BOQ
async function deleteBOQ(req, res) {
  const { id } = req.params;

  try {
    await prisma.boq.delete({
      where: { id }
    });

    res.json({ message: 'BOQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting BOQ:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'BOQ not found' });
    }
    res.status(500).json({ error: 'Error deleting BOQ', details: error.message });
  }
}

// Export BOQ to Excel
async function exportBOQToExcel(req, res) {
  const { projectId } = req.params;

  try {
    // Get project and BOQs
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const boqs = await prisma.boq.findMany({
      where: { projectId },
      include: {
        items: true
      }
    });

    if (boqs.length === 0) {
      return res.status(404).json({ error: 'No BOQ found for this project' });
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();

    // Create a sheet for each BOQ
    for (const boq of boqs) {
      const worksheet = workbook.addWorksheet(boq.namaBoq.substring(0, 31)); // Sheet name max 31 chars

      // Set column widths
      worksheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Komponen', key: 'komponen', width: 30 },
        { header: 'Satuan', key: 'satuan', width: 10 },
        { header: 'Volume', key: 'volume', width: 12 },
        { header: 'Harga Satuan', key: 'hargaSatuan', width: 15 },
        { header: 'Total Harga', key: 'totalHarga', width: 15 }
      ];

      // Add project info
      let rowNum = 1;
      worksheet.mergeCells(`A${rowNum}:F${rowNum}`);
      const titleCell = worksheet.getCell(`A${rowNum}`);
      titleCell.value = `BOQ: ${boq.namaBoq}`;
      titleCell.font = { bold: true, size: 12 };
      rowNum++;

      worksheet.mergeCells(`A${rowNum}:F${rowNum}`);
      const projectCell = worksheet.getCell(`A${rowNum}`);
      projectCell.value = `Proyek: ${project.name} | Klien: ${project.clientName}`;
      projectCell.font = { bold: true, size: 11 };
      rowNum++;

      if (boq.keterangan) {
        worksheet.mergeCells(`A${rowNum}:F${rowNum}`);
        const ketCell = worksheet.getCell(`A${rowNum}`);
        ketCell.value = `Keterangan: ${boq.keterangan}`;
        rowNum++;
      }

      rowNum++; // Empty row

      // Add column headers
      const colHeaderRow = rowNum;
      const colHeader = worksheet.getRow(colHeaderRow);
      colHeader.values = [
        'No',
        'Komponen',
        'Satuan',
        'Volume',
        'Harga Satuan',
        'Total Harga'
      ];
      colHeader.font = { bold: true };
      colHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE7E6E6' }
      };
      colHeader.alignment = { horizontal: 'center', vertical: 'center' };
      rowNum++;

      // Add items
      let totalGrand = 0;
      let itemNo = 1;
      for (const item of boq.items) {
        // Get komponen name from master
        let komponenName = item.masterKomponenId;
        let satuan = '';
        try {
          const komponen = await prisma.masterKomponen.findUnique({
            where: { id: item.masterKomponenId }
          });
          if (komponen) {
            komponenName = komponen.namaKomponen;
            satuan = komponen.satuan;
          }
        } catch (e) {
          // Continue if komponen not found
        }

        const row = worksheet.getRow(rowNum);
        row.values = [
          itemNo,
          komponenName,
          satuan,
          item.volume,
          item.hargaSatuan,
          item.totalHarga
        ];

        // Format numbers
        row.getCell('D').numFmt = '#,##0.00';
        row.getCell('E').numFmt = '#,##0.00';
        row.getCell('F').numFmt = '#,##0.00';
        row.alignment = { horizontal: 'right', vertical: 'center' };

        totalGrand += parseFloat(item.totalHarga);
        rowNum++;
        itemNo++;
      }

      // Add total row
      rowNum++;
      const totalRow = worksheet.getRow(rowNum);
      totalRow.getCell('A').value = 'TOTAL';
      totalRow.getCell('A').font = { bold: true };
      totalRow.getCell('F').value = totalGrand;
      totalRow.getCell('F').font = { bold: true };
      totalRow.getCell('F').numFmt = '#,##0.00';
      totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' }
      };

      // Freeze panes
      worksheet.views = [
        { state: 'frozen', ySplit: colHeaderRow }
      ];
    }

    // Generate file name
    const fileName = `BOQ_${project.name.replace(/\s+/g, '_')}_${Date.now()}.xlsx`;

    // Stream directly to response (serverless compatible - no disk write)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting BOQ:', error);
    res.status(500).json({ error: 'Error exporting BOQ', details: error.message });
  }
}
