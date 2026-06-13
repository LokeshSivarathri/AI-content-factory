'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Bell } from 'lucide-react';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Overview';
    const parts = pathname.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border/40 backdrop-blur-md bg-[#030712]/30 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white md:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <h2 className="text-sm font-semibold tracking-wide uppercase text-indigo-300 font-mono hidden md:inline-block">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Workspace Connection State indicator */}
        <div className="text-xs text-muted-foreground border border-border/50 rounded-full px-3 py-1 font-mono flex items-center gap-1.5 bg-black/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live Workspace
        </div>
        
        <button 
          className="p-1.5 rounded-full hover:bg-white/5 text-muted-foreground hover:text-white relative cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>
      </div>
    </header>
  );
}
