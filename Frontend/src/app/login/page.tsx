"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { KeyRound, ShieldAlert, Loader2, ShieldCheck } from "lucide-react";

// ── Inline Google "G" logo SVG ────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// ── Augment Window for Google GSI ────────────────────────────────────────────
declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
  const G_CLIENT = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [gsiReady,    setGsiReady]    = useState(false);

  // Keep a stable ref to the callback so we can swap it after init
  const callbackRef = useRef<(resp: any) => void>(() => {});

  // ── Google credential callback ────────────────────────────────────────────
  callbackRef.current = async (response: any) => {
    if (!response?.credential) {
      setError('Gagal mendapatkan kredensial dari Google.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login gagal. Coba lagi.');
        return;
      }
      localStorage.setItem('user_session', JSON.stringify(data));
      router.push('/dashboard');
    } catch {
      setError('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
    } finally {
      setLoading(false);
    }
  };

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // Already logged in? skip straight to dashboard
    if (localStorage.getItem('user_session')) {
      router.push('/dashboard');
      return;
    }

    if (!G_CLIENT) {
      // No client-id configured – still render page (demo buttons still work)
      setGsiReady(false);
      return;
    }

    // Load Google GSI script
    const script = document.createElement('script');
    script.src   = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: G_CLIENT,
        callback:  (r: any) => callbackRef.current(r),
        use_fedcm_for_prompt: false,
      });
      setGsiReady(true);
    };
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, [router, G_CLIENT]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleGoogleSignIn = () => {
    if (!G_CLIENT) {
      setError('Google Client ID belum dikonfigurasi. Tambahkan NEXT_PUBLIC_GOOGLE_CLIENT_ID ke .env.local, lalu restart dev server.');
      return;
    }
    if (!window.google) {
      setError('Google Sign-In belum siap. Refresh halaman dan coba lagi.');
      return;
    }
    setError('');
    window.google.accounts.id.prompt();
  };

  const handleDemoLogin = (role: 'admin' | 'pm') => {
    setLoading(true);
    const user = role === 'admin'
      ? { id: 'u-admin', email: 'admin@project.com', name: 'Administrator (Demo)', role: 'ADMIN' }
      : { id: 'u-pm',    email: 'pm@project.com',    name: 'Fadilah Riyadi (Demo)', role: 'PROJECT_MANAGER' };
    localStorage.setItem('user_session', JSON.stringify(user));
    router.push('/dashboard');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md border-slate-800 bg-slate-900/90 text-white shadow-2xl relative z-10 backdrop-blur-md">

        {/* ── Header ── */}
        <CardHeader className="space-y-3 text-center pb-8 border-b border-slate-800">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-1">
            <KeyRound className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Project Management System
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            Silakan masuk untuk mengelola proyek &amp; anggaran BOQ
          </CardDescription>
        </CardHeader>

        {/* ── Body ── */}
        <CardContent className="pt-7 space-y-6">

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-3 bg-red-950/40 border border-red-800/60 text-red-400 p-4 rounded-xl text-sm animate-in slide-in-from-top-1 duration-200">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Google Sign-In Button ── */}
          <button
            id="btn-google-signin"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="
              w-full flex items-center justify-center gap-3
              py-3 px-5
              bg-white text-gray-800 font-semibold text-sm
              rounded-xl shadow-md
              hover:bg-gray-50 active:scale-[.98]
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              border border-gray-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
            "
          >
            {loading
              ? <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
              : <GoogleIcon />
            }
            <span>Masuk dengan Google</span>
          </button>

          {/* ── Google setup hint (only shown when no client id) ── */}
          {!G_CLIENT && (
            <p className="text-center text-xs text-amber-400/80 bg-amber-950/30 border border-amber-800/40 rounded-lg px-3 py-2">
              ⚠️ Google Client ID belum diset. Gunakan RBAC Demo di bawah, atau ikuti panduan setup.
            </p>
          )}

          {/* ── RBAC Demo Section ── */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Uji Coba Cepat (RBAC Demo)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-demo-admin"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="
                  py-2.5 px-4 text-sm font-semibold
                  text-indigo-300 border border-indigo-800/60
                  rounded-lg bg-indigo-950/30
                  hover:bg-indigo-900/50 hover:border-indigo-600
                  active:scale-[.97]
                  transition-all duration-150
                  disabled:opacity-40 disabled:cursor-not-allowed
                "
              >
                🛡️ Admin
              </button>
              <button
                id="btn-demo-pm"
                onClick={() => handleDemoLogin('pm')}
                disabled={loading}
                className="
                  py-2.5 px-4 text-sm font-semibold
                  text-emerald-300 border border-emerald-800/60
                  rounded-lg bg-emerald-950/30
                  hover:bg-emerald-900/50 hover:border-emerald-600
                  active:scale-[.97]
                  transition-all duration-150
                  disabled:opacity-40 disabled:cursor-not-allowed
                "
              >
                📋 PM
              </button>
            </div>
            <p className="text-[11px] text-slate-600 text-center">
              Mode demo tidak memerlukan koneksi ke backend atau Google.
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
