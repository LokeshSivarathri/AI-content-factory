'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { getAIProvider } from '@/lib/ai/provider';
import { Idea } from '@/types';
import { 
  Lightbulb, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Sparkles, 
  X, 
  Grid, 
  List, 
  Clock, 
  Activity, 
  CheckCircle2, 
  Filter
} from 'lucide-react';

export default function IdeasPage() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('YouTube Video');
  const [status, setStatus] = useState('draft');
  const [topicPrompt, setTopicPrompt] = useState('');
  
  const [aiGenerating, setAiGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchIdeas = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
    } catch (err) {
      console.error('Error fetching ideas:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchIdeas();
  }, [user, fetchIdeas]);

  const openCreateModal = () => {
    setEditingIdea(null);
    setTitle('');
    setCategory('YouTube Video');
    setStatus('draft');
    setTopicPrompt('');
    setModalOpen(true);
  };

  const openEditModal = (idea: Idea) => {
    setEditingIdea(idea);
    setTitle(idea.title);
    setCategory(idea.category);
    setStatus(idea.status);
    setTopicPrompt('');
    setModalOpen(true);
  };

  const handleGenerateAI = async () => {
    if (!topicPrompt.trim()) return;
    setAiGenerating(true);
    try {
      const ai = getAIProvider();
      const result = await ai.generateIdea(topicPrompt, category);
      setTitle(result.title);
      setCategory(result.category);
    } catch (err) {
      console.error('AI idea generation failed:', err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category.trim()) return;
    if (!user) return;

    setSubmitting(true);
    try {
      if (editingIdea) {
        // Update
        const { error } = await supabase
          .from('ideas')
          .update({ title, category, status })
          .eq('id', editingIdea.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('ideas')
          .insert({
            title,
            category,
            status,
            user_id: user.id
          });

        if (error) throw error;
      }
      setModalOpen(false);
      fetchIdeas();
    } catch (err) {
      console.error('Error saving idea:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this idea? All associated prompts and assets will be deleted too.')) return;
    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setIdeas(prev => prev.filter(idea => idea.id !== id));
    } catch (err) {
      console.error('Error deleting idea:', err);
    }
  };

  // Get unique categories for dropdown filter
  const uniqueCategories = Array.from(new Set(ideas.map(i => i.category)));

  // Filtered Ideas
  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(search.toLowerCase()) || 
                          idea.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || idea.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Activity className="h-3 w-3" /> Pending Prompts
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="h-3 w-3" /> Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Lightbulb className="h-8 w-8 text-indigo-400" />
            Content Ideas Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Brainstorm, catalog, and filter your core content pillars.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold text-sm shadow-lg shadow-primary/20 cursor-pointer transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Content Idea</span>
        </button>
      </div>

      {/* Filter and View controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between border-b border-border/30 pb-5">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search ideas or platforms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-white"
          />
        </div>

        {/* Dropdown filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-2 bg-black/20 border border-white/10 px-3 py-1.5 rounded-xl">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-muted-foreground focus:outline-none cursor-pointer pr-4"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Drafts</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 bg-black/20 border border-white/10 px-3 py-1.5 rounded-xl">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs text-muted-foreground focus:outline-none cursor-pointer pr-4"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Grid/List switch */}
          <div className="flex items-center border border-white/10 rounded-xl p-1 bg-black/20">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg cursor-pointer ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg cursor-pointer ${viewMode === 'list' ? 'bg-primary text-white' : 'text-muted-foreground'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or List list of items */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filteredIdeas.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
          <Lightbulb className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3 animate-pulse" />
          <h3 className="font-semibold text-white">No Ideas Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Get started by creating a new content idea or execute the &quot;Daily Content Ideation&quot; workflow from the dashboard.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea) => (
            <div key={idea.id} className="p-6 rounded-2xl glass-card relative flex flex-col justify-between h-48 border border-white/10">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 font-mono">
                    {idea.category}
                  </span>
                  {getStatusBadge(idea.status)}
                </div>
                <h3 className="font-bold text-white text-base leading-snug line-clamp-2">{idea.title}</h3>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                <span className="text-[10px] text-muted-foreground">
                  Added {new Date(idea.created_at).toLocaleDateString()}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(idea)}
                    className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition cursor-pointer"
                    title="Edit Idea"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(idea.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition cursor-pointer"
                    title="Delete Idea"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIdeas.map((idea) => (
            <div key={idea.id} className="p-4 rounded-xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 font-mono">
                    {idea.category}
                  </span>
                  {getStatusBadge(idea.status)}
                </div>
                <h3 className="font-bold text-white text-sm">{idea.title}</h3>
              </div>

              <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                <span className="text-[10px] text-muted-foreground font-mono">
                  {new Date(idea.created_at).toLocaleDateString()}
                </span>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(idea)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(idea.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation / Editing Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          <div className="relative w-full max-w-lg p-6 rounded-2xl border border-white/15 bg-[#0b0f19] shadow-2xl z-10 animate-scale-up">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-white p-1 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Lightbulb className="h-5.5 w-5.5 text-indigo-400" />
              {editingIdea ? 'Modify Content Idea' : 'Add Content Concept'}
            </h2>

            {/* AI Generator Helper Section */}
            {!editingIdea && (
              <div className="mb-6 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-3">
                <label className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  AI Concept Brainstorm Generator
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter topic (e.g. Next.js performance, micro-habits)..."
                    value={topicPrompt}
                    onChange={(e) => setTopicPrompt(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-white"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={aiGenerating || !topicPrompt.trim()}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {aiGenerating ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Content Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Hidden Python Tips You Need To Know"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Category / Channel</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-white cursor-pointer"
                  >
                    <option value="YouTube Video">YouTube Video</option>
                    <option value="YouTube Short">YouTube Short</option>
                    <option value="TikTok Video">TikTok Video</option>
                    <option value="Instagram Reel">Instagram Reel</option>
                    <option value="Blog Post">Blog Post</option>
                    <option value="LinkedIn Guide">LinkedIn Guide</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-white cursor-pointer"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending Prompts</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-white rounded-xl border border-white/10 hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
