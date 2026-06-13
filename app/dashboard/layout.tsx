'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030712]">
        <div className="relative flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">Checking credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Let the redirect trigger
  }

  return (
    <div className="min-h-screen flex bg-[#030712] text-foreground font-sans">
      {/* Background radial effects */}
      <div className="fixed top-0 left-0 h-screen w-screen bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none z-0" />
      
      {/* Responsive Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Workspace Panel */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Dynamic Header */}
        <Header setSidebarOpen={setSidebarOpen} />

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

