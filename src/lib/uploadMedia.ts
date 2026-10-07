import { apiUpload } from '@/lib/apiClient'

export async function uploadMedia(file: File, folder: string): Promise<string> {
  return apiUpload(file, folder)
}
