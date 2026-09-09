import { supabase } from '@/lib/supabaseClient'

export async function uploadMedia(file: File, folder: string): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured.')

  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `${folder}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true })
  if (error) throw error

  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return data.publicUrl
}
