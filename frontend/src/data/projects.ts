/**
 * ────────────────────────────────────────────────────────────────
 * PROJECTS — an editorial index of work built along the way.
 *
 * `stack` holds canonical technology ids (see data/skills.ts) so the
 * skills constellation can derive "used in" relationships from here —
 * a single source of truth. Only information provided is included;
 * links render only when they exist.
 * ────────────────────────────────────────────────────────────────
 */

export type ProjectStatusKind = 'complete' | 'current'

export interface ProjectLink {
  label: string
  href: string
}

export interface Project {
  id: string
  number: string
  title: string
  status: string
  statusKind: ProjectStatusKind
  /** Large editorial emphasis in the gallery. */
  featured?: boolean
  story: string
  features: string[]
  stack: string[]
  role?: string
  links?: ProjectLink[]
}

export const projects: Project[] = [
  {
    id: 'food-recipe-nepal',
    number: '01',
    title: 'Food Recipe Nepal',
    status: 'Deployed',
    statusKind: 'complete',
    story:
      'A full-stack recipe recommendation platform that suggests recipes from the ingredients you already have — helping reduce food waste.',
    features: [
      'REST API built with Django REST Framework.',
      'Ingredient-based recipe search.',
      'Recipe recommendations.',
      'Optimized database queries.',
      'Responsive React frontend.',
      'Deployed API.',
    ],
    stack: ['drf', 'react', 'tailwind', 'sqlite', 'python'],
    role: 'Full-stack developer',
  },
  {
    id: 'faith-clothing',
    number: '02',
    title: 'Faith Clothing',
    status: 'Complete',
    statusKind: 'complete',
    featured: true,
    story:
      'A custom e-commerce platform for a clothing brand, with 3D product previews — the project that sparked my love for immersive 3D web experiences.',
    features: [
      'Full e-commerce platform.',
      'Shopping cart.',
      'Payment integration via eSewa.',
      '3D product previews.',
      'Responsive UI.',
    ],
    stack: ['django', 'python', 'tailwind', 'javascript', 'esewa', '3d'],
    role: 'Full-stack developer',
  },
  {
    id: 'social-network',
    number: '03',
    title: 'Social Networking Platform',
    status: 'Complete',
    statusKind: 'complete',
    story: 'A social networking platform with posts, likes, comments and granular privacy controls.',
    features: ['Posts', 'Likes', 'Comments', 'Privacy controls', 'Member-only content', 'Dark/light mode'],
    stack: ['django', 'python', 'javascript', 'tailwind'],
    role: 'Full-stack developer',
  },
  {
    id: 'music-player',
    number: '04',
    title: 'Music Player',
    status: 'Complete',
    statusKind: 'complete',
    story: 'A clean music player with track browsing and responsive playback controls.',
    features: ['Track browsing', 'Play / pause', 'Responsive interface'],
    stack: ['django', 'python', 'javascript', 'tailwind'],
    role: 'Full-stack developer',
  },
  {
    id: 'portfolio',
    number: '05',
    title: 'Personal Portfolio',
    status: 'Complete',
    statusKind: 'complete',
    story: 'A personal portfolio site with direct email delivery from the contact form.',
    features: ['Portfolio presentation', 'Contact form', 'Direct email delivery'],
    stack: ['django', 'python', 'tailwind', 'javascript'],
    role: 'Full-stack developer',
  },
  {
    id: 'lms',
    number: '06',
    title: 'Learning Management System',
    status: 'Complete',
    statusKind: 'complete',
    story: 'A full learning management system handling enrollment, payments and the work of teaching at scale.',
    features: [
      'Course enrollment',
      'Payments',
      'Installments',
      'Tutor management',
      'Assignments',
      'Resources',
      'Student progress',
    ],
    stack: ['django', 'python', 'khalti', 'tailwind', 'javascript'],
    role: 'Full-stack developer',
  },
  {
    id: 'business-saas',
    number: '07',
    title: 'Business Management SaaS',
    status: 'Complete',
    statusKind: 'complete',
    story: 'A business management SaaS with role-based access, analytics and billing for growing operations.',
    features: ['User roles', 'Analytics', 'Dashboards', 'Billing', 'Business management'],
    stack: ['django', 'python', 'react', 'tailwind'],
    role: 'Full-stack developer',
  },
  {
    id: 'movie-booking',
    number: '08',
    title: 'Movie Booking System',
    status: 'Complete',
    statusKind: 'complete',
    story: 'A movie booking system with schedules, reservations and availability management.',
    features: ['Schedule browsing', 'Ticket reservations', 'Availability management', 'Responsive UI'],
    stack: ['django', 'python', 'javascript', 'tailwind'],
    role: 'Full-stack developer',
  },
  {
    id: 'ai-blog',
    number: '09',
    title: 'AI-Powered Blog Platform',
    status: 'Complete',
    statusKind: 'complete',
    story: 'A blog platform with AI-assisted content creation, intelligent tagging and SEO — one project among many in my history.',
    features: [
      'AI content creation',
      'Intelligent tagging',
      'SEO optimization',
      'AI image generation',
      'Accessible UI',
    ],
    stack: ['django', 'python', 'react', 'tailwind', 'javascript', 'huggingface', 'deepseek', 'stability'],
    role: 'Full-stack developer',
  },
  {
    id: 'sunpasal',
    number: '10',
    title: 'SunPasal',
    status: 'In Progress · Current Build',
    statusKind: 'current',
    featured: true,
    story:
      'A full-stack gold shop management SaaS — inventory, weight tracking, VAT billing and analytics. An actively evolving build.',
    features: [
      'Inventory',
      'Weight tracking',
      'Pricing',
      'Damaged goods tracking',
      'Customer management',
      'Purchase history',
      'PAN tracking',
      'VAT billing',
      'Payment tracking',
      'Credit sales',
      'Fiscal-year numbering',
      'Analytics',
      'Sales trends',
      'Low-stock alerts',
      'Customer insights',
      'Reports',
      'Excel/CSV export',
      'Multi-store support',
      'Gregorian/Nepali dates',
      'English/Nepali language',
      'Authentication',
      'Role-based access',
      'Dark/light UI',
    ],
    stack: ['react', 'typescript', 'nodejs', 'express', 'mongodb', 'tailwind'],
    role: 'Full-stack developer',
  },
  {
    id: 'marketplace',
    number: '11',
    title: 'Multi-Vendor Marketplace',
    status: 'In Progress',
    statusKind: 'current',
    featured: true,
    story: 'A multi-vendor marketplace connecting sellers and buyers — with carts, orders, payments and admin analytics.',
    features: [
      'Vendor registration',
      'Authentication',
      'Product listing',
      'Inventory tracking',
      'Order management',
      'Buyer shopping',
      'Cart',
      'Checkout',
      'Admin analytics',
      'Payment integration',
      'Responsive UI',
    ],
    stack: ['react', 'nodejs', 'express', 'mongodb', 'tailwind'],
    role: 'Full-stack developer',
  },
]
