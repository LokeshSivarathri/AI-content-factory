import { supabase } from './client';

/**
 * Uploads a file to the appropriate Supabase storage bucket under a folder named after the userId.
 * Folder structure: bucket/userId/ideaId/filename
 */
export async function uploadAsset(
  file: File,
  ideaId: string,
  type: 'image' | 'video',
  userId: string
): Promise<string> {
  const bucket = type === 'image' ? 'content-images' : 'content-videos';
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `${userId}/${ideaId}/${fileName}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error('Failed to retrieve public URL for uploaded asset.');
  }

  return publicUrlData.publicUrl;
}

/**
 * Deletes a file from Supabase storage based on its public URL.
 */
export async function deleteAsset(fileUrl: string): Promise<void> {
  try {
    const urlObj = new URL(fileUrl);
    // Path looks like: /storage/v1/object/public/content-images/userId/ideaId/fileName
    const pathParts = urlObj.pathname.split('/');
    const publicIndex = pathParts.indexOf('public');
    
    if (publicIndex === -1 || pathParts.length <= publicIndex + 2) {
      throw new Error('Invalid storage URL format.');
    }
    
    const bucket = pathParts[publicIndex + 1];
    const filePath = pathParts.slice(publicIndex + 2).join('/');

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (err: any) {
    console.error('Error in deleteAsset:', err);
    throw err;
  }
}
