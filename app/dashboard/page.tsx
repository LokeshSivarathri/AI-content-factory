'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { 
  generateDailyContentIdeas,
  generatePromptsForPendingIdeas,
  moveCompletedAssetsToReady
} from '@/services/workflows';
import { WorkflowLog } from '@/types';
import { 
  Lightbulb, 
  Terminal, 
  Play, 
  Sparkles,
  Clock,
  CheckCircle2,
  TerminalSquare
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pending: 0,
    completed: 0,
    recentIdeasCount: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Workflows execution state
  const [workflowRunning, setWorkflowRunning] = useState<string | null>(null);
  const [workflowLogs, setWorkflowLogs] = useState<WorkflowLog[]>([]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingStats(true);
      
      // Get ideas counts
      const { data: ideas, error } = await supabase
        .from('ideas')
        .select('id, status')
        .eq('user_id', user.id);

      if (error) throw error;

      const total = ideas?.length || 0;
      const draft = ideas?.filter(i => i.status === 'draft').length || 0;
      const pending = ideas?.filter(i => i.status === 'pending').length || 0;
      const completed = ideas?.filter(i => i.status === 'completed').length || 0;

      setStats({
        total,
        draft,
        pending,
        completed,
        recentIdeasCount: total > 5 ? 5 : total
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, [user, fetchStats]);

  const addLog = (workflowName: string, status: 'success' | 'failed' | 'info', message: string, details?: any) => {
    const newLog: WorkflowLog = {
      timestamp: new Date().toLocaleTimeString(),
      workflow: workflowName,
      status,
      message,
      details
    };
    setWorkflowLogs(prev => [newLog, ...prev].slice(0, 20));
  };

  const runWorkflow = async (workflowId: number) => {
    if (!user) return;
    
    if (workflowId === 1) {
      setWorkflowRunning('daily-ideas');
      addLog('Daily Ideas Generator', 'info', 'Triggering idea brainstorm generation...');
      
      const res = await generateDailyContentIdeas(user.id);
      if (res.success) {
        addLog('Daily Ideas Generator', 'success', `Successfully generated ${res.count} content ideas!`, res.ideas);
        await fetchStats();
      } else {
        addLog('Daily Ideas Generator', 'failed', `Error: ${res.error}`);
      }
      setWorkflowRunning(null);
    } 
    
    else if (workflowId === 2) {
      setWorkflowRunning('pending-prompts');
      addLog('Prompt Workshop Auto-Build', 'info', 'Scanning draft ideas and writing prompt scripts...');
      
      const res = await generatePromptsForPendingIdeas(user.id);
      if (res.success) {
        addLog('Prompt Workshop Auto-Build', 'success', `Created scripts/prompts for ${res.count} ideas!`, res.prompts);
        await fetchStats();
      } else {
        addLog('Prompt Workshop Auto-Build', 'failed', `Error: ${res.error}`);
      }
      setWorkflowRunning(null);
    } 
    
    else if (workflowId === 3) {
      setWorkflowRunning('asset-check');
      addLog('Asset State Advancer', 'info', 'Verifying uploaded files and updating project boards...');
      
      const res = await moveCompletedAssetsToReady(user.id);
      if (res.success) {
        addLog('Asset State Advancer', 'success', `Advanced state for ${res.count} items with attached assets.`, res.updatedIdeas);
        await fetchStats();
      } else {
        addLog('Asset State Advancer', 'failed', `Error: ${res.error}`);
      }
      setWorkflowRunning(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Creative Control Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back. Monitor stats, run automations, and manage your asset creation.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/ideas" 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-md hover:bg-primary/90 transition-all duration-200 cursor-pointer"
          >
            <Lightbulb className="h-4 w-4" />
            <span>Brainstorm Idea</span>
          </Link>
        </div>
      </div>

      {/* Grid of Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Content Ideas', value: stats.total, icon: Lightbulb, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { title: 'Draft Brainstorms', value: stats.draft, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { title: 'Pending Prompt/Media', value: stats.pending, icon: Terminal, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { title: 'Completed Deliverables', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl glass-card relative overflow-hidden flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.title}</p>
              {loadingStats ? (
                <div className="h-8 w-16 bg-white/5 animate-pulse rounded-lg" />
              ) : (
                <h3 className="text-3xl font-bold text-white font-mono">{stat.value}</h3>
              )}
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Main content widgets grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Workflows Console */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl glass-panel relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Workflow Automations</h2>
              </div>
              <span className="text-xs text-indigo-300 font-mono">Antigravity Actions</span>
            </div>

            <div className="space-y-4">
              {/* Workflow 1 */}
              <div className="p-4 rounded-xl border border-border/50 bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-500/20 transition-all">
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-indigo-400" />
                    Workflow 1: Daily Content Ideation
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Brainstorm 3 viral-ready concepts based on trending topics and save them as drafts.
                  </p>
                </div>
                <button
                  onClick={() => runWorkflow(1)}
                  disabled={workflowRunning !== null}
                  className="px-4 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 border border-indigo-500/20 cursor-pointer disabled:opacity-50"
                >
                  {workflowRunning === 'daily-ideas' ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-300 border-t-transparent" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Execute
                </button>
              </div>

              {/* Workflow 2 */}
              <div className="p-4 rounded-xl border border-border/50 bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-purple-500/20 transition-all">
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-purple-400" />
                    Workflow 2: Generate Prompts for Drafts
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Generate multi-modal prompts (image, video, caption) for all draft ideas.
                  </p>
                </div>
                <button
                  onClick={() => runWorkflow(2)}
                  disabled={workflowRunning !== null}
                  className="px-4 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 border border-purple-500/20 cursor-pointer disabled:opacity-50"
                >
                  {workflowRunning === 'pending-prompts' ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-purple-300 border-t-transparent" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Execute
                </button>
              </div>

              {/* Workflow 3 */}
              <div className="p-4 rounded-xl border border-border/50 bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/20 transition-all">
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                    Workflow 3: Move Completed Assets
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Find pending ideas with uploaded assets and transition status to completed.
                  </p>
                </div>
                <button
                  onClick={() => runWorkflow(3)}
                  disabled={workflowRunning !== null}
                  className="px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 border border-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  {workflowRunning === 'asset-check' ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-300 border-t-transparent" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Execute
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Execution Logs Console */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl glass-panel flex flex-col h-full min-h-[350px]">
            <div className="flex items-center justify-between mb-4 border-b border-border/30 pb-3">
              <div className="flex items-center gap-2">
                <TerminalSquare className="h-5 w-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Live Execution Terminal</h2>
              </div>
              {workflowLogs.length > 0 && (
                <button 
                  onClick={() => setWorkflowLogs([])}
                  className="text-[10px] text-muted-foreground hover:text-white cursor-pointer"
                >
                  Clear Logs
                </button>
              )}
            </div>

            {/* Terminal Window content */}
            <div className="flex-1 bg-black/50 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-3 border border-white/5 max-h-[320px]">
              {workflowLogs.length === 0 ? (
                <div className="text-muted-foreground/60 h-full flex flex-col items-center justify-center py-12 text-center">
                  <Terminal className="h-8 w-8 mb-2 opacity-30 animate-pulse-slow" />
                  <p>Console idle.</p>
                  <p className="text-[10px] mt-1">Execute a workflow automation to view live logging.</p>
                </div>
              ) : (
                workflowLogs.map((log, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-start justify-between text-[10px] text-muted-foreground/80">
                      <span>[{log.timestamp}] - {log.workflow}</span>
                      <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                        log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                        log.status === 'failed' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-white text-xs leading-relaxed">{log.message}</p>
                    {log.details && (
                      <pre className="text-[10px] text-indigo-300 bg-white/5 p-2 rounded border border-white/5 overflow-x-auto mt-1 max-h-[80px]">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
