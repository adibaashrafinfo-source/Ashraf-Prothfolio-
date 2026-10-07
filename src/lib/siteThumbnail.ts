import type { Project } from '@/types'

/**
 * Screenshot-as-a-service endpoint. It renders the live site and returns the
 * above-the-fold view (the site's own hero) as an image, so adding a project
 * URL is enough to get a thumbnail — no manual upload needed.
 */
function screenshotUrl(siteUrl: string) {
  const normalized = /^https?:\/\//i.test(siteUrl) ? siteUrl : `https://${siteUrl}`
  return `https://image.thum.io/get/width/1200/crop/750/noanimate/${normalized}`
}

/** An explicitly uploaded image always wins; otherwise fall back to the live-site shot. */
export function projectThumbnail(project: Pick<Project, 'image_url' | 'project_url'>) {
  if (project.image_url) return project.image_url
  if (project.project_url) return screenshotUrl(project.project_url)
  return ''
}

export { screenshotUrl }
