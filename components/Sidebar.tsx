'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/utils/string';
import { 
  LayoutDashboard, 
  Lightbulb, 
  Terminal, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  X, 
  Layers 
} from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Ideas', href: '/dashboard/ideas', icon: Lightbulb },
    { name: 'Prompts', href: '/dashboard/prompts', icon: Terminal },
    { name: 'Assets', href: '/dashboard/assets', icon: ImageIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const sidebarContent = (isMobile = false) => {
    return (
      <>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold tracking-tight text-white text-lg">
              {isMobile ? 'AI Factory' : 'AI Content Factory'}
            </span>
          </div>
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-white'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-border/30 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary/30 to-accent/30 border border-primary/20 flex items-center justify-center font-bold text-xs text-indigo-300">
              {getInitials(user.email || '')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.user_metadata?.full_name || 'Creator Pro'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isMobile) setSidebarOpen(false);
              signOut();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 text-xs text-muted-foreground transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-border/40 z-20 shrink-0">
        {sidebarContent(false)}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          
          <aside className="relative flex flex-col w-64 max-w-xs h-full bg-[#0b0f19] border-r border-border/40 z-50 animate-slide-in">
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
