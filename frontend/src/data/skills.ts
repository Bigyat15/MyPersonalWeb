/**
 * ────────────────────────────────────────────────────────────────
 * SKILLS — the technology ecosystem.
 *
 * Skills are grouped conceptually (frontend / backend / database /
 * design / workflow). The constellation renders each group as a
 * cluster; selecting a node reveals the real projects that used it,
 * derived from each project's `stack` in data/projects.ts.
 *
 * `SKILL_LABELS` is the canonical id → display name map. Groups use
 * canonical ids. Project stacks reference the same ids.
 * ────────────────────────────────────────────────────────────────
 */

export interface SkillGroup {
  id: string
  label: string
  skills: string[]
}

export const SKILL_LABELS: Record<string, string> = {
  react: 'React',
  'react-native': 'React Native',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  html: 'HTML',
  css: 'CSS',
  tailwind: 'Tailwind CSS',
  python: 'Python',
  django: 'Django',
  drf: 'Django REST Framework',
  nodejs: 'Node.js',
  express: 'Express.js',
  mongodb: 'MongoDB',
  sqlite: 'SQLite',
  firebase: 'Firebase',
  figma: 'Figma',
  ux: 'UI/UX',
  wireframe: 'Wireframing',
  prototype: 'Prototyping',
  git: 'Git',
  github: 'GitHub',
  testing: 'Testing',
  debugging: 'Debugging',
  // Tools that appear on projects but aren't standalone skill groups
  khalti: 'Khalti API',
  esewa: 'eSewa API',
  huggingface: 'Hugging Face',
  deepseek: 'DeepSeek R1',
  stability: 'Stability AI',
  '3d': '3D Design',
}

export const SKILL_GROUPS: SkillGroup[] = [
  { id: 'frontend', label: 'Frontend', skills: ['react', 'react-native', 'javascript', 'typescript', 'html', 'css', 'tailwind'] },
  { id: 'backend', label: 'Backend', skills: ['python', 'django', 'drf', 'nodejs', 'express'] },
  { id: 'database', label: 'Database', skills: ['mongodb', 'sqlite', 'firebase'] },
  { id: 'design', label: 'Design', skills: ['figma', 'ux', 'wireframe', 'prototype'] },
  { id: 'workflow', label: 'Workflow', skills: ['git', 'github', 'testing', 'debugging'] },
]

export const skillLabel = (id: string): string => SKILL_LABELS[id] ?? id
