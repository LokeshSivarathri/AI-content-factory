'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { 
  Settings, 
  Cpu, 
  Terminal, 
  Database, 
  Trash2, 
  Github, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  Code
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  
  // Settings states
  const [clearingDb, setClearingDb] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleClearDatabase = async () => {
    if (!user) return;
    if (!confirm('WARNING: This will permanently delete all your Ideas, Prompts, and uploaded Assets from this account. This cannot be undone. Proceed?')) return;
    
    setClearingDb(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Deleting ideas will cascade delete prompts and assets due to foreign key cascade constraint!
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setSuccessMsg('Your workshop database has been reset. All ideas, prompts, and asset bindings are cleared.');
    } catch (err: any) {
      console.error('Error clearing database:', err);
      setErrorMsg(err.message || 'Failed to clear database.');
    } finally {
      setClearingDb(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Settings className="h-8 w-8 text-indigo-400" />
          System Settings & Setup
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure AI providers, manage database contents, and view developer configurations.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-sm flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card 1: AI Engine Configuration */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Cpu className="h-4.5 w-4.5 text-indigo-400" />
            AI Provider Engine
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Active Implementation</span>
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                MockAIProvider
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                Generates high-quality simulated content ideas, prompts, and social media captions without requiring paid APIs or hitting token rate limits. Perfect for local development.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white">How to transition to OpenAI:</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The AI layer is structured with an interface abstraction. To switch to live GPT-4o-mini generation, configure the environment variable:
              </p>
              <pre className="text-[10px] text-indigo-300 bg-black/60 p-3 rounded-lg border border-white/5 font-mono">
                OPENAI_API_KEY=sk-proj-...
              </pre>
              <p className="text-xs text-muted-foreground">
                No code modification is needed. The factory resolves to `OpenAIProvider` automatically once a real key starting with `sk-` is supplied.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Database Wiping Tools */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Database className="h-4.5 w-4.5 text-indigo-400" />
            Database & Reset Tools
          </h2>

          <div className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              If you want to clear your workspace to test onboarding sequences, run custom scripts, or reset stats, you can purge your user-bound data tables below.
            </p>

            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-3">
              <h4 className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Destructive Zone
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Clearing will delete all database records in `ideas`, `prompts`, and `assets` linked to your user account.
              </p>
              <button
                onClick={handleClearDatabase}
                disabled={clearingDb}
                className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 border border-red-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {clearingDb ? 'Purging records...' : 'Clear User Database'}
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Antigravity Automation Documentation */}
        <div className="p-6 rounded-2xl glass-panel space-y-4 lg:col-span-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Terminal className="h-4.5 w-4.5 text-indigo-400" />
            Antigravity Automations & Workflows
          </h2>

          <div className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              This application is designed to support custom background pipelines or trigger events autonomously using Antigravity. The three core workflows are implemented as modular service functions under `services/workflows.ts`:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-white/5 bg-black/20 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
                  <Code className="h-4 w-4" />
                  <span>Workflow 1</span>
                </div>
                <h4 className="text-xs font-semibold text-white">Daily Ideation</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Brainstorms daily trends and registers new content as `draft` items.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-black/20 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs">
                  <Code className="h-4 w-4" />
                  <span>Workflow 2</span>
                </div>
                <h4 className="text-xs font-semibold text-white">Auto-Prompt Write</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Generates image and video prompts for pending drafts and marks them as `pending`.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-black/20 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
                  <Code className="h-4 w-4" />
                  <span>Workflow 3</span>
                </div>
                <h4 className="text-xs font-semibold text-white">Asset Verification</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Scans files and advances state to `completed` once storage links exist.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white">Triggering from Antigravity:</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Antigravity or external cron triggers can invoke these workflows programmatically. The logic is fully decoupled from the UI, so you can run them via a serverless cron job, a Github Action, or an API webhook that signs in as service role and executes the functions.
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Developer Portfolio Details */}
        <div className="p-6 rounded-2xl glass-panel space-y-4 lg:col-span-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Github className="h-4.5 w-4.5 text-indigo-400" />
            B.Tech Student Portfolio Registry
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-xs text-muted-foreground">Project Name:</span>
                <span className="text-xs font-semibold text-white font-mono">AI Content Factory</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-xs text-muted-foreground">Framework:</span>
                <span className="text-xs font-semibold text-white">Next.js 16 (App Router)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-xs text-muted-foreground">Backend Stack:</span>
                <span className="text-xs font-semibold text-white">Supabase / PostgreSQL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Status:</span>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Production Ready
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a 
                href="https://github.com/LokeshSivarathri/AI-content-factory/tree/main" 
                target="_blank" 
                rel="noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-xl border border-white/10 hover:border-indigo-500/20 bg-black/25 text-xs text-muted-foreground hover:text-white transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Github className="h-4.5 w-4.5" />
                  <span>GitHub Repository</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <a 
                href="https://hxeasgefodlpwqrvrndp.supabase.co" 
                target="_blank" 
                rel="noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-xl border border-white/10 hover:border-indigo-500/20 bg-black/25 text-xs text-muted-foreground hover:text-white transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Database className="h-4.5 w-4.5" />
                  <span>Supabase Console</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
