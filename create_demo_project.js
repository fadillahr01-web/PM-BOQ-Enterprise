(async () => {
  try {
    const payload = {
      name: "Demo Project 1",
      clientName: "ACME Corp",
      location: "Jakarta",
      budget: 1000000,
      actualCost: 0,
      startDate: "2026-05-22",
      endDate: "2026-08-20",
      plannedProgress: 0,
      actualProgress: 0,
      status: "NOT_STARTED",
      metadata: {
        checklist: [
          { id: 'boq', label: 'Sudah pembuatan BOQ', completed: true },
          { id: 'survey', label: 'Sudah survey', completed: false },
          { id: 'tender', label: 'Sudah proses tender', completed: false },
          { id: 'po', label: 'Sudah PO', completed: false },
          { id: 'spk', label: 'Sudah terbit SPK', completed: false },
          { id: 'baut', label: 'Sudah BAUT', completed: false },
          { id: 'bast', label: 'Sudah BAST', completed: false }
        ]
      }
    };

    const res = await fetch('http://localhost:5000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('Status:', res.status);
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Request failed:', err);
    process.exit(1);
  }
})();
