-- Create ideas table
CREATE TABLE IF NOT EXISTS public.ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create prompts table
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    image_prompt TEXT,
    video_prompt TEXT,
    description_prompt TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_prompt_idea UNIQUE (idea_id)
);

-- Create assets table
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL, -- 'image' or 'video'
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read their own ideas" ON public.ideas;
DROP POLICY IF EXISTS "Users can insert their own ideas" ON public.ideas;
DROP POLICY IF EXISTS "Users can update their own ideas" ON public.ideas;
DROP POLICY IF EXISTS "Users can delete their own ideas" ON public.ideas;

DROP POLICY IF EXISTS "Users can read their own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can insert their own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can update their own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete their own prompts" ON public.prompts;

DROP POLICY IF EXISTS "Users can read their own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can insert their own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can update their own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can delete their own assets" ON public.assets;

-- Create policies for ideas
CREATE POLICY "Users can read their own ideas" ON public.ideas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ideas" ON public.ideas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas" ON public.ideas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas" ON public.ideas
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for prompts
CREATE POLICY "Users can read their own prompts" ON public.prompts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prompts" ON public.prompts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts" ON public.prompts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts" ON public.prompts
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for assets
CREATE POLICY "Users can read their own assets" ON public.assets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets" ON public.assets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets" ON public.assets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets" ON public.assets
    FOR DELETE USING (auth.uid() = user_id);

-- Initialize Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('content-videos', 'content-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for content-images bucket
DROP POLICY IF EXISTS "Allow authenticated upload to content-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read of content-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from content-images" ON storage.objects;

CREATE POLICY "Allow authenticated upload to content-images" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'content-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow authenticated read of content-images" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'content-images');

CREATE POLICY "Allow authenticated delete from content-images" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'content-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage policies for content-videos bucket
DROP POLICY IF EXISTS "Allow authenticated upload to content-videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read of content-videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from content-videos" ON storage.objects;

CREATE POLICY "Allow authenticated upload to content-videos" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'content-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow authenticated read of content-videos" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'content-videos');

CREATE POLICY "Allow authenticated delete from content-videos" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'content-videos' AND (storage.foldername(name))[1] = auth.uid()::text);
