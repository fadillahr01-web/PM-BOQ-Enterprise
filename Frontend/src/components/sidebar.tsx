"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Database, LogOut, User, Folder, ChevronDown, ChevronRight, CircleDot, FileText } from 'lucide-react';

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface MenuItem {
  title: string;
  icon: React.ComponentType<any>;
  path?: string;
  submenu?: { name: string; path: string }[];
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'Database Komponen BOQ': true
  });

  useEffect(() => {
    const session = localStorage.getItem('user_session');
    if (!session) {
      router.push('/login');
    } else {
      setUser(JSON.parse(session));
    }
  }, [router]);

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    router.push('/login');
  };

  if (!user) return null;

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard'
    },
    {
      title: 'Daftar Project',
      icon: Folder,
      path: '/projects'
    },
    {
      title: 'Pembuatan BOQ',
      icon: FileText,
      path: '/boq/new'
    },
    {
      title: 'Database Komponen BOQ',
      icon: Database,
      submenu: [
        { name: 'Kelola Master Data', path: '/settings/master-data' }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#0A1128] text-slate-100 flex flex-col h-screen border-r border-slate-800/60 shrink-0 select-none">
      {/* Brand logo */}
      <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
          PM
        </div>
        <div>
          <h2 className="font-extrabold text-sm tracking-widest text-slate-100">PM-BOQ ENTERPRISE</h2>
          <p className="text-[9px] text-slate-500 font-semibold tracking-wider">CONTROL CENTER</p>
        </div>
      </div>

      {/* User profile */}
      <div className="p-6 border-b border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
            <User className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="font-semibold text-sm truncate">{user.name}</h4>
            <span className="inline-block text-[9px] font-extrabold bg-indigo-900/50 text-indigo-300 border border-indigo-700 px-2 py-0.5 rounded-full mt-1 tracking-wider uppercase">
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasSubmenu = !!item.submenu;
          const isOpen = openMenus[item.title];

          if (!hasSubmenu) {
            const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
            return (
              <button
                key={item.title}
                onClick={() => item.path && router.push(item.path)}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </button>
            );
          }

          return (
            <div key={item.title} className="space-y-1">
              <button
                onClick={() => toggleMenu(item.title)}
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/30 hover:text-slate-100 transition duration-200"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              {/* Submenu with smooth transition */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pl-9 pr-2 space-y-1 py-0.5 border-l border-slate-800/60 ml-6">
                  {item.submenu?.map((sub) => {
                    const isSubActive = pathname === sub.path || pathname?.startsWith(sub.path + '/');
                    return (
                      <button
                        key={sub.name}
                        onClick={() => router.push(sub.path)}
                        className={`flex items-center gap-2.5 w-full py-2 px-3 rounded-md text-[13px] font-medium transition duration-200 ${
                          isSubActive
                            ? 'text-indigo-400 font-semibold bg-indigo-950/20'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <CircleDot className={`h-2.5 w-2.5 ${isSubActive ? 'text-indigo-400 fill-indigo-400' : 'text-slate-600'}`} />
                        <span>{sub.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Logout footer */}
      <div className="p-4 border-t border-slate-800/60">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition duration-200"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
