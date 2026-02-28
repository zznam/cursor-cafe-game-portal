import { createClient } from './supabase/client'

export async function uploadAsset(
  bucket: 'game-assets' | 'avatars',
  path: string,
  file: File
) {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
    })

  if (error) {
    throw error
  }

  return data
}

export function getPublicUrl(bucket: 'game-assets' | 'avatars', path: string) {
  const supabase = createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}

export async function removeAsset(bucket: 'game-assets' | 'avatars', path: string) {
  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    throw error
  }
}
