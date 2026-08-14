/**
 * ────────────────────────────────────────────────────────────────
 * JOURNEY DATA MODEL
 *
 * This is the single source of truth for the cinematic journey.
 * To add a future chapter: push a new object onto `journey.chapters`
 * (or `journey.future`) and the experience adapts automatically —
 * the navigation rail, video stage, map and closing count from this
 * array. No component needs to change.
 *
 * RULES: never invent facts, dates, universities or employers.
 * Fields that are not yet real stay `undefined` / `null` and the UI
 * renders honest placeholders ("DATE TBD", "Details to follow").
 * ────────────────────────────────────────────────────────────────
 */

export type ChapterStatus = 'complete' | 'in-progress' | 'upcoming'

export interface ChapterMedia {
  /** Path to the cinematic video (lazy-loaded, see ChapterVideo). */
  video: string
  /** Optional portrait variant served to small screens (<=700px portrait). */
  videoPortrait?: string
  /** Lower-resolution landscape variant for slow connections / data saver. */
  videoLow?: string
  /** Lower-resolution portrait variant for slow connections / data saver. */
  videoPortraitLow?: string
  /** Poster image shown before / instead of the video. */
  poster: string
  /** Crop composition hint: 'landscape' | 'portrait' | 'auto'. */
  crop: 'landscape' | 'portrait' | 'auto'
}

export interface Milestone {
  label: string
  detail?: string
  year?: string
}

export interface Chapter {
  /** Stable id, e.g. 'ch-01'. */
  id: string
  /** Display index, e.g. '01'. */
  number: string
  /** Short title, e.g. 'The Beginning'. */
  title: string
  /** Uppercase editorial kicker, e.g. 'THE BEGINNING'. */
  kicker: string
  /** Where this chapter takes place, if known. */
  location?: string
  /** Real date only. Leave undefined until it is true. */
  date?: string
  /** One-line concept / meaning of the chapter. */
  concept: string
  /** Supporting line revealed under the title while the scene scrubs. */
  sub?: string
  /** Narrative lines revealed as the visitor scrolls. */
  narrative: string[]
  /** Ambient transition tone applied over the footage. */
  atmosphere: 'dawn' | 'ocean' | 'arrival' | 'study' | 'foundation'
  /** Editorial ink colour of the scene's typography. */
  tone: 'light' | 'warm' | 'cool'
  /** CSS object-position hint for the footage (framing + mobile crop). */
  focus: string
  media: ChapterMedia
  status: ChapterStatus
  milestones?: Milestone[]
}

export interface FutureChapter {
  title: string
  hint: string
  phase: string
}

export interface JourneyData {
  title: string
  chapters: Chapter[]
  future: FutureChapter[]
  currently: {
    kicker: string
    location: string
    role: string
    focus: string
    status: string
    lines: string[]
  }
  closing: string[]
}

export const journey: JourneyData = {
  title: 'MY JOURNEY',

  chapters: [
    {
      id: 'ch-01',
      number: '01',
      title: 'The Beginning',
      kicker: 'THE BEGINNING',
      location: 'Nepal',
      concept: 'Where everything started.',
      sub: 'Every journey starts somewhere.',
      narrative: [
        'It began in Nepal.',
        'A small life among vast mountains,',
        'where the horizon always felt far away.',
      ],
      atmosphere: 'dawn',
      tone: 'light',
      focus: '50% 46%',
      media: {
        video: '/videos/scene-01-wide.mp4',
        videoPortrait: '/videos/scene-01-portrait.mp4',
        videoLow: '/videos/scene-01-wide-low.mp4',
        videoPortraitLow: '/videos/scene-01-portrait-low.mp4',
        poster: '/posters/scene-01.jpg',
        crop: 'auto',
      },
      status: 'complete',
    },
    {
      id: 'ch-02',
      number: '02',
      title: 'Beyond the Horizon',
      kicker: 'BEYOND THE HORIZON',
      concept: 'Leaving the familiar world behind.',
      sub: 'Leaving the familiar behind.',
      narrative: [
        'A decision to leave the familiar behind.',
        'Distance. Uncertainty. Ambition.',
        'A journey above oceans and skies,',
        'toward a future not yet written.',
      ],
      atmosphere: 'ocean',
      tone: 'light',
      focus: '50% 50%',
      media: {
        video: '/videos/flight-takeoff-wide.mp4',
        videoPortrait: '/videos/flight-takeoff-portrait.mp4',
        videoLow: '/videos/flight-takeoff-wide-low.mp4',
        videoPortraitLow: '/videos/flight-takeoff-portrait-low.mp4',
        poster: '/posters/flight-takeoff.jpg',
        crop: 'auto',
      },
      status: 'complete',
    },
    {
      id: 'ch-03',
      number: '03',
      title: 'A New Chapter',
      kicker: 'A NEW CHAPTER',
      location: 'Australia',
      concept: 'Arrival, and the beginning of something new.',
      sub: 'A new place. A new beginning.',
      narrative: [
        'Arrival.',
        'A new coastline. A new life.',
        'The first pages of an unfamiliar chapter,',
        'already being written.',
      ],
      atmosphere: 'arrival',
      tone: 'warm',
      focus: '50% 40%',
      media: {
        video: '/videos/scene-03-wide.mp4',
        videoPortrait: '/videos/scene-03-portrait.mp4',
        videoLow: '/videos/scene-03-wide-low.mp4',
        videoPortraitLow: '/videos/scene-03-portrait-low.mp4',
        poster: '/posters/scene-03.jpg',
        crop: 'auto',
      },
      status: 'complete',
    },
    {
      id: 'ch-04',
      number: '04',
      title: 'The First Chapter',
      kicker: 'THE FIRST CHAPTER',
      location: 'Australia',
      concept: 'Education begins.',
      sub: 'Now the work begins.',
      narrative: [
        'In classrooms and corridors,',
        'study begins.',
        'Information Technology',
        'becomes the way forward.',
      ],
      atmosphere: 'study',
      tone: 'cool',
      focus: '50% 44%',
      media: {
        video: '/videos/scene-04-wide.mp4',
        videoPortrait: '/videos/scene-04-portrait.mp4',
        videoLow: '/videos/scene-04-wide-low.mp4',
        videoPortraitLow: '/videos/scene-04-portrait-low.mp4',
        poster: '/posters/scene-04.jpg',
        crop: 'auto',
      },
      status: 'complete',
    },
    {
      id: 'ch-05',
      number: '05',
      title: 'Building the Foundation',
      kicker: 'BUILDING THE FOUNDATION',
      location: 'Australia',
      concept: 'Quiet work, learning, discipline, preparation.',
      sub: 'Learning. Building. Preparing for what comes next.',
      narrative: [
        'Quiet work. Long hours. Small victories.',
        'Learning to think in code,',
        'to solve, to build, to persist.',
        'The foundation of everything ahead.',
      ],
      atmosphere: 'foundation',
      tone: 'cool',
      focus: '50% 50%',
      media: {
        video: '/videos/scene-05-wide.mp4',
        videoPortrait: '/videos/scene-05-portrait.mp4',
        videoLow: '/videos/scene-05-wide-low.mp4',
        videoPortraitLow: '/videos/scene-05-portrait-low.mp4',
        poster: '/posters/scene-05.jpg',
        crop: 'auto',
      },
      status: 'in-progress',
      milestones: [
        {
          label: 'Information Technology',
          detail: 'Foundation studies underway',
        },
      ],
    },
  ],

  future: [
    {
      title: 'Nursing Transition',
      hint: 'The decision, when the time comes.',
      phase: '06 · NURSING',
    },
    {
      title: 'Nursing Education',
      hint: 'A new kind of learning.',
      phase: '07 · NURSING',
    },
    {
      title: 'Clinical Experience',
      hint: 'The real world of care.',
      phase: '08 · NURSING',
    },
    {
      title: 'Professional Career',
      hint: 'A life\u2019s work, slowly built.',
      phase: '09 · CAREER',
    },
  ],

  currently: {
    kicker: 'CURRENTLY',
    location: 'Australia',
    role: 'Information Technology Student',
    focus: 'Information Technology',
    status: 'In Progress',
    lines: [
      'Building skills.',
      'Building projects.',
      'Preparing for the next chapter.',
    ],
  },

  closing: ['THE JOURNEY', 'IS STILL BEING WRITTEN.'],
}

/** Total number of chapters currently on the path. */
export const chapterCount = journey.chapters.length

export const chapterAt = (id: string): Chapter | undefined =>
  journey.chapters.find((c) => c.id === id)
