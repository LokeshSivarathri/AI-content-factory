export interface Idea {
  id: string;
  user_id?: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
}

export interface Prompt {
  id?: string;
  idea_id: string;
  user_id?: string;
  image_prompt: string;
  video_prompt: string;
  description_prompt: string;
  created_at?: string;
}

export interface Asset {
  id: string;
  idea_id: string;
  user_id?: string;
  asset_type: 'image' | 'video';
  file_url: string;
  created_at: string;
  ideas?: {
    title: string;
    category: string;
  };
}

export interface WorkflowLog {
  timestamp: string;
  workflow: string;
  status: 'success' | 'failed' | 'info';
  message: string;
  details?: any;
}
