"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Plus, Trash2, ChevronLeft } from 'lucide-react';

interface ProjectOption {
  id: string;
  name: string;
}

interface BoqComponent {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
}

interface BoqItemRow {
  id: string;
  componentId: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export default function CreateBoqPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [components, setComponents] = useState<BoqComponent[]>([]);
  const [projectId, setProjectId] = useState('');
  const [searchComponent, setSearchComponent] = useState('');
  const [rows, setRows] = useState<BoqItemRow[]>([
    { id: 'row-1', componentId: '', name: '', quantity: 1, unit: '', unitPrice: 0, total: 0 }
  ]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectRes, componentRes] = await Promise.all([
          fetch(`${API_URL}/api/projects`),
          fetch(`${API_URL}/api/boq/components`)
        ]);

        if (!projectRes.ok || !componentRes.ok) {
          throw new Error('Gagal memuat data project atau komponen BOQ');
        }

        const projectData = await projectRes.json();
        const componentData = await componentRes.json();
        const materials = componentData.materials || [];
        const services = componentData.services || [];

        setProjects(projectData.map((project: any) => ({ id: project.id, name: project.name })));
        setComponents([
          ...materials.map((item: any) => ({ ...item, name: item.name })),
          ...services.map((item: any) => ({ ...item, name: item.name }))
        ]);
      } catch (error: any) {
        setMessage({ text: error.message || 'Tidak dapat memuat data project atau komponen BOQ.', type: 'error' });
      }
    };

    loadData();
  }, []);

  const filteredComponents = components.filter(item =>
    item.name.toLowerCase().includes(searchComponent.toLowerCase())
  );

  const updateRow = (id: string, changes: Partial<BoqItemRow>) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      const updated = { ...row, ...changes };
      if (changes.componentId) {
        const selected = components.find(item => item.id === changes.componentId);
        if (selected) {
          updated.name = selected.name;
          updated.unit = selected.unit;
          updated.unitPrice = selected.unitPrice;
        }
      }
      updated.total = Number(updated.quantity) * Number(updated.unitPrice);
      return updated;
    }));
  };

  const addRow = () => {
    setRows(prev => [
      ...prev,
      { id: `row-${Date.now()}`, componentId: '', name: '', quantity: 1, unit: '', unitPrice: 0, total: 0 }
    ]);
  };

  const removeRow = (id: string) => {
    setRows(prev => prev.filter(row => row.id !== id));
  };

  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);

  const handleSubmitBoq = async () => {
    if (!projectId) {
      setMessage({ text: 'Pilih project terlebih dahulu.', type: 'error' });
      return;
    }

    if (rows.some(row => !row.componentId || row.quantity <= 0)) {
      setMessage({ text: 'Lengkapi semua item BOQ sebelum menyimpan.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        categories: [
          {
            name: 'BOQ Utama',
            items: rows.map(row => ({
              description: row.name,
              volume: row.quantity,
              unit: row.unit,
              unitPrice: row.unitPrice,
              progress: 0,
              remarks: ''
            }))
          }
        ]
      };

      const response = await fetch(`${API_URL}/api/boq/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Gagal menyimpan BOQ.');
      }

      setMessage({ text: 'BOQ berhasil disimpan!', type: 'success' });
      setTimeout(() => router.push('/projects'), 1200);
    } catch (error: any) {
      setMessage({ text: error.message || 'Terjadi kesalahan saat menyimpan BOQ.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-slate-950 text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pembuatan BOQ Baru</h1>
          <p className="text-slate-400 mt-1">Pilih project dan susun item pekerjaan dari Database Komponen BOQ.</p>
        </div>
        <button
          onClick={() => router.push('/projects')}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-900"
        >
          <ChevronLeft className="h-4 w-4" /> Kembali ke Project
        </button>
      </div>

      {message && (
        <div className={`rounded-2xl p-4 mb-6 text-sm border ${message.type === 'success' ? 'bg-emerald-950/30 border-emerald-600 text-emerald-200' : 'bg-rose-950/30 border-rose-600 text-rose-200'}`}>
          {message.text}
        </div>
      )}

      <Card className="bg-slate-900 border border-slate-800">
        <CardHeader>
          <CardTitle>Detail BOQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs uppercase text-slate-400">Project</label>
              <Select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="bg-slate-950 border-slate-700 text-slate-100"
              >
                <option value="">Pilih project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs uppercase text-slate-400">Cari Komponen BOQ</label>
              <Input
                value={searchComponent}
                onChange={(e) => setSearchComponent(e.target.value)}
                placeholder="Cari nama komponen..."
                className="bg-slate-950 border-slate-700 text-slate-100"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Komponen</th>
                  <th className="px-4 py-3">Satuan</th>
                  <th className="px-4 py-3 text-right">Harga Satuan</th>
                  <th className="px-4 py-3 text-right">Jumlah</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} className="border-t border-slate-800">
                    <td className="px-4 py-3">
                      <Select
                        value={row.componentId}
                        onChange={(e) => updateRow(row.id, { componentId: e.target.value })}
                        className="w-full bg-slate-950 border-slate-700 text-slate-100"
                      >
                        <option value="">Pilih komponen</option>
                        {filteredComponents.map(item => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Input value={row.unit} readOnly className="bg-slate-950 border-slate-700 text-slate-100" />
                    </td>
                    <td className="px-4 py-3 text-right text-slate-200">
                      {row.unitPrice.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) => updateRow(row.id, { quantity: Number(e.target.value) || 1 })}
                        className="w-24 bg-slate-950 border-slate-700 text-slate-100 text-right"
                      />
                    </td>
                    <td className="px-4 py-3 text-right text-slate-200">
                      {row.total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => removeRow(row.id)}
                        className="inline-flex items-center justify-center rounded-lg bg-rose-600/15 px-3 py-2 text-rose-300 hover:bg-rose-600/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Button variant="secondary" onClick={addRow} className="rounded-full px-5 py-3">
              <Plus className="h-4 w-4" /> Tambah Item
            </Button>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-right">
              <p className="text-sm text-slate-400">Total Estimasi</p>
              <p className="text-2xl font-semibold text-white">
                {grandTotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => router.push('/projects')}>Batal</Button>
            <Button onClick={handleSubmitBoq} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan BOQ'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
