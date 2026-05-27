const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing data
  await prisma.progressLog.deleteMany({});
  await prisma.projectMilestone.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.boqItem.deleteMany({});
  await prisma.boqCategory.deleteMany({});
  await prisma.bOQItemDetail.deleteMany({});
  await prisma.bOQ.deleteMany({});
  await prisma.masterKomponen.deleteMany({});
  await prisma.subTask.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Default Users (RBAC)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@project.com',
      name: 'Administrator',
      password: 'Admin123', // In a real app we would hash it, but here we store as-is for easy verification
      role: 'ADMIN',
    },
  });

  const pmUser = await prisma.user.create({
    data: {
      email: 'pm@project.com',
      name: 'Fadilah Riyadi',
      password: 'PM123',
      role: 'PROJECT_MANAGER',
    },
  });

  const clientUser = await prisma.user.create({
    data: {
      email: 'client@client.com',
      name: 'Client Viewer',
      password: 'Client123',
      role: 'CLIENT_VIEWER',
    },
  });

  const supervisorUser = await prisma.user.create({
    data: {
      email: 'siti@pmboq.com',
      name: 'Siti Rahma (Supervisor)',
      password: 'Supervisor123',
      role: 'SUPERVISOR',
    },
  });

  console.log('RBAC Users seeded successfully.');

  // 3. Create Project
  const project = await prisma.project.create({
    data: {
      name: 'Pembangunan Office Interior Toko Pedpedia',
      description: 'Pekerjaan interior kantor modern untuk cabang baru Toko Pedpedia.',
      clientName: 'Toko Pedpedia',
      location: 'Jakarta Selatan',
      budget: 1500000000.00, // 1.5 Billion IDR
      actualCost: 920000000.00,
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-08-15'),
      plannedProgress: 65.0,
      actualProgress: 58.5,
    },
  });

  console.log('Project created:', project.name);

  // 4. Create Project Members
  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, userId: adminUser.id },
      { projectId: project.id, userId: pmUser.id },
      { projectId: project.id, userId: clientUser.id },
      { projectId: project.id, userId: supervisorUser.id },
    ],
  });

  // 5. Create Tasks and Subtasks (for Kanban board)
  const task1 = await prisma.task.create({
    data: {
      projectId: project.id,
      name: 'Pemasangan Dinding Partisi GRC',
      description: 'Pemasangan dinding sekat untuk ruang direksi dan ruang meeting utama.',
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-05-25'),
      status: 'ON_PROGRESS',
      priority: 'HIGH',
      progress: 40.0,
      assigneeId: pmUser.id,
      subTasks: {
        create: [
          { name: 'Pengukuran & marking area', isCompleted: true },
          { name: 'Pemasangan rangka hollow galvalum', isCompleted: true },
          { name: 'Pemasangan papan GRC', isCompleted: false },
          { name: 'Compound & sanding sambungan', isCompleted: false },
        ]
      }
    }
  });

  const task2 = await prisma.task.create({
    data: {
      projectId: project.id,
      name: 'Instalasi Kabel Data & Elektrikal lantai 2',
      description: 'Penarikan kabel LAN Cat6 dan kabel power stop kontak area kubikal.',
      startDate: new Date('2026-05-10'),
      endDate: new Date('2026-05-30'),
      status: 'ON_PROGRESS',
      priority: 'CRITICAL',
      progress: 15.0,
      assigneeId: supervisorUser.id,
      subTasks: {
        create: [
          { name: 'Pemasangan tray kabel ceiling', isCompleted: true },
          { name: 'Penarikan kabel power & data', isCompleted: false },
        ]
      }
    }
  });

  const task3 = await prisma.task.create({
    data: {
      projectId: project.id,
      name: 'Pekerjaan Plafond Drop Ceiling',
      description: 'Pembuatan drop ceiling area lobby dan lampu indirect LED strip.',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-15'),
      status: 'NOT_STARTED',
      priority: 'MEDIUM',
      progress: 0.0,
      assigneeId: pmUser.id,
    }
  });

  const task4 = await prisma.task.create({
    data: {
      projectId: project.id,
      name: 'Fabrikasi Lemari & Credenza Custom',
      description: 'Pekerjaan workshop untuk pembuatan furniture loose cabinet dan pantry.',
      startDate: new Date('2026-04-15'),
      endDate: new Date('2026-05-15'),
      status: 'DONE',
      priority: 'HIGH',
      progress: 100.0,
      assigneeId: supervisorUser.id,
      subTasks: {
        create: [
          { name: 'Pemotongan multiplex 18mm', isCompleted: true },
          { name: 'Perakitan kabinet', isCompleted: true },
          { name: 'Finishing HPL luar & melamin dalam', isCompleted: true },
        ]
      }
    }
  });

  console.log('Tasks and subtasks seeded.');

  // 6. Create BOQ Categories and Items
  const cat1 = await prisma.boqCategory.create({
    data: {
      projectId: project.id,
      name: 'Pekerjaan Persiapan & Bongkaran',
    }
  });

  await prisma.boqItem.createMany({
    data: [
      {
        categoryId: cat1.id,
        type: 'JASA',
        description: 'Pembersihan lokasi proyek & proteksi area kerja',
        volume: 1.0,
        unit: 'lot',
        unitPrice: 15000000.00,
        totalPrice: 15000000.00,
        progress: 100.0,
        remarks: 'Proteksi lift & koridor gedung',
      },
      {
        categoryId: cat1.id,
        type: 'JASA',
        description: 'Bongkaran dinding partisi gypsum eksisting',
        volume: 120.0,
        unit: 'm2',
        unitPrice: 45000.00,
        totalPrice: 5400000.00,
        progress: 100.0,
        remarks: 'Termasuk pembuangan puing keluar gedung',
      }
    ]
  });

  const cat2 = await prisma.boqCategory.create({
    data: {
      projectId: project.id,
      name: 'Pekerjaan Dinding & Plafond',
    }
  });

  await prisma.boqItem.createMany({
    data: [
      {
        categoryId: cat2.id,
        type: 'PERANGKAT',
        description: 'Pemasangan partisi gypsum double-side (rangka metal)',
        volume: 340.0,
        unit: 'm2',
        unitPrice: 185000.00,
        totalPrice: 62900000.00,
        progress: 40.0,
      },
      {
        categoryId: cat2.id,
        type: 'PERANGKAT',
        description: 'Pemasangan plafond gypsum board 9mm flat',
        volume: 280.0,
        unit: 'm2',
        unitPrice: 95000.00,
        totalPrice: 26600000.00,
        progress: 0.0,
      }
    ]
  });

  console.log('BOQ Categories and Items seeded.');

  // 7. Create Project Milestones
  await prisma.projectMilestone.createMany({
    data: [
      {
        projectId: project.id,
        stage: 1,
        name: 'Tahap Inisiasi: Survey Lokasi',
        status: 'DONE',
        picId: pmUser.id,
        metadata: JSON.stringify({
          surveyDate: '2026-03-05',
          fieldPhotoUrl: '/uploads/milestones/survey_lokasi.jpg',
          notes: 'Kondisi lapangan kosong, siap dipasang rangka.'
        })
      },
      {
        projectId: project.id,
        stage: 2,
        name: 'Tahap Tender: Proses Tender',
        status: 'DONE',
        picId: pmUser.id,
        metadata: JSON.stringify({
          vendorName: 'PT Mandiri Jaya Konstruksi',
          bidValue: 1450000000,
          tenderDate: '2026-03-20'
        })
      },
      {
        projectId: project.id,
        stage: 3,
        name: 'Tahap Finansial & Legalitas: Pembuatan BOQ, SPK, PO',
        status: 'DONE',
        picId: adminUser.id,
        metadata: JSON.stringify({
          spkFileUrl: '/uploads/milestones/spk_final.pdf',
          poFileUrl: '/uploads/milestones/po_final.pdf',
          signingDate: '2026-04-01'
        })
      },
      {
        projectId: project.id,
        stage: 4,
        name: 'Tahap Eksekusi: Implementasi Project',
        status: 'ON_PROGRESS',
        picId: supervisorUser.id,
        metadata: JSON.stringify({
          dailyNotes: 'Pemasangan partisi gypsum sedang berlangsung, pengiriman material tahap 2 lancar.'
        })
      },
      {
        projectId: project.id,
        stage: 5,
        name: 'Tahap Serah Terima: BAUT & BAST',
        status: 'NOT_STARTED',
        picId: null,
        metadata: JSON.stringify({
          signatureDate: '',
          bautFileUrl: '',
          bastFileUrl: ''
        })
      }
    ]
  });

  console.log('Project Milestones seeded.');

  // 8. Create Progress Logs (S-Curve Trend lines)
  await prisma.progressLog.createMany({
    data: [
      {
        projectId: project.id,
        week: 1,
        plannedProgress: 10.0,
        actualProgress: 8.0,
        logDate: new Date('2026-03-07'),
      },
      {
        projectId: project.id,
        week: 2,
        plannedProgress: 25.0,
        actualProgress: 22.0,
        logDate: new Date('2026-03-14'),
      },
      {
        projectId: project.id,
        week: 3,
        plannedProgress: 45.0,
        actualProgress: 40.0,
        logDate: new Date('2026-03-21'),
      },
      {
        projectId: project.id,
        week: 4,
        plannedProgress: 65.0,
        actualProgress: 58.5,
        logDate: new Date('2026-03-28'),
      },
      {
        projectId: project.id,
        week: 5,
        plannedProgress: 80.0,
        actualProgress: 0.0, // Future planned only
        logDate: new Date('2026-04-04'),
      },
      {
        projectId: project.id,
        week: 6,
        plannedProgress: 100.0,
        actualProgress: 0.0, // Future planned only
        logDate: new Date('2026-04-11'),
      }
    ]
  });

  console.log('Progress Logs (S-Curve) seeded.');

  // 9. Create Master Komponen (Reusable BOQ Components)
  const masterKomponen = await prisma.masterKomponen.createMany({
    data: [
      {
        kode: 'PG-001',
        namaKomponen: 'Dinding Partisi Gypsum Double-Side Rangka Metal',
        satuan: 'm2',
        hargaSatuan: 185000.00,
        tipe: 'PERANGKAT'
      },
      {
        kode: 'PG-002',
        namaKomponen: 'Plafond Gypsum Board 9mm Flat',
        satuan: 'm2',
        hargaSatuan: 95000.00,
        tipe: 'PERANGKAT'
      },
      {
        kode: 'PG-003',
        namaKomponen: 'Bongkaran Dinding Partisi Eksisting',
        satuan: 'm2',
        hargaSatuan: 45000.00,
        tipe: 'JASA'
      },
      {
        kode: 'PG-004',
        namaKomponen: 'Finishing Cat Dinding (2 Lapis)',
        satuan: 'm2',
        hargaSatuan: 35000.00,
        tipe: 'JASA'
      },
      {
        kode: 'LM-001',
        namaKomponen: 'Lampu Downlight LED 7W Putih',
        satuan: 'unit',
        hargaSatuan: 125000.00,
        tipe: 'PERANGKAT'
      },
      {
        kode: 'LM-002',
        namaKomponen: 'Switch Listrik Standar Legrand',
        satuan: 'unit',
        hargaSatuan: 45000.00,
        tipe: 'PERANGKAT'
      },
      {
        kode: 'FM-001',
        namaKomponen: 'Pintu Aluminium Frame Kaca Tempered',
        satuan: 'm2',
        hargaSatuan: 750000.00,
        tipe: 'PERANGKAT'
      },
      {
        kode: 'FN-001',
        namaKomponen: 'Finishing Kayu Laminasi HPL',
        satuan: 'm2',
        hargaSatuan: 245000.00,
        tipe: 'JASA'
      },
      {
        kode: 'CL-001',
        namaKomponen: 'Pembersihan Lokasi & Proteksi Area',
        satuan: 'lot',
        hargaSatuan: 15000000.00,
        tipe: 'JASA'
      },
      {
        kode: 'AC-001',
        namaKomponen: 'AC Split 1.5 PK Standard Efficiency',
        satuan: 'unit',
        hargaSatuan: 3500000.00,
        tipe: 'PERANGKAT'
      }
    ]
  });

  console.log('Master Komponen seeded successfully.');

  // 10. Create Sample BOQ (Master BOQ Document)
  // First, get the master komponen IDs for reference
  const allMasterKomponen = await prisma.masterKomponen.findMany();
  const mkMap = {};
  allMasterKomponen.forEach(mk => {
    mkMap[mk.kode] = mk.id;
  });

  const sampleBOQ = await prisma.bOQ.create({
    data: {
      projectId: project.id,
      namaBoq: 'BOQ Pembangunan Office Interior - Phase 1',
      keterangan: 'BOQ detail untuk tahap persiapan dan pekerjaan partisi gypsum',
      status: 'FINALIZED',
      totalHarga: 0, // Will be calculated below
      items: {
        create: [
          {
            masterKomponenId: mkMap['CL-001'],
            volume: 1.0,
            hargaSatuan: 15000000.00,
            totalHarga: 15000000.00,
            keterangan: 'Termasuk proteksi lift dan koridor'
          },
          {
            masterKomponenId: mkMap['PG-003'],
            volume: 120.0,
            hargaSatuan: 45000.00,
            totalHarga: 5400000.00,
            keterangan: 'Bongkaran dinding eksisting'
          },
          {
            masterKomponenId: mkMap['PG-001'],
            volume: 340.0,
            hargaSatuan: 185000.00,
            totalHarga: 62900000.00,
            keterangan: 'Partisi gypsum ruang direksi & meeting'
          },
          {
            masterKomponenId: mkMap['PG-002'],
            volume: 280.0,
            hargaSatuan: 95000.00,
            totalHarga: 26600000.00,
            keterangan: 'Plafond gypsum untuk semua area'
          },
          {
            masterKomponenId: mkMap['LM-001'],
            volume: 45.0,
            hargaSatuan: 125000.00,
            totalHarga: 5625000.00,
            keterangan: 'Lampu downlight untuk ruang utama'
          },
          {
            masterKomponenId: mkMap['FM-001'],
            volume: 12.0,
            hargaSatuan: 750000.00,
            totalHarga: 9000000.00,
            keterangan: 'Pintu aluminium kaca untuk akses'
          }
        ]
      }
    },
    include: {
      items: true
    }
  });

  // Update total harga BOQ
  const itemsTotal = sampleBOQ.items.reduce((sum, item) => sum + parseFloat(item.totalHarga), 0);
  await prisma.bOQ.update({
    where: { id: sampleBOQ.id },
    data: { totalHarga: itemsTotal }
  });

  console.log('Sample BOQ seeded successfully.');
  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
