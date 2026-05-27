"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, Package, Wrench, RefreshCw, CheckCircle2, AlertCircle, Save, X } from "lucide-react";

interface MasterItem {
  id: string;
  name: string;
  unit: string;
  unitPrice?: number | string;
  merk?: string;
}

interface ProjectItem {
  id: string;
  name: string;
  clientName: string;
  location: string;
  status: string;
}

export default function MasterDataPage() {
  const [materials, setMaterials] = useState<MasterItem[]>([]);
  const [services, setServices] = useState<MasterItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  const [isEditing, setIsEditing] = useState(false);
  const [currentTab, setCurrentTab] = useState('materials');
  const [formData, setFormData] = useState<{ id?: string, name: string, unit: string, unitPrice: number | string, merk: string }>({ 
    name: '', 
    unit: '', 
    unitPrice: '', 
    merk: '' 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matRes, srvRes, projRes] = await Promise.all([
        fetch(`${API_URL}/api/ref/materials`),
        fetch(`${API_URL}/api/ref/services`),
        fetch(`${API_URL}/api/projects`)
      ]);

      if (matRes.ok) setMaterials(await matRes.json());
      if (srvRes.ok) setServices(await srvRes.json());
      if (projRes.ok) {
        const projectList = await projRes.json();
        setProjects(projectList.map((p: any) => ({
          id: p.id,
          name: p.name,
          clientName: p.clientName,
          location: p.location,
          status: p.status
        })));
      }
    } catch (err) {
      setMessage({ text: 'Gagal mengambil data dari server.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.unit) {
      setMessage({ text: 'Nama dan Satuan wajib diisi.', type: 'error' });
      return;
    }

    try {
      const endpoint = currentTab === 'materials' ? '/api/ref/materials' : '/api/ref/services';
      const url = formData.id 
        ? `${API_URL}${endpoint}/${formData.id}` 
        : `${API_URL}${endpoint}`;
      
      const res = await fetch(url, {
        method: formData.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formData.name, 
          unit: formData.unit, 
          unitPrice: formData.unitPrice || 0.0,
          merk: formData.merk || null
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'Gagal menyimpan data.');
      }

      setMessage({ text: 'Data berhasil disimpan!', type: 'success' });
      setFormData({ name: '', unit: '', unitPrice: '', merk: '' });
      setIsEditing(false);
      fetchData();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleDelete = async (id: string, type: 'materials' | 'services') => {
    if (!window.confirm('Yakin ingin menghapus item ini?')) return;
    try {
      const endpoint = type === 'materials' ? '/api/ref/materials' : '/api/ref/services';
      const res = await fetch(`${API_URL}${endpoint}/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Gagal menghapus data.');
      setMessage({ text: 'Data berhasil dihapus.', type: 'success' });
      fetchData();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const startEdit = (item: MasterItem) => {
    setFormData({ 
      id: item.id, 
      name: item.name, 
      unit: item.unit, 
      unitPrice: item.unitPrice || '', 
      merk: item.merk || '' 
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setFormData({ name: '', unit: '', unitPrice: '', merk: '' });
    setIsEditing(false);
  };

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Kelola Master Data</h1>
            <p className="text-slate-500 dark:text-slate-400">Pusat konfigurasi referensi Perangkat (Material) dan Jasa (Service).</p>
          </div>

          {message && (
            <div className={`flex items-center gap-3 p-4 rounded-lg text-sm border ${
              message.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 hover:shadow-md">
            <CardHeader className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-500" /> Proyek Aktif
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                Proyek aktif terbaru yang tersimpan di sistem dan dapat digunakan sebagai data master untuk BOQ.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {projects.length === 0 ? (
                <p className="text-sm text-slate-500">Tidak ada project aktif yang tersedia.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium">
                      <tr>
                        <th className="px-4 py-3">Nama Project</th>
                        <th className="px-4 py-3">Klien</th>
                        <th className="px-4 py-3">Lokasi</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
                      {projects.map((project) => (
                        <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{project.name}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{project.clientName}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{project.location}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{project.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 hover:shadow-md">
            <CardHeader className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <CardTitle className="text-lg flex items-center gap-2">
                {isEditing ? <Edit2 className="h-5 w-5 text-indigo-500" /> : <Plus className="h-5 w-5 text-indigo-500" />}
                {isEditing ? 'Edit Item' : 'Tambah Item Baru'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Kategori</label>
                  <select 
                    value={currentTab}
                    onChange={(e) => {
                      setCurrentTab(e.target.value);
                      if (!isEditing) setFormData({ name: '', unit: '', unitPrice: '', merk: '' });
                    }}
                    disabled={isEditing}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="materials">Perangkat (Material)</option>
                    <option value="services">Jasa (Service)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Nama Item</label>
                  <Input 
                    placeholder="Contoh: Kabel FO 24 Core" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Satuan (Unit)</label>
                  <Input 
                    placeholder="Contoh: Meter, Lot, Unit" 
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Harga Satuan</label>
                  <Input 
                    type="number" 
                    placeholder="Contoh: 50000" 
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Merk</label>
                  <Input 
                    placeholder="Contoh: Corning, Furukawa" 
                    value={formData.merk}
                    onChange={(e) => setFormData({ ...formData, merk: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  {isEditing && (
                    <Button variant="outline" onClick={cancelEdit} className="gap-2 h-10">
                      <X className="h-4 w-4" /> Batal
                    </Button>
                  )}
                  <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 gap-2 h-10">
                    <Save className="h-4 w-4" /> {isEditing ? 'Simpan' : 'Tambah'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Tables */}
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
            <TabsList className="bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap w-fit">
              <TabsTrigger value="materials" className="flex gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-indigo-300">
                <Package className="h-4 w-4" /> Daftar Material
              </TabsTrigger>
              <TabsTrigger value="services" className="flex gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-indigo-300">
                <Wrench className="h-4 w-4" /> Daftar Jasa
              </TabsTrigger>
            </TabsList>

            <TabsContent value="materials">
              <Card className="border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-medium">
                      <tr>
                        <th className="px-6 py-4">Nama Perangkat</th>
                        <th className="px-6 py-4">Satuan</th>
                        <th className="px-6 py-4">Harga Satuan</th>
                        <th className="px-6 py-4">Merk</th>
                        <th className="px-6 py-4 w-24 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {loading ? (
                        <tr><td colSpan={5} className="text-center py-8 text-slate-400"><RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2"/> Memuat data...</td></tr>
                      ) : materials.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-8 text-slate-400">Belum ada data perangkat.</td></tr>
                      ) : (
                        materials.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{item.name}</td>
                            <td className="px-6 py-4 text-slate-500">{item.unit}</td>
                            <td className="px-6 py-4 text-slate-500">{item.unitPrice ? `Rp${Number(item.unitPrice).toLocaleString('id-ID')}` : '-'}</td>
                            <td className="px-6 py-4 text-slate-500">{item.merk || '-'}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => startEdit(item)} className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, 'materials')} className="h-8 w-8 text-slate-400 hover:text-rose-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="services">
              <Card className="border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-medium">
                      <tr>
                        <th className="px-6 py-4">Nama Jasa Pekerjaan</th>
                        <th className="px-6 py-4">Satuan</th>
                        <th className="px-6 py-4">Harga Satuan</th>
                        <th className="px-6 py-4">Merk</th>
                        <th className="px-6 py-4 w-24 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {loading ? (
                        <tr><td colSpan={5} className="text-center py-8 text-slate-400"><RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2"/> Memuat data...</td></tr>
                      ) : services.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-8 text-slate-400">Belum ada data jasa.</td></tr>
                      ) : (
                        services.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{item.name}</td>
                            <td className="px-6 py-4 text-slate-500">{item.unit}</td>
                            <td className="px-6 py-4 text-slate-500">{item.unitPrice ? `Rp${Number(item.unitPrice).toLocaleString('id-ID')}` : '-'}</td>
                            <td className="px-6 py-4 text-slate-500">{item.merk || '-'}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => startEdit(item)} className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, 'services')} className="h-8 w-8 text-slate-400 hover:text-rose-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
    </main>
  );
}
