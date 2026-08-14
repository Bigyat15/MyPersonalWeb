/**
 * ────────────────────────────────────────────────────────────────
 * TIMELINE — connecting the personal journey with professional
 * development. Years are real and provided; nothing is invented.
 * ────────────────────────────────────────────────────────────────
 */

export type TimelineSphere = 'education' | 'work' | 'life'

export interface TimelineEntry {
  year: string
  title: string
  sphere: TimelineSphere
  note?: string
}

export const timeline: TimelineEntry[] = [
  {
    year: '2023',
    title: 'BSc IT begins',
    sphere: 'education',
    note: 'The academic foundation of the journey.',
  },
  {
    year: '2024',
    title: 'Faith Clothing — freelance project',
    sphere: 'work',
    note: 'First freelance build, in Pokhara.',
  },
  {
    year: '2025',
    title: 'Prabin Sigdel — Learning Management System',
    sphere: 'work',
    note: 'A real client project, shipped end-to-end.',
  },
  {
    year: '2025',
    title: 'Technimus — Software Developer Internship',
    sphere: 'work',
    note: 'First professional software role.',
  },
  {
    year: '2026',
    title: 'Current projects',
    sphere: 'work',
    note: 'SunPasal and the multi-vendor marketplace — still being built.',
  },
  {
    year: '2026',
    title: 'Australia journey',
    sphere: 'life',
    note: 'The next country on the map.',
  },
]

export const SPHERE_LABELS: Record<TimelineSphere, string> = {
  education: 'Education',
  work: 'Work',
  life: 'Journey',
}
