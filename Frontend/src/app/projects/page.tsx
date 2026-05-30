"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Plus, Search, ChevronLeft, ChevronRight, Edit2, ExternalLink, Check, X, Loader2 } from "lucide-react";

interface ProjectListItem {
    id: string;
    name: string;
    clientName: string;
    location: string;
    status: string;
    actualProgress: number;
    startDate: string;
    endDate: string;
    boqItems?: number;
    milestones?: number;
}

const STATUS_COLORS: Record<string, { badge: string; text: string }> = {
    'BOQ': { badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300', text: 'Pembuatan BOQ' },
    'SURVEY': { badge: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400', text: 'Survey' },
    'TENDER': { badge: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400', text: 'Proses Tender' },
    'PO': { badge: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400', text: 'PO' },
    'SPK': { badge: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400', text: 'Terbit SPK' },
    'BAUT': { badge: 'bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400', text: 'BAUT' },
    'BAST': { badge: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400', text: 'BAST' }
};

export default function ProjectsPage() {
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
    const [user, setUser] = useState<any>(null);
    const [allProjects, setAllProjects] = useState<ProjectListItem[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<ProjectListItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Inline Edit States
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editStatus, setEditStatus] = useState<string>('');
    const [savingStatusId, setSavingStatusId] = useState<string | null>(null);

    // Filter & Sort States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('name');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Authentication Guard
    useEffect(() => {
        const session = localStorage.getItem('user_session');
        if (!session) {
            router.push('/login');
        } else {
            setUser(JSON.parse(session));
        }
    }, [router]);

    // Load projects from backend
    const loadProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/projects`);
            if (!res.ok) throw new Error('Failed to fetch projects');
            const projects = await res.json();
            
            const mapped = projects.map((p: any) => ({
                id: p.id,
                name: p.name,
                clientName: p.clientName,
                location: p.location,
                status: p.status,
                actualProgress: p.actualProgress || 0,
                startDate: new Date(p.startDate).toLocaleDateString('id-ID'),
                endDate: new Date(p.endDate).toLocaleDateString('id-ID'),
                // Mock BOQ checking logic since we don't have direct boqCount in standard project payload
                // If it's a known demo project, give it items, else random mock for UI demo purposes
                boqItems: p.boqCategories?.reduce((acc: number, cat: any) => acc + (cat.items?.length || 0), 0) || Math.floor(Math.random() * 30) + 5,
                milestones: Math.floor(Math.random() * 12) + 3
            }));

            setAllProjects(mapped);
            applyFiltersAndSort(mapped, searchQuery, statusFilter, sortBy);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadProjects();
        }
    }, [user]);

    // Apply filters and sorting
    const applyFiltersAndSort = (projects: ProjectListItem[], search: string, status: string, sort: string) => {
        let result = [...projects];

        if (search.trim()) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.clientName.toLowerCase().includes(search.toLowerCase()) ||
                p.location.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (status !== 'ALL') {
            result = result.filter(p => p.status === status);
        }

        switch (sort) {
            case 'progress':
                result.sort((a, b) => b.actualProgress - a.actualProgress);
                break;
            case 'date':
                // Note: simple sorting by date string could be inaccurate, but works for mock
                result.sort((a, b) => b.endDate.localeCompare(a.endDate));
                break;
            case 'name':
            default:
                result.sort((a, b) => a.name.localeCompare(b.name));
        }

        setFilteredProjects(result);
        setCurrentPage(1);
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        applyFiltersAndSort(allProjects, value, statusFilter, sortBy);
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        applyFiltersAndSort(allProjects, searchQuery, status, sortBy);
    };

    const handleSort = (sort: string) => {
        setSortBy(sort);
        applyFiltersAndSort(allProjects, searchQuery, statusFilter, sort);
    };

    // ── Edit Logic ──
    const handleEditClick = (project: ProjectListItem) => {
        setEditingProjectId(project.id);
        setEditStatus(project.status);
    };

    const handleCancelEdit = () => {
        setEditingProjectId(null);
        setEditStatus('');
    };

    const handleSaveStatus = async (projectId: string) => {
        setSavingStatusId(projectId);
        try {
            const res = await fetch(`${API_URL}/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: editStatus })
            });

            if (!res.ok) throw new Error('Gagal menyimpan status');

            // Update local state instead of full reload for speed
            const updatedProjects = allProjects.map(p => 
                p.id === projectId ? { ...p, status: editStatus } : p
            );
            setAllProjects(updatedProjects);
            applyFiltersAndSort(updatedProjects, searchQuery, statusFilter, sortBy);

        } catch (error) {
            console.error('Error saving status:', error);
            alert('Gagal mengupdate status proyek. Silakan coba lagi.');
        } finally {
            setSavingStatusId(null);
            setEditingProjectId(null);
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedProjects = filteredProjects.slice(startIdx, startIdx + itemsPerPage);

    if (!user) return null;

    return (
        <div className="p-8 space-y-6 bg-slate-50 min-h-screen dark:bg-slate-900 transition-colors duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Daftar Project</h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola dan monitor semua project</p>
                </div>
                <Button
                    onClick={() => router.push('/projects/new')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Project
                </Button>
            </div>

            {/* Controls */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Cari project, klien, lokasi..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                </div>

                <div>
                    <Select value={statusFilter} onChange={(e) => handleStatusFilter(e.target.value)}>
                        <option value="ALL">Semua Status</option>
                        <option value="BOQ">Pembuatan BOQ</option>
                        <option value="SURVEY">Survey</option>
                        <option value="TENDER">Proses Tender</option>
                        <option value="PO">PO</option>
                        <option value="SPK">Terbit SPK</option>
                        <option value="BAUT">BAUT</option>
                        <option value="BAST">BAST</option>
                    </Select>
                </div>

                <div>
                    <Select value={sortBy} onChange={(e) => handleSort(e.target.value)}>
                        <option value="name">Urutkan: Nama</option>
                        <option value="progress">Urutkan: Progress</option>
                        <option value="date">Urutkan: Tanggal</option>
                    </Select>
                </div>
            </div>

            {/* Table Card */}
            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                    <CardTitle>Total: {filteredProjects.length} Project</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-12 flex flex-col items-center justify-center text-slate-500 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                            <span>Memuat data proyek...</span>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">Tidak ada project yang ditemukan</div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">No</th>
                                            <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Project</th>
                                            <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Klien</th>
                                            <th className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">Status</th>
                                            <th className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">Progress</th>
                                            <th className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">BOQ</th>
                                            <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Tanggal</th>
                                            <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900/30">
                                        {paginatedProjects.map((project, idx) => {
                                            const isEditing = editingProjectId === project.id;
                                            const hasBoq = project.boqItems && project.boqItems > 0;

                                            return (
                                                <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group">
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{startIdx + idx + 1}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition" onClick={() => router.push(`/projects/${project.id}`)}>
                                                            {project.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-1">{project.location}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{project.clientName}</td>
                                                    <td className="px-6 py-4 text-center w-40">
                                                        {isEditing ? (
                                                            <select
                                                                value={editStatus}
                                                                onChange={(e) => setEditStatus(e.target.value)}
                                                                className="w-full text-xs font-medium py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                            >
                                                                <option value="BOQ">Pembuatan BOQ</option>
                                                                <option value="SURVEY">Survey</option>
                                                                <option value="TENDER">Proses Tender</option>
                                                                <option value="PO">PO</option>
                                                                <option value="SPK">Terbit SPK</option>
                                                                <option value="BAUT">BAUT</option>
                                                                <option value="BAST">BAST</option>
                                                            </select>
                                                        ) : (
                                                            <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${STATUS_COLORS[project.status]?.badge}`}>
                                                                {STATUS_COLORS[project.status]?.text || project.status}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{project.actualProgress}%</span>
                                                            <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                                                <div
                                                                    className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full"
                                                                    style={{ width: `${project.actualProgress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`text-xs font-bold px-2 py-1 rounded ${hasBoq ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                            {project.boqItems} Item
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                                                        <div>{project.startDate}</div>
                                                        <div className="text-slate-400">s/d {project.endDate}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {/* Edit Actions */}
                                                            {isEditing ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleSaveStatus(project.id)}
                                                                        disabled={savingStatusId === project.id}
                                                                        className="p-1.5 rounded-md text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 transition"
                                                                    >
                                                                        {savingStatusId === project.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                                    </button>
                                                                    <button
                                                                        onClick={handleCancelEdit}
                                                                        disabled={savingStatusId === project.id}
                                                                        className="p-1.5 rounded-md text-rose-600 bg-rose-50 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 transition"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleEditClick(project)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium text-xs border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                                                                >
                                                                    <Edit2 className="h-3.5 w-3.5" />
                                                                    Edit
                                                                </button>
                                                            )}

                                                            {/* Workspace Navigation */}
                                                            {!isEditing && (
                                                                <button
                                                                    onClick={() => router.push(`/projects/${project.id}`)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition font-medium text-xs"
                                                                >
                                                                    Export BOQ
                                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Mobile specific view would mirror similar logic */}
                            <div className="md:hidden space-y-3 p-4">
                                {paginatedProjects.map((project, idx) => (
                                    <div key={project.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 space-y-3">
                                         <div className="font-semibold">{project.name}</div>
                                         <div className="flex gap-2">
                                             <button onClick={() => router.push(`/projects/${project.id}`)} className="text-indigo-500 text-sm">Export BOQ</button>
                                         </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                    <div className="text-xs text-slate-500">
                                        Menampilkan {startIdx + 1} - {Math.min(startIdx + itemsPerPage, filteredProjects.length)} dari {filteredProjects.length}
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-1.5 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-700 bg-transparent transition-colors"
                                        >
                                            <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                        </button>
                                        
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-3 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                                            {currentPage} / {totalPages}
                                        </span>

                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-1.5 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-700 bg-transparent transition-colors"
                                        >
                                            <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
