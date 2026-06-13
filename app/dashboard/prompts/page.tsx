'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { getAIProvider } from '@/lib/ai/provider';
import Link from 'next/link';
import { Idea, Prompt } from '@/types';
import { 
  Terminal, 
  Sparkles, 
  Save, 
  Lightbulb, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';

export default function PromptsPage() {
  const { user } = useAuth();
  
  // List states
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  
  // Selection states
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [promptData, setPromptData] = useState<Prompt | null>(null);
  
  // Action states
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchIdeas = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingIdeas(true);
      const { data, error } = await supabase
        .from('ideas')
        .select('id, title, category, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
      
      // Auto-select first idea if available (using functional update to decouple dependency)
      if (data && data.length > 0) {
        setSelectedIdea(prev => prev || data[0]);
      }
    } catch (err) {
      console.error('Error fetching ideas:', err);
    } finally {
      setLoadingIdeas(false);
    }
  }, [user]);

  const fetchPromptsForSelectedIdea = useCallback(async () => {
    if (!selectedIdea) return;
    try {
      setPromptData(null);
      setErrorMsg('');
      setSuccessMsg('');
      
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('idea_id', selectedIdea.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setPromptData(data);
      }
    } catch (err) {
      console.error('Error fetching prompts:', err);
    }
  }, [selectedIdea]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchIdeas();
  }, [user, fetchIdeas]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPromptsForSelectedIdea();
  }, [selectedIdea, fetchPromptsForSelectedIdea]);

  const handleGenerateAI = async () => {
    if (!selectedIdea) return;
    setGenerating(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const ai = getAIProvider();
      const generated = await ai.generatePrompt(selectedIdea.title, selectedIdea.category);
      
      setPromptData({
        idea_id: selectedIdea.id,
        image_prompt: generated.image_prompt,
        video_prompt: generated.video_prompt,
        description_prompt: generated.description_prompt
      });
      setSuccessMsg('AI scripts generated successfully! Preview below and save.');
    } catch (err: any) {
      setErrorMsg(err.message || 'AI Prompt generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedIdea || !promptData || !user) return;
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Check if prompt row already exists
      const { data: existing, error: checkError } = await supabase
        .from('prompts')
        .select('id')
        .eq('idea_id', selectedIdea.id)
        .maybeSingle();

      if (checkError) throw checkError;

      let saveError;
      if (existing) {
        // Update
        const { error } = await supabase
          .from('prompts')
          .update({
            image_prompt: promptData.image_prompt,
            video_prompt: promptData.video_prompt,
            description_prompt: promptData.description_prompt
          })
          .eq('idea_id', selectedIdea.id);
        saveError = error;
      } else {
        // Insert
        const { error } = await supabase
          .from('prompts')
          .insert({
            idea_id: selectedIdea.id,
            user_id: user.id,
            image_prompt: promptData.image_prompt,
            video_prompt: promptData.video_prompt,
            description_prompt: promptData.description_prompt
          });
        saveError = error;
      }

      if (saveError) throw saveError;

      // Update idea status to 'pending' (if it is currently 'draft')
      if (selectedIdea.status === 'draft') {
        const { error: ideaError } = await supabase
          .from('ideas')
          .update({ status: 'pending' })
          .eq('id', selectedIdea.id);
        
        if (ideaError) throw ideaError;
        
        // Update local ideas list state
        setIdeas(prev => prev.map(i => i.id === selectedIdea.id ? { ...i, status: 'pending' } : i));
        setSelectedIdea(prev => prev ? { ...prev, status: 'pending' } : null);
      }

      setSuccessMsg('Prompts and scripts saved securely to the database!');
      
      // Refresh prompt data
      fetchPromptsForSelectedIdea();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save prompts.');
    } finally {
      setSaving(false);
    }
  };

  const updatePromptField = (field: keyof Prompt, value: string) => {
    setPromptData(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      
      {/* Left Column: Ideas List */}
      <div className="lg:col-span-4 space-y-4">
        <div className="p-6 rounded-2xl glass-panel h-[600px] flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
            <Lightbulb className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Select Idea to Script</h2>
          </div>

          {loadingIdeas ? (
            <div className="flex-1 space-y-3 overflow-y-auto">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : ideas.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <Lightbulb className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-xs">No ideas generated yet.</p>
              <Link href="/dashboard/ideas" className="text-primary hover:underline text-xs mt-2 font-semibold">
                Go to Ideas board &rarr;
              </Link>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {ideas.map((idea) => {
                const isSelected = selectedIdea?.id === idea.id;
                return (
                  <button
                    key={idea.id}
                    onClick={() => setSelectedIdea(idea)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected 
                        ? 'bg-primary/10 border-primary text-white' 
                        : 'bg-black/20 border-white/5 hover:border-white/10 text-muted-foreground hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-300">
                        {idea.category}
                      </p>
                      <h4 className="font-semibold text-xs truncate leading-snug">{idea.title}</h4>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? 'translate-x-1 text-primary' : 'opacity-40'}`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Prompt Script Builder */}
      <div className="lg:col-span-8 space-y-4">
        {selectedIdea ? (
          <div className="p-6 rounded-2xl glass-panel min-h-[600px] flex flex-col justify-between">
            <div>
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                    Active Idea Workshop
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1.5">{selectedIdea.title}</h2>
                </div>

                {!promptData && (
                  <button
                    onClick={handleGenerateAI}
                    disabled={generating}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white font-semibold text-xs shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50 transition-all shrink-0"
                  >
                    {generating ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Generate Prompts</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Success/Error Alerts */}
              {successMsg && (
                <div className="mb-6 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="mb-6 p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Prompts Workshop Interface */}
              {promptData ? (
                <div className="space-y-6">
                  
                  {/* Image Prompt */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-indigo-400" />
                      Midjourney / Image Generator Prompt
                    </label>
                    <textarea
                      rows={3}
                      value={promptData.image_prompt || ''}
                      onChange={(e) => updatePromptField('image_prompt', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-muted-foreground focus:text-white font-mono leading-relaxed"
                      placeholder="Enter detailed prompt for generating visual thumbnail or cover images..."
                    />
                  </div>

                  {/* Video Prompt */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white flex items-center gap-2">
                      <Video className="h-4 w-4 text-purple-400" />
                      Sora / Video Generator Prompt
                    </label>
                    <textarea
                      rows={3}
                      value={promptData.video_prompt || ''}
                      onChange={(e) => updatePromptField('video_prompt', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-muted-foreground focus:text-white font-mono leading-relaxed"
                      placeholder="Enter prompt script instructions for text-to-video tools..."
                    />
                  </div>

                  {/* Caption/Description Prompt */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white flex items-center gap-2">
                      <FileText className="h-4 w-4 text-pink-400" />
                      Social Media Caption & Tags Script
                    </label>
                    <textarea
                      rows={4}
                      value={promptData.description_prompt || ''}
                      onChange={(e) => updatePromptField('description_prompt', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-muted-foreground focus:text-white leading-relaxed"
                      placeholder="Generate copy text, bullet points, and optimized hashtags for publishing channels..."
                    />
                  </div>

                </div>
              ) : (
                <div className="flex-1 py-20 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <Terminal className="h-12 w-12 mb-3 opacity-30 animate-pulse-slow" />
                  <h3 className="font-semibold text-white">No Script Data Generated</h3>
                  <p className="text-xs mt-1 max-w-sm">
                    Generate visual prompts and publication scripts using the AI generator tool above.
                  </p>
                  
                  <button
                    onClick={handleGenerateAI}
                    disabled={generating}
                    className="mt-6 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {generating ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Brainstorm Scripts with AI</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions Row */}
            {promptData && (
              <div className="flex gap-3 justify-end pt-5 border-t border-white/5 mt-8">
                <button
                  onClick={handleGenerateAI}
                  disabled={generating || saving}
                  className="px-4 py-2 text-xs font-semibold text-indigo-300 hover:text-white rounded-xl border border-indigo-500/20 hover:bg-indigo-500/10 cursor-pointer disabled:opacity-50"
                >
                  Regenerate AI
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save Scripts
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 rounded-2xl glass-panel h-[600px] flex flex-col items-center justify-center text-center text-muted-foreground border border-white/5">
            <Terminal className="h-12 w-12 mb-3 opacity-20" />
            <h3 className="font-semibold text-white">Select a Content Concept</h3>
            <p className="text-xs mt-1 max-w-xs">
              Select an idea from the list to start building prompts and social scripts.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
