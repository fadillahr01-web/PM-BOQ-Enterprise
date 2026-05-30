"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, RefreshCw, ChevronRight } from "lucide-react";

interface Project {
  id: string;
  name: string;
  clientName?: string;
  location?: string;
  budget?: number;
  actualCost?: number;
  startDate?: string;
  endDate?: string;
  plannedProgress?: number;
  actualProgress?: number;
  status?: string;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
  const { id: projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return setLoading(false);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/projects`);
      if (!res.ok) return setLoading(false);
      const list = await res.json();
      const found = list.find((p: any) => p.id === projectId);
      if (found) setProject(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportBOQToExcel = () => {
    if (!projectId) return;
    window.open(`${API_URL}/boq/${projectId}/export`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mr-3" />
        <span>Memuat data proyek...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Proyek tidak ditemukan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/projects")}>Kembali</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider mb-4">
        <span className="cursor-pointer hover:text-slate-600" onClick={() => router.push("/dashboard")}>
          Dashboard
        </span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-600">Detail Proyek</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>Klien: {project.clientName || "-"}</div>
            <div>Lokasi: {project.location || "-"}</div>
            <div>Status: {project.status || "-"}</div>
            <div className="pt-4">
              <Button onClick={exportBOQToExcel} className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" /> Cetak BOQ Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
