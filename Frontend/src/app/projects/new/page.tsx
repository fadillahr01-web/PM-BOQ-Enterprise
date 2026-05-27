"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronRight, Save, X, CheckCircle2, Circle } from "lucide-react";

interface ProjectChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface NewProjectForm {
  name: string;
  clientName: string;
  location: string;
  budget: number;
  startDate: string;
  endDate: string;
}

const defaultChecklist: ProjectChecklistItem[] = [
  { id: 'boq', label: 'Sudah pembuatan BOQ', completed: false },
  { id: 'survey', label: 'Sudah survey', completed: false },
  { id: 'tender', label: 'Sudah proses tender', completed: false },
  { id: 'po', label: 'Sudah PO', completed: false },
  { id: 'spk', label: 'Sudah terbit SPK', completed: false },
  { id: 'baut', label: 'Sudah BAUT', completed: false },
  { id: 'bast', label: 'Sudah BAST', completed: false },
];

export default function NewProjectPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const [formData, setFormData] = useState<NewProjectForm>({
    name: '',
    clientName: '',
    location: '',
    budget: 0,
    startDate: '',
    endDate: '',
  });

  const [checklist, setChecklist] = useState<ProjectChecklistItem[]>(defaultChecklist);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' ? parseFloat(value) || 0 : value
    }));
  };

  const toggleChecklistItem = (itemId: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const parseApiError = async (response: Response) => {
    const defaultText = `${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (body?.error) return body.error;
      if (body?.detail) return body.detail;
      if (body?.message) return body.message;
      return defaultText;
    } catch {
      return defaultText;
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.clientName || !formData.location) {
      setMessage({ text: 'Harap isi semua field yang diperlukan', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const projectData = {
        name: formData.name,
        clientName: formData.clientName,
        location: formData.location,
        budget: formData.budget,
        actualCost: 0,
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        endDate: formData.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        plannedProgress: 0,
        actualProgress: 0,
        status: 'NOT_STARTED',
      };

      const response = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const apiError = await parseApiError(response);
        throw new Error(apiError || 'Gagal membuat project baru');
      }

      await response.json();
      setMessage({ text: 'Project berhasil dibuat! Data disimpan dan akan muncul di daftar project, BOQ, dan master data.', type: 'success' });
      setTimeout(() => {
        router.push('/projects');
      }, 1500);
    } catch (error: any) {
      const message = error?.message || 'Terjadi kesalahan saat membuat project';
      setMessage({
        text: message === 'Failed to fetch'
          ? `Tidak dapat terhubung ke backend. Pastikan server backend berjalan di ${API_URL} dan endpoint /api/projects tersedia.`
          : message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/projects');
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const completionPercentage = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen dark:bg-slate-900 transition-colors duration-300">
      {/* Top Navigation Back */}
      <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <span className="cursor-pointer hover:text-slate-600" onClick={() => router.push('/dashboard')}>
          Dashboard
        </span>
        <ChevronRight className="h-3 w-3" />
        <span className="cursor-pointer hover:text-slate-600" onClick={() => router.push('/projects')}>
          Daftar Project
        </span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-600 dark:text-slate-200">Tambah Project Baru</span>
      </div>

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Tambah Project Baru
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Lengkapi informasi project dan tandai checklist tahapan yang telah diselesaikan
        </p>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-lg text-sm border ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400' 
            : 'bg-red-50 border-red-300 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-400'
        }`}>
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Information Card */}
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Informasi Project</CardTitle>
              <CardDescription>
                Isi data dasar project baru
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Nama Project <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Misal: Revitalisasi Gedung A"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Klien <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="clientName"
                    placeholder="Misal: PT Maju Jaya"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Lokasi <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="location"
                  placeholder="Misal: Jakarta Pusat"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="h-10"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Nilai Kontrak (IDR)
                  </label>
                  <Input
                    type="number"
                    name="budget"
                    placeholder="0"
                    value={formData.budget || ''}
                    onChange={handleInputChange}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Tanggal Mulai
                  </label>
                  <Input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Target Selesai
                  </label>
                  <Input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="h-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checklist Card */}
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Tahapan Project</CardTitle>
              <CardDescription>
                Tandai tahapan yang telah diselesaikan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Progress Bar */}
              <div className="mb-6 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>Progress Checklist</span>
                  <span>{completedCount}/{checklist.length} Selesai ({completionPercentage}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-3">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition cursor-pointer"
                    onClick={() => toggleChecklistItem(item.id)}
                  >
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                        item.completed
                          ? 'bg-emerald-500 border-emerald-600'
                          : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400'
                      }`}
                    >
                      {item.completed && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      item.completed
                        ? 'text-emerald-600 dark:text-emerald-400 line-through'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Summary Card */}
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-indigo-600 dark:border-indigo-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-3">
                <div className="pb-3 border-b border-indigo-400">
                  <p className="text-indigo-100 text-xs uppercase tracking-wider mb-1">Nama Project</p>
                  <p className="font-bold truncate">{formData.name || '-'}</p>
                </div>
                <div className="pb-3 border-b border-indigo-400">
                  <p className="text-indigo-100 text-xs uppercase tracking-wider mb-1">Klien</p>
                  <p className="font-bold truncate">{formData.clientName || '-'}</p>
                </div>
                <div className="pb-3 border-b border-indigo-400">
                  <p className="text-indigo-100 text-xs uppercase tracking-wider mb-1">Lokasi</p>
                  <p className="font-bold truncate">{formData.location || '-'}</p>
                </div>
                <div>
                  <p className="text-indigo-100 text-xs uppercase tracking-wider mb-1">Nilai Kontrak</p>
                  <p className="font-bold">
                    {formData.budget > 0 
                      ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(formData.budget)
                      : '-'
                    }
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-indigo-400">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-semibold">{completedCount} Tahapan Selesai</span>
                </div>
                <p className="text-indigo-100 text-xs">Dari {checklist.length} total tahapan</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.name}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-medium h-10 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Menyimpan...' : 'Simpan Project'}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Batal
            </Button>
          </div>

          {/* Help Text */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Tip:</strong> Anda dapat mengedit informasi project dan checklist setelah membuat project baru di halaman detail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
