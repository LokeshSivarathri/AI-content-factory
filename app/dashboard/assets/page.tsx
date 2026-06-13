'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { uploadAsset, deleteAsset } from '@/lib/supabase/storage';
import { Idea, Asset } from '@/types';
import { 
  Image as ImageIcon, 
  Video, 
  Upload, 
  Trash2, 
  Plus, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  Play,
  FileUp
} from 'lucide-react';

export default function AssetsPage() {
  const { user } = useAuth();
  
  // Data states
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Form input states
  const [selectedIdeaId, setSelectedIdeaId] = useState('');
  const [assetType, setAssetType] = useState<'image' | 'video'>('image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Alert messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Selected media zoom preview
  const [previewMedia, setPreviewMedia] = useState<Asset | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // Fetch ideas to populate selection dropdown
      const { data: ideasData, error: ideasError } = await supabase
        .from('ideas')
        .select('id, title, category, status, created_at')
        .eq('user_id', user.id);

      if (ideasError) throw ideasError;
      setIdeas(ideasData || []);
      if (ideasData && ideasData.length > 0) {
        setSelectedIdeaId(ideasData[0].id);
      }

      // Fetch assets with joined ideas table for metadata display
      const { data: assetsData, error: assetsError } = await supabase
        .from('assets')
        .select(`
          id,
          idea_id,
          asset_type,
          file_url,
          created_at,
          ideas (
            title,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (assetsError) throw assetsError;
      setAssets((assetsData as unknown as Asset[]) || []);
    } catch (err: any) {
      console.error('Error fetching assets:', err);
      setErrorMsg(err.message || 'Failed to fetch asset library.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [user, fetchData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMsg('');
      setSuccessMsg('');

      // Auto detect type based on file format
      if (file.type.startsWith('video/')) {
        setAssetType('video');
      } else if (file.type.startsWith('image/')) {
        setAssetType('image');
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedFile) {
      setErrorMsg('Please select a file to upload.');
      return;
    }
    if (!selectedIdeaId) {
      setErrorMsg('Please select a content idea to link this asset to.');
      return;
    }
    if (!user) return;

    setUploading(true);
    try {
      // 1. Upload to storage bucket and get public URL
      const fileUrl = await uploadAsset(selectedFile, selectedIdeaId, assetType, user.id);

      // 2. Insert record in 'assets' table
      const { error: dbError } = await supabase
        .from('assets')
        .insert({
          idea_id: selectedIdeaId,
          user_id: user.id,
          asset_type: assetType,
          file_url: fileUrl
        });

      if (dbError) throw dbError;

      setSuccessMsg('Asset uploaded and linked to idea successfully!');
      setSelectedFile(null);
      
      // If file input DOM reference existed we would reset it, standard HTML form reset works
      const fileInput = document.getElementById('asset-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Refresh gallery list
      await fetchData();
    } catch (err: any) {
      console.error('Upload flow error:', err);
      setErrorMsg(err.message || 'File upload failed. Ensure storage bucket is created.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (asset: Asset) => {
    if (!confirm('Are you sure you want to delete this asset from storage and databases?')) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Delete from Supabase Storage
      await deleteAsset(asset.file_url);

      // 2. Delete database entry
      const { error: dbError } = await supabase
        .from('assets')
        .delete()
        .eq('id', asset.id);

      if (dbError) throw dbError;

      setSuccessMsg('Asset deleted from library.');
      setAssets(prev => prev.filter(a => a.id !== asset.id));
      if (previewMedia?.id === asset.id) setPreviewMedia(null);
    } catch (err: any) {
      console.error('Deletion error:', err);
      setErrorMsg(err.message || 'Failed to delete asset.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <ImageIcon className="h-8 w-8 text-indigo-400" />
          Digital Asset Gallery
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload and review images and videos generated for your active content concepts.
        </p>
      </div>

      {/* Grid: Upload Widget & Asset Library */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Upload form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl glass-panel relative">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Upload className="h-4.5 w-4.5 text-indigo-400" />
              Upload Digital Asset
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* Info alerts */}
              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Linked Idea dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Attach to Idea</label>
                <select
                  value={selectedIdeaId}
                  onChange={(e) => setSelectedIdeaId(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-white cursor-pointer"
                >
                  {ideas.length === 0 ? (
                    <option value="" disabled>No ideas available - create one first</option>
                  ) : (
                    ideas.map((idea) => (
                      <option key={idea.id} value={idea.id}>
                        [{idea.category}] {idea.title.slice(0, 40)}...
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Asset Type toggle buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Asset Type</label>
                <div className="grid grid-cols-2 gap-2 p-1 border border-white/10 rounded-xl bg-black/20">
                  <button
                    type="button"
                    onClick={() => setAssetType('image')}
                    className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                      assetType === 'image' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssetType('video')}
                    className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                      assetType === 'video' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    <Video className="h-3.5 w-3.5" />
                    Video
                  </button>
                </div>
              </div>

              {/* File input zone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Choose File</label>
                <div className="border border-dashed border-white/10 hover:border-indigo-500/30 rounded-2xl p-6 bg-black/30 hover:bg-black/40 text-center transition cursor-pointer relative group">
                  <input
                    type="file"
                    id="asset-file-input"
                    onChange={handleFileChange}
                    accept={assetType === 'image' ? 'image/*' : 'video/*'}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    required
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileUp className="h-8 w-8 text-muted-foreground group-hover:text-indigo-400 transition" />
                    <span className="text-xs font-semibold text-white">
                      {selectedFile ? selectedFile.name : 'Select media file'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {selectedFile 
                        ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` 
                        : `Upload JPEG, PNG, or MP4 formats`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={uploading || !selectedFile || !selectedIdeaId}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Uploading to Storage Bucket...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Publish Deliverable</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Media grid gallery */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl glass-panel h-[600px] flex flex-col">
            <h2 className="text-base font-bold text-white mb-4 border-b border-white/5 pb-3 flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-indigo-400 rotate-45" />
              Published Asset Library
            </h2>

            {loading ? (
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-36 rounded-xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : assets.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mb-2 opacity-25" />
                <h3 className="font-semibold text-white">Gallery is Empty</h3>
                <p className="text-xs max-w-xs mt-1">
                  Upload your first video clip or thumbnail image using the builder console on the left.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-4 pr-1">
                {assets.map((asset) => (
                  <div 
                    key={asset.id} 
                    className="group relative rounded-xl border border-white/5 bg-black/30 overflow-hidden flex flex-col justify-between h-44 hover:border-primary/40 transition-all duration-300"
                  >
                    {/* Media content thumbnail preview */}
                    <div className="flex-1 bg-black/60 relative flex items-center justify-center overflow-hidden">
                      {asset.asset_type === 'image' ? (
                        <img 
                          src={asset.file_url} 
                          alt="Thumbnail preview" 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                        />
                      ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <video 
                            src={asset.file_url} 
                            className="w-full h-full object-cover" 
                            muted 
                            playsInline 
                          />
                          <div className="absolute inset-0 bg-black/35 flex items-center justify-center group-hover:bg-black/20 transition">
                            <Play className="h-8 w-8 text-white/90 drop-shadow-md bg-primary/80 rounded-full p-2" />
                          </div>
                        </div>
                      )}

                      {/* Top Overlay details */}
                      <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10 opacity-0 group-hover:opacity-100 transition duration-300">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider text-white ${
                          asset.asset_type === 'image' ? 'bg-indigo-600' : 'bg-purple-600'
                        }`}>
                          {asset.asset_type}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setPreviewMedia(asset)}
                            className="p-1 rounded bg-black/60 hover:bg-black/80 text-white cursor-pointer"
                            title="Zoom View"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(asset)}
                            className="p-1 rounded bg-red-600/70 hover:bg-red-600 text-white cursor-pointer"
                            title="Delete Asset"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Metadata Info */}
                    <div className="p-3 bg-black/25 border-t border-white/5 space-y-1">
                      <p className="text-[10px] text-indigo-300 font-mono uppercase tracking-wider">
                        {asset.ideas?.category || 'Category'}
                      </p>
                      <h4 className="font-semibold text-xs text-white truncate">
                        {asset.ideas?.title || 'Untitled'}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Full screen Media Lightbox Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-md" 
            onClick={() => setPreviewMedia(null)} 
          />
          
          <div className="relative max-w-4xl w-full max-h-[85vh] bg-[#0b0f19] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-between z-10 animate-scale-up">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute right-4 top-4 text-white hover:text-indigo-400 p-1 rounded-lg bg-black/50 z-20"
            >
              <Plus className="h-6 w-6 rotate-45" />
            </button>

            <div className="w-full flex-1 flex items-center justify-center overflow-hidden min-h-[300px] mt-8 bg-black/40 rounded-xl border border-white/5">
              {previewMedia.asset_type === 'image' ? (
                <img 
                  src={previewMedia.file_url} 
                  alt="Zoom preview" 
                  className="max-w-full max-h-[60vh] object-contain" 
                />
              ) : (
                <video 
                  src={previewMedia.file_url} 
                  controls 
                  autoPlay 
                  className="max-w-full max-h-[60vh] rounded-lg" 
                />
              )}
            </div>

            <div className="w-full text-left mt-4 border-t border-white/5 pt-4 space-y-1">
              <span className="text-[10px] font-bold font-mono tracking-wider text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                {previewMedia.ideas?.category}
              </span>
              <h3 className="font-bold text-white text-base leading-snug mt-1">{previewMedia.ideas?.title}</h3>
              <p className="text-[10px] text-muted-foreground">
                Public File Path: <a href={previewMedia.file_url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-mono truncate max-w-md inline-block align-bottom">{previewMedia.file_url}</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
