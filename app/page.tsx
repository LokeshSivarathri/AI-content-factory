'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Terminal, Activity, Layers, ArrowRight, Lock, Mail, User as UserIcon, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setAuthLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        
        if (error) throw error;
        
        if (data.user && data.session === null) {
          setInfoMsg('Signup successful! Please check your email for confirmation link.');
        } else {
          setInfoMsg('Account created successfully!');
          router.push('/dashboard');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030712]">
        <div className="relative flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">Entering the Content Factory...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#030712] flex flex-col justify-between">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />
      
      {/* Navbar */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-border/40 backdrop-blur-md bg-[#030712]/30">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
            AI Content Factory
          </span>
        </div>
        <div className="text-xs text-muted-foreground border border-border/80 rounded-full px-3 py-1 font-mono flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          System Operational
        </div>
      </header>

      {/* Main Content Split Grid */}
      <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Product Intro */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            AI Content Workflow Automation
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">
            Scale Your Content Creation with{' '}
            <span className="bg-gradient-to-r from-primary via-indigo-300 to-accent bg-clip-text text-transparent">
              AI Automations
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl">
            A production-ready content generation factory. Automate idea brainstorming, social media prompts, and digital asset workflows in one workspace.
          </p>

          {/* Features bullet points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-start gap-3 p-3 rounded-xl border border-border/40 bg-card/40">
              <div className="mt-0.5 p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">AI Ideation Engine</h3>
                <p className="text-xs text-muted-foreground">Generate catchy, high-retention topics for YouTube, Reels, and Blogs.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-xl border border-border/40 bg-card/40">
              <div className="mt-0.5 p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Terminal className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Prompt Workshop</h3>
                <p className="text-xs text-muted-foreground">Craft detailed prompts for visual generators and copy assets.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-border/40 bg-card/40">
              <div className="mt-0.5 p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Supabase Storage</h3>
                <p className="text-xs text-muted-foreground">Cloud buckets configured with secure, user-bound RLS access.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-border/40 bg-card/40">
              <div className="mt-0.5 p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Workflow Automations</h3>
                <p className="text-xs text-muted-foreground">Antigravity-compatible workflows to run content tasks autonomously.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphic Auth Form */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl relative">
            <div className="absolute top-[-10px] right-[-10px] h-20 w-20 bg-primary/30 rounded-full blur-2xl -z-10" />
            
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {isSignUp ? 'Create your Account' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-muted-foreground mt-1.5">
                {isSignUp 
                  ? 'Access the full suite of AI content automations' 
                  : 'Enter details to access your creative workshop'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {infoMsg && (
                <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{infoMsg}</span>
                </div>
              )}

              {isSignUp && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-white"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-muted-foreground">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-2.5 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 cursor-pointer disabled:opacity-50"
              >
                {authLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs">
              <span className="text-muted-foreground">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className="text-primary hover:underline font-semibold"
              >
                {isSignUp ? 'Sign in' : 'Create account'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center border-t border-border/40 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} AI Content Factory. Built as a premium B.Tech Portfolio Project. Powered by Next.js & Supabase.
      </footer>
    </main>
  );
}
