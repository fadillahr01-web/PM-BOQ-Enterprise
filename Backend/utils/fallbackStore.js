// Simulated in-memory database store for fallback when database connection is offline.

const users = [
  { id: "u-admin", email: "admin@project.com", name: "Administrator", password: "Admin123", role: "ADMIN" },
  { id: "u-pm", email: "pm@project.com", name: "Fadilah Riyadi", password: "PM123", role: "PROJECT_MANAGER" },
  { id: "u-client", email: "client@client.com", name: "Client Viewer", password: "Client123", role: "CLIENT_VIEWER" },
  { id: "u-supervisor", email: "siti@pmboq.com", name: "Siti Rahma (Supervisor)", password: "Supervisor123", role: "SUPERVISOR" },
];

const projects = [
  {
    id: "p-pedpedia",
    name: "Sistem Monitoring Progress & BOQ Kontraktor",
    description: "Sistem monitoring terpadu untuk pengendalian progres fisik lapangan dan penyusunan anggaran biaya BOQ konstruksi.",
    clientName: "Toko Pedpedia",
    location: "Jakarta Selatan",
    budget: 1500000000.00,
    actualCost: 920000000.00,
    startDate: "2026-03-01T00:00:00.000Z",
    endDate: "2026-08-15T00:00:00.000Z",
    plannedProgress: 65.0,
    actualProgress: 58.5,
    status: "SPK",
  }
];

const projectMembers = [
  { id: "pm-1", projectId: "p-pedpedia", userId: "u-admin" },
  { id: "pm-2", projectId: "p-pedpedia", userId: "u-pm" },
  { id: "pm-3", projectId: "p-pedpedia", userId: "u-client" },
  { id: "pm-4", projectId: "p-pedpedia", userId: "u-supervisor" },
];

const tasks = [
  {
    id: "t-1",
    projectId: "p-pedpedia",
    name: "Pemasangan Dinding Partisi GRC",
    description: "Pemasangan dinding sekat untuk ruang direksi dan ruang meeting utama.",
    startDate: "2026-05-01T00:00:00.000Z",
    endDate: "2026-05-25T00:00:00.000Z",
    status: "ON_PROGRESS",
    priority: "HIGH",
    progress: 40.0,
    assigneeId: "u-pm",
    subTasks: [
      { id: "st-1", taskId: "t-1", name: "Pengukuran & marking area", isCompleted: true },
      { id: "st-2", taskId: "t-1", name: "Pemasangan rangka hollow galvalum", isCompleted: true },
      { id: "st-3", taskId: "t-1", name: "Pemasangan papan GRC", isCompleted: false },
      { id: "st-4", taskId: "t-1", name: "Compound & sanding sambungan", isCompleted: false },
    ]
  },
  {
    id: "t-2",
    projectId: "p-pedpedia",
    name: "Instalasi Kabel Data & Elektrikal lantai 2",
    description: "Penarikan kabel LAN Cat6 dan kabel power stop kontak area kubikal.",
    startDate: "2026-05-10T00:00:00.000Z",
    endDate: "2026-05-30T00:00:00.000Z",
    status: "ON_PROGRESS",
    priority: "CRITICAL",
    progress: 15.0,
    assigneeId: "u-supervisor",
    subTasks: [
      { id: "st-5", taskId: "t-2", name: "Pemasangan tray kabel ceiling", isCompleted: true },
      { id: "st-6", taskId: "t-2", name: "Penarikan kabel power & data", isCompleted: false },
    ]
  },
  {
    id: "t-3",
    projectId: "p-pedpedia",
    name: "Pekerjaan Plafond Drop Ceiling",
    description: "Pembuatan drop ceiling area lobby dan lampu indirect LED strip.",
    startDate: "2026-06-01T00:00:00.000Z",
    endDate: "2026-06-15T00:00:00.000Z",
    status: "NOT_STARTED",
    priority: "MEDIUM",
    progress: 0.0,
    assigneeId: "u-pm",
    subTasks: []
  },
  {
    id: "t-4",
    projectId: "p-pedpedia",
    name: "Fabrikasi Lemari & Credenza Custom",
    description: "Pekerjaan workshop untuk pembuatan furniture loose cabinet dan pantry.",
    startDate: "2026-04-15T00:00:00.000Z",
    endDate: "2026-05-15T00:00:00.000Z",
    status: "DONE",
    priority: "HIGH",
    progress: 100.0,
    assigneeId: "u-supervisor",
    subTasks: [
      { id: "st-7", taskId: "t-4", name: "Pemotongan multiplex 18mm", isCompleted: true },
      { id: "st-8", taskId: "t-4", name: "Perakitan kabinet", isCompleted: true },
      { id: "st-9", taskId: "t-4", name: "Finishing HPL luar & melamin dalam", isCompleted: true },
    ]
  }
];

const boqCategories = [
  {
    id: "cat-1",
    projectId: "p-pedpedia",
    name: "Pekerjaan Persiapan & Bongkaran",
    items: [
      { id: "bi-1", categoryId: "cat-1", description: "Pembersihan lokasi proyek & proteksi area kerja", volume: 1.0, unit: "lot", unitPrice: 15000000.00, totalPrice: 15000000.00, progress: 100.0, remarks: "Proteksi lift & koridor gedung" },
      { id: "bi-2", categoryId: "cat-1", description: "Bongkaran dinding partisi gypsum eksisting", volume: 120.0, unit: "m2", unitPrice: 45000.00, totalPrice: 5400000.00, progress: 100.0, remarks: "Termasuk pembuangan puing keluar gedung" }
    ]
  },
  {
    id: "cat-2",
    projectId: "p-pedpedia",
    name: "Pekerjaan Dinding & Plafond",
    items: [
      { id: "bi-3", categoryId: "cat-2", description: "Pemasangan partisi gypsum double-side (rangka metal)", volume: 340.0, unit: "m2", unitPrice: 185000.00, totalPrice: 62900000.00, progress: 40.0 },
      { id: "bi-4", categoryId: "cat-2", description: "Pemasangan plafond gypsum board 9mm flat", volume: 280.0, unit: "m2", unitPrice: 95000.00, totalPrice: 26600000.00, progress: 0.0 }
    ]
  }
];

const milestones = [
  {
    id: "m-1",
    projectId: "p-pedpedia",
    stage: 1,
    name: "Perencanaan & Desain (Plan & Design)",
    status: "DONE",
    picId: "u-pm",
    updatedAt: new Date().toISOString(),
    metadata: {
      designUrl: "/uploads/milestones/design_layout.pdf",
      notes: "Desain layout interior disetujui klien."
    }
  },
  {
    id: "m-2",
    projectId: "p-pedpedia",
    stage: 2,
    name: "Survey Lapangan & Pengukuran",
    status: "DONE",
    picId: "u-pm",
    updatedAt: new Date().toISOString(),
    metadata: {
      surveyDate: "2026-03-05",
      fieldPhotoUrl: "/uploads/milestones/survey_lokasi.jpg",
      notes: "Kondisi lapangan kosong, siap dipasang rangka."
    }
  },
  {
    id: "m-3",
    projectId: "p-pedpedia",
    stage: 3,
    name: "Pembuatan Bill of Quantities (BOQ)",
    status: "DONE",
    picId: "u-admin",
    updatedAt: new Date().toISOString(),
    metadata: {
      boqUrl: "/api/boq/p-pedpedia/export",
      notes: "BOQ selesai dihitung berdasarkan desain layout."
    }
  },
  {
    id: "m-4",
    projectId: "p-pedpedia",
    stage: 4,
    name: "Proses Tender Kontraktor",
    status: "DONE",
    picId: "u-pm",
    updatedAt: new Date().toISOString(),
    metadata: {
      vendorName: "PT Mandiri Jaya Konstruksi",
      bidValue: 1450000000,
      tenderDate: "2026-03-20"
    }
  },
  {
    id: "m-5",
    projectId: "p-pedpedia",
    stage: 5,
    name: "Penandatanganan SPK",
    status: "DONE",
    picId: "u-admin",
    updatedAt: new Date().toISOString(),
    metadata: {
      spkFileUrl: "/uploads/milestones/spk_final.pdf",
      signingDate: "2026-04-01"
    }
  },
  {
    id: "m-6",
    projectId: "p-pedpedia",
    stage: 6,
    name: "Penerbitan Purchase Order (PO)",
    status: "DONE",
    picId: "u-admin",
    updatedAt: new Date().toISOString(),
    metadata: {
      poFileUrl: "/uploads/milestones/po_final.pdf",
      poDate: "2026-04-05"
    }
  },
  {
    id: "m-7",
    projectId: "p-pedpedia",
    stage: 7,
    name: "Implementasi & Eksekusi Proyek",
    status: "ON_PROGRESS",
    picId: "u-supervisor",
    updatedAt: new Date().toISOString(),
    metadata: {
      dailyNotes: "Pemasangan partisi gypsum sedang berlangsung, pengiriman material tahap 2 lancar."
    }
  },
  {
    id: "m-8",
    projectId: "p-pedpedia",
    stage: 8,
    name: "Berita Acara Uji Terima (BAUT)",
    status: "NOT_STARTED",
    picId: null,
    updatedAt: new Date().toISOString(),
    metadata: {
      signatureDate: "",
      bautFileUrl: ""
    }
  },
  {
    id: "m-9",
    projectId: "p-pedpedia",
    stage: 9,
    name: "Berita Acara Serah Terima (BAST)",
    status: "NOT_STARTED",
    picId: null,
    updatedAt: new Date().toISOString(),
    metadata: {
      signatureDate: "",
      bastFileUrl: ""
    }
  }
];

const progressLogs = [
  { id: "pl-1", projectId: "p-pedpedia", week: 1, plannedProgress: 10.0, actualProgress: 8.0, logDate: "2026-03-07T00:00:00.000Z" },
  { id: "pl-2", projectId: "p-pedpedia", week: 2, plannedProgress: 25.0, actualProgress: 22.0, logDate: "2026-03-14T00:00:00.000Z" },
  { id: "pl-3", projectId: "p-pedpedia", week: 3, plannedProgress: 45.0, actualProgress: 40.0, logDate: "2026-03-21T00:00:00.000Z" },
  { id: "pl-4", projectId: "p-pedpedia", week: 4, plannedProgress: 65.0, actualProgress: 58.5, logDate: "2026-03-28T00:00:00.000Z" },
  { id: "pl-5", projectId: "p-pedpedia", week: 5, plannedProgress: 80.0, actualProgress: 0.0, logDate: "2026-04-04T00:00:00.000Z" },
  { id: "pl-6", projectId: "p-pedpedia", week: 6, plannedProgress: 100.0, actualProgress: 0.0, logDate: "2026-04-11T00:00:00.000Z" }
];

const materials = [
  { id: 'mat-1', name: 'Gypsum Board 9mm', unit: 'm2', unitPrice: 95000.00 },
  { id: 'mat-2', name: 'Besi Hollow 40x40', unit: 'm', unitPrice: 25000.00 },
  { id: 'mat-3', name: 'Cat Dulux Weather Shield', unit: 'liter', unitPrice: 145000.00 }
];

const services = [
  { id: 'srv-1', name: 'Pemasangan Partisi', unit: 'm2', unitPrice: 65000.00 },
  { id: 'srv-2', name: 'Pemasangan Plafond Gypsum', unit: 'm2', unitPrice: 85000.00 }
];

module.exports = {
  users,
  projects,
  projectMembers,
  tasks,
  boqCategories,
  milestones,
  progressLogs,
  materials,
  services
};
