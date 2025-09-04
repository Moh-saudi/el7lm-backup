import { supabase } from './config';
import { STORAGE_BUCKETS } from './config';

export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: { cacheControl?: string; upsert?: boolean }
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, options);

  if (error) throw error;
  return data;
}

export async function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  return data;
}

export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
}

export async function listFiles(bucket: string, path: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path);

  if (error) throw error;
  return data;
} 
