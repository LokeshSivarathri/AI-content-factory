import { supabase } from '@/lib/supabase/client';
import { getAIProvider } from '@/lib/ai/provider';

/**
 * Workflow 1: Generate daily content ideas.
 * Selects standard trending topics and categories, calls AI provider to brainstorm,
 * and saves new ideas in the database under the 'draft' status.
 */
export async function generateDailyContentIdeas(userId: string): Promise<{ success: boolean; count: number; ideas?: any[]; error?: string }> {
  try {
    const ai = getAIProvider();
    
    // Choose random trending topics and categories
    const categories = ['YouTube Short', 'TikTok Video', 'Instagram Reel', 'Blog Post', 'LinkedIn Guide'];
    const topics = [
      'Artificial Intelligence Trends',
      'Next.js 16 App Router Features',
      'Supabase Database Security & RLS',
      'Passive Income Ideas for developers',
      'No-Code Workflow Automations'
    ];

    const generatedIdeas = [];
    const countToGenerate = 3;

    for (let i = 0; i < countToGenerate; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const topic = topics[Math.floor(Math.random() * topics.length)];
      
      const res = await ai.generateIdea(topic, category);
      
      // Insert into supabase
      const { data, error } = await supabase
        .from('ideas')
        .insert({
          title: res.title,
          category: res.category,
          status: 'draft',
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        generatedIdeas.push(data);
      }
    }

    return { success: true, count: generatedIdeas.length, ideas: generatedIdeas };
  } catch (err: any) {
    console.error('Error in generateDailyContentIdeas:', err);
    return { success: false, count: 0, error: err.message };
  }
}

/**
 * Workflow 2: Generate prompts for pending ideas.
 * Finds all 'draft' ideas that do not have prompts yet,
 * generates AI prompts (image, video, description), saves them,
 * and updates the idea status to 'pending'.
 */
export async function generatePromptsForPendingIdeas(userId: string): Promise<{ success: boolean; count: number; prompts?: any[]; error?: string }> {
  try {
    const ai = getAIProvider();

    // 1. Fetch ideas with 'draft' status for this user
    const { data: ideas, error: fetchError } = await supabase
      .from('ideas')
      .select('id, title, category')
      .eq('user_id', userId)
      .eq('status', 'draft');

    if (fetchError) throw fetchError;
    if (!ideas || ideas.length === 0) {
      return { success: true, count: 0, prompts: [] };
    }

    const generatedPrompts = [];

    for (const idea of ideas) {
      // Check if prompt already exists to avoid conflict
      const { data: existingPrompt } = await supabase
        .from('prompts')
        .select('id')
        .eq('idea_id', idea.id)
        .maybeSingle();

      if (existingPrompt) {
        // Just update status to pending
        await supabase.from('ideas').update({ status: 'pending' }).eq('id', idea.id);
        continue;
      }

      // Generate prompts
      const promptsData = await ai.generatePrompt(idea.title, idea.category);

      // Insert prompt
      const { data: newPrompt, error: insertError } = await supabase
        .from('prompts')
        .insert({
          idea_id: idea.id,
          user_id: userId,
          image_prompt: promptsData.image_prompt,
          video_prompt: promptsData.video_prompt,
          description_prompt: promptsData.description_prompt
        })
        .select()
        .single();

      if (insertError) {
        console.error(`Error saving prompts for idea ${idea.id}:`, insertError);
        continue;
      }

      // Update idea status to 'pending'
      await supabase
        .from('ideas')
        .update({ status: 'pending' })
        .eq('id', idea.id);

      if (newPrompt) {
        generatedPrompts.push(newPrompt);
      }
    }

    return { success: true, count: generatedPrompts.length, prompts: generatedPrompts };
  } catch (err: any) {
    console.error('Error in generatePromptsForPendingIdeas:', err);
    return { success: false, count: 0, error: err.message };
  }
}

/**
 * Workflow 3: Move completed assets to ready state.
 * Scans ideas that are currently 'pending' and check if they have assets uploaded.
 * If an idea has at least one asset uploaded, we advance its status to 'completed'.
 */
export async function moveCompletedAssetsToReady(userId: string): Promise<{ success: boolean; count: number; updatedIdeas?: string[]; error?: string }> {
  try {
    // 1. Fetch pending ideas
    const { data: ideas, error: fetchError } = await supabase
      .from('ideas')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (fetchError) throw fetchError;
    if (!ideas || ideas.length === 0) {
      return { success: true, count: 0, updatedIdeas: [] };
    }

    const updatedIdeas = [];

    for (const idea of ideas) {
      // Check if there are any assets for this idea
      const { data: assets, error: assetError } = await supabase
        .from('assets')
        .select('id')
        .eq('idea_id', idea.id)
        .limit(1);

      if (assetError) {
        console.error(`Error checking assets for idea ${idea.id}:`, assetError);
        continue;
      }

      if (assets && assets.length > 0) {
        // Update idea status to 'completed'
        const { error: updateError } = await supabase
          .from('ideas')
          .update({ status: 'completed' })
          .eq('id', idea.id);

        if (updateError) {
          console.error(`Error updating status for idea ${idea.id}:`, updateError);
        } else {
          updatedIdeas.push(idea.id);
        }
      }
    }

    return { success: true, count: updatedIdeas.length, updatedIdeas };
  } catch (err: any) {
    console.error('Error in moveCompletedAssetsToReady:', err);
    return { success: false, count: 0, error: err.message };
  }
}
