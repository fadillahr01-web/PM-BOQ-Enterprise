"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, TrendingDown, DollarSign, RefreshCw, Layers, TrendingUp, Landmark, ChevronDown, Download } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Interfaces
interface Task {
    id: string;
    name: string;
    pic: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    progress: number;
    status: 'NOT_STARTED' | 'ON_PROGRESS' | 'DONE' | 'PENDING';
}

interface ProjectData {
    id: string;
    name: string;
    plannedProgress: number;
    actualProgress: number;
    deviation: number;
    budget: number;
    actualCost: number;
    deadline: string;
    status: string;
    clientName: string;
    location: string;
}

interface ScurvePoint {
    id: string;
    week: number;
    plannedProgress: number;
    actualProgress: number;
}

export default function ProjectDashboard() {
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const [user, setUser] = useState<any>(null);

    // Global Data
    const [allProjects, setAllProjects] = useState<ProjectData[]>([]);
    
    // Active Project View
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [activeProject, setActiveProject] = useState<ProjectData | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [scurveData, setScurveData] = useState<ScurvePoint[]>([]);

    const [isLive, setIsLive] = useState(false);
    const [loading, setLoading] = useState(false);

    // 1. Auth Guard
    useEffect(() => {
        const session = localStorage.getItem('user_session');
        if (!session) {
            router.push('/login');
        } else {
            setUser(JSON.parse(session));
        }
    }, [router]);

    // 2. Fetch Initial Projects List
    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const projectsRes = await fetch(`${API_URL}/api/projects`);
            if (!projectsRes.ok) throw new Error('Failed to fetch projects');
            const projects = await projectsRes.json();

            if (projects && projects.length > 0) {
                const mappedProjects = projects.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    clientName: p.clientName,
                    location: p.location,
                    plannedProgress: p.plannedProgress || 0,
                    actualProgress: p.actualProgress || 0,
                    deviation: parseFloat(((p.actualProgress || 0) - (p.plannedProgress || 0)).toFixed(1)),
                    budget: parseFloat(p.budget) || 0,
                    actualCost: parseFloat(p.actualCost) || 0,
                    deadline: p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : '',
                    status: p.status
                }));

                setAllProjects(mappedProjects);
                setIsLive(true);

                // Set initial selected project if not set
                if (!selectedProjectId && mappedProjects.length > 0) {
                    setSelectedProjectId(mappedProjects[0].id);
                }
            } else {
                // Mock if empty
                setAllProjects([]);
                setActiveProject(null);
            }
        } catch (error) {
            console.warn('Backend offline or error', error);
            setIsLive(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    // 3. Fetch Details when selectedProjectId changes
    useEffect(() => {
        if (!selectedProjectId) return;
        
        const proj = allProjects.find(p => p.id === selectedProjectId);
        if (proj) {
            setActiveProject(proj);
        }

        const fetchProjectDetails = async () => {
            try {
                // Fetch tasks
                const tasksRes = await fetch(`${API_URL}/api/tasks?projectId=${selectedProjectId}`);
                if (tasksRes.ok) {
                    const liveTasks = await tasksRes.json();
                    setTasks(liveTasks.map((t: any) => ({
                        id: t.id,
                        name: t.name,
                        pic: t.assignee ? t.assignee.name : 'Belum Ditugaskan',
                        priority: t.priority,
                        progress: t.progress,
                        status: t.status
                    })));
                }

                // Fetch S-Curve
                const scurveRes = await fetch(`${API_URL}/api/s-curve/${selectedProjectId}`);
                if (scurveRes.ok) {
                    const logs = await scurveRes.json();
                    setScurveData(logs || []);
                }
            } catch (error) {
                console.warn('Failed fetching project details', error);
            }
        };

        fetchProjectDetails();
    }, [selectedProjectId, allProjects]);

    // KPI Metrics calculation
    const totalProjects = allProjects.length;
    const boqProjects = allProjects.filter(p => p.status === 'BOQ').length;
    const surveyProjects = allProjects.filter(p => p.status === 'SURVEY').length;
    const tenderProjects = allProjects.filter(p => p.status === 'TENDER').length;
    const poProjects = allProjects.filter(p => p.status === 'PO').length;
    const spkProjects = allProjects.filter(p => p.status === 'SPK').length;
    const bautProjects = allProjects.filter(p => p.status === 'BAUT').length;
    const bastProjects = allProjects.filter(p => p.status === 'BAST').length;

    const formattedCurrency = (val: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    // Format S-Curve data for Recharts
    const formatSCurveData = () => {
        return scurveData.map(d => ({
            name: `M-${d.week}`,
            'Rencana (%)': d.plannedProgress,
            'Aktual (%)': d.week > 4 && d.actualProgress === 0 ? null : d.actualProgress // Handle future weeks gracefully
        }));
    };

    const handleDownloadReport = () => {
        // Boilerplate for downloading executive report
        alert('Fitur Unduh Laporan Eksekutif sedang dalam pengembangan.');
    };

    if (!user) return null;

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen dark:bg-slate-900 transition-colors duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Project Management System</h1>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold tracking-wide ${isLive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                            {isLive ? 'LIVE' : 'OFFLINE'}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Dashboard Ikhtisar Eksekutif</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={fetchInitialData}
                        disabled={loading}
                        className="flex items-center gap-2 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium text-sm border border-slate-200 dark:border-slate-700 transition shadow-sm"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>

                    <button
                        onClick={handleDownloadReport}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm"
                    >
                        <Download className="h-4 w-4" />
                        Unduh Laporan
                    </button>

                    {activeProject && activeProject.deviation < 0 && (
                        <div className="flex items-center gap-2 bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-400 px-4 py-2 rounded-lg font-medium text-sm border border-rose-300 dark:border-rose-800 animate-pulse">
                            <AlertCircle className="h-4 w-4" />
                            Warning: Deviasi {activeProject.deviation}%
                        </div>
                    )}
                </div>
            </div>

            {/* Global & Project KPIs */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Dynamically calculated projects card */}
                <Card className="flex flex-col h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Jumlah Project</CardTitle>
                        <Landmark className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </CardHeader>
                    <CardContent className="pt-2 flex-1">
                        <div className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{totalProjects} Project</div>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-0.5">
                                <span className="text-slate-600 dark:text-slate-400">Pembuatan BOQ</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{boqProjects}</span>
                            </div>
                            <div className="flex justify-between items-center py-0.5">
                                <span className="text-slate-600 dark:text-slate-400">Survey</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">{surveyProjects}</span>
                            </div>
                            <div className="flex justify-between items-center py-0.5">
                                <span className="text-slate-600 dark:text-slate-400">Proses Tender</span>
                                <span className="font-bold text-purple-600 dark:text-purple-400">{tenderProjects}</span>
                            </div>
                            <div className="flex justify-between items-center py-0.5">
                                <span className="text-slate-600 dark:text-slate-400">PO</span>
                                <span className="font-bold text-amber-600 dark:text-amber-400">{poProjects}</span>
                            </div>
                            <div className="flex justify-between items-center py-0.5">
                                <span className="text-slate-600 dark:text-slate-400">Terbit SPK</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{spkProjects}</span>
                            </div>
                            <div className="flex justify-between items-center py-0.5">
                                <span className="text-slate-600 dark:text-slate-400">BAUT</span>
                                <span className="font-bold text-teal-600 dark:text-teal-400">{bautProjects}</span>
                            </div>
                            <div className="flex justify-between items-center py-0.5">
                                <span className="text-slate-600 dark:text-slate-400">BAST</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{bastProjects}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {activeProject ? (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Progress Aktual</CardTitle>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeProject.actualProgress}%</span>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="text-2xl font-bold mb-1 truncate" title={activeProject.name}>{activeProject.name}</div>
                                <Progress value={activeProject.actualProgress} className="h-2 bg-slate-100 dark:bg-slate-800" />
                                <p className="text-xs text-slate-400 mt-2">Target Rencana: {activeProject.plannedProgress}%</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Deviasi Progres</CardTitle>
                                {activeProject.deviation < 0 ? (
                                    <TrendingDown className="h-4 w-4 text-rose-500" />
                                ) : (
                                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                                )}
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className={`text-2xl font-bold ${activeProject.deviation < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                    {activeProject.deviation}%
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    {activeProject.deviation < 0 ? "Keterlambatan S-Curve" : "Mendahului Target"}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Efisiensi Biaya</CardTitle>
                                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="text-xl font-bold text-slate-800 dark:text-white">
                                    {formattedCurrency(activeProject.actualCost)}
                                </div>
                                <p className="text-xs text-slate-400 mt-2">Dari Budget: {formattedCurrency(activeProject.budget)}</p>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                     <div className="col-span-3 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
                        Pilih proyek untuk melihat detail
                     </div>
                )}
            </div>

            {/* S-Curve View */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <div>
                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Grafik Batas Kontrol (S-Curve Monitor)</h3>
                            <p className="text-xs text-slate-400">Komparasi Mingguan Rencana vs Realisasi Aktual</p>
                        </div>
                    </div>
                    {/* Project Selector */}
                    <div className="relative min-w-[250px]">
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="" disabled>Pilih Project...</option>
                            {allProjects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    </div>
                </div>

                {activeProject && scurveData.length > 0 ? (
                    <div className="w-full h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={formatSCurveData()}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{fontSize: 12, fill: '#94a3b8'}}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis 
                                    domain={[0, 100]} 
                                    tick={{fontSize: 12, fill: '#94a3b8'}}
                                    tickFormatter={(val) => `${val}%`}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`${value}%`, '']}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line 
                                    type="monotone" 
                                    dataKey="Rencana (%)" 
                                    stroke="#94a3b8" 
                                    strokeWidth={3}
                                    strokeDasharray="5 5"
                                    dot={{ r: 4, fill: '#94a3b8' }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="Aktual (%)" 
                                    stroke="#4f46e5" 
                                    strokeWidth={4}
                                    dot={{ r: 5, fill: '#4f46e5' }}
                                    activeDot={{ r: 7 }}
                                    connectNulls
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[350px] flex items-center justify-center text-slate-400 text-sm">
                        Data S-Curve belum tersedia untuk proyek ini.
                    </div>
                )}
            </div>

            {/* Kanban Board */}
            {activeProject && (
                <KanbanBoard tasks={tasks} />
            )}
        </div>
    );
}

interface KanbanBoardProps {
    tasks: Task[];
}

function KanbanBoard({ tasks }: KanbanBoardProps) {
    const columns = [
        { title: 'Not Started', key: 'NOT_STARTED', bg: 'bg-slate-100 dark:bg-slate-800/40' },
        { title: 'In Progress', key: 'ON_PROGRESS', bg: 'bg-amber-50/40 dark:bg-amber-950/10' },
        { title: 'Done', key: 'DONE', bg: 'bg-emerald-50/40 dark:bg-emerald-950/10' }
    ];

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Task Management Board</h2>
                <p className="text-sm text-slate-500">Distribusi beban kerja tim lapangan secara real-time</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map((col) => (
                    <div key={col.key} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-800 ${col.bg} min-h-[450px] flex flex-col`}>
                        <div className="flex justify-between items-center mb-4 border-b dark:border-slate-800 pb-2">
                            <h4 className="font-bold text-slate-700 dark:text-slate-300">{col.title}</h4>
                            <span className="bg-slate-200 dark:bg-slate-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                                {tasks.filter(t => t.status === col.key).length}
                            </span>
                        </div>

                        <div className="space-y-3 flex-1 overflow-y-auto">
                            {tasks.filter(t => t.status === col.key).map((task) => (
                                <Card key={task.id} className="hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors shadow-sm bg-white dark:bg-slate-800">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex justify-between items-start gap-2">
                                            <h5 className="font-medium text-sm text-slate-900 dark:text-white line-clamp-2">{task.name}</h5>
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap ${task.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400' :
                                                    task.priority === 'HIGH' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                                                }`}>
                                                {task.priority}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                                            <span>PIC: <strong>{task.pic}</strong></span>
                                            <span>{task.progress}%</span>
                                        </div>

                                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                            <div style={{ width: `${task.progress}%` }} className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full"></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {tasks.filter(t => t.status === col.key).length === 0 && (
                                <div className="text-center py-8 text-xs text-slate-400 italic">
                                    Tidak ada tugas dalam status ini
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}