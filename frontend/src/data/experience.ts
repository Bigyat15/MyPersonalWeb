/**
 * ────────────────────────────────────────────────────────────────
 * EXPERIENCE — the professional journey, presented as chapters.
 *
 * Three real engagements only. Nothing invented. Each entry opens
 * progressively: role/company/time → what I did → what I learned →
 * technologies. `featured` marks the entry that gets visual emphasis.
 * ────────────────────────────────────────────────────────────────
 */

export interface Experience {
  id: string
  number: string
  /** Editorial kicker shown above the role, e.g. 'First Professional Chapter'. */
  kicker: string
  role: string
  company: string
  location: string
  period: string
  summary: string
  did: string[]
  learned?: string[]
  /** Canonical technology ids — see data/skills.ts. */
  stack: string[]
  featured?: boolean
}

export const experience: Experience[] = [
  {
    id: 'technimus',
    number: '01',
    kicker: 'First Professional Chapter',
    role: 'Software Developer Intern',
    company: 'Technimus',
    location: 'Remote',
    period: 'July 2025 — October 2025',
    summary:
      'My first professional software role — building responsive interfaces, learning the full stack, and shipping real software with a team.',
    did: [
      'Designed and developed modern responsive frontend applications using React, Tailwind CSS and Figma.',
      'Worked on UI/UX design, including wireframes and prototypes.',
      'Improved user flows and usability across the product.',
      'Collaborated with team members on testing and debugging.',
      'Used Git and GitHub for version control.',
      'Independently learned Node.js, Express.js and MongoDB.',
      'Expanded my full-stack development capabilities.',
    ],
    learned: [
      'Node.js, Express.js and MongoDB, learned independently on the job.',
      'How to ship maintainable code inside a real team.',
      'Full-stack thinking — from interface to database.',
    ],
    stack: ['react', 'tailwind', 'figma', 'git', 'github', 'nodejs', 'express', 'mongodb', 'javascript'],
  },
  {
    id: 'prabin-lms',
    number: '02',
    kicker: 'Client Project — Learning Management System',
    role: 'Freelance Web Developer',
    company: 'Prabin Sigdel',
    location: 'Remote',
    period: 'April 2025 — May 2025',
    summary:
      'A complete Learning Management System, built end-to-end for a client — from course enrollment through to payments.',
    did: [
      'Course enrollment for students.',
      'Full and installment payment options.',
      'Khalti payment integration.',
      'Student and tutor role system.',
      'Course management.',
      'Resource uploads.',
      'Assignments.',
      'Dynamic content delivery.',
    ],
    stack: ['django', 'python', 'javascript', 'tailwind', 'khalti'],
  },
  {
    id: 'faith-clothing',
    number: '03',
    kicker: 'E-commerce · 3D Product Preview',
    role: 'Freelance Web Developer',
    company: 'Faith Clothing Brand',
    location: 'Pokhara',
    period: 'July 2024 — November 2024',
    summary:
      'A custom e-commerce platform with 3D product previews — the project where my interest in immersive 3D web experiences began.',
    featured: true,
    did: [
      'Custom e-commerce platform.',
      'Product catalog.',
      'Shopping cart.',
      'Payment gateway.',
      '3D product preview.',
      'Responsive experience.',
    ],
    stack: ['django', 'python', 'tailwind', 'javascript', 'esewa', '3d'],
  },
]
