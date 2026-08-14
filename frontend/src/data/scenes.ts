/**
 * ────────────────────────────────────────────────────────────────
 * SCENES — per-chapter cinematic text choreography.
 *
 * Each layer is placed in the negative space of its scene and
 * animated through keys driven by the chapter's scroll progress.
 * `x` / `y` are percentages of the pinned frame; `mobileY` /
 * `mobileX` / `mobileAlign` reposition layers for the portrait
 * film-frame layout. Adjust the keys to tune the choreography
 * without touching the engine.
 * ────────────────────────────────────────────────────────────────
 */

import type { LayerKey } from '../lib/choreography'

export type LayerTag = 'number' | 'location' | 'title' | 'sub' | 'meta'
export type Align = 'start' | 'center' | 'end'

export interface SplitTitle {
  small: string
  big: string
}

export interface SceneLayer {
  id: string
  tag: LayerTag
  align: Align
  /** Horizontal placement, percent of frame width (see Align). */
  x: number
  /** Vertical placement, percent of frame height (top edge). */
  y: number
  /** Portrait/mobile placement overrides (percent of frame). */
  mobileY?: number
  mobileX?: number
  mobileAlign?: Align
  text?: string
  split?: SplitTitle
  keys: LayerKey[]
}

export interface Scene {
  layers: SceneLayer[]
}

/** Small editorial label — fades in early, drifts out late. */
const labelKeys: LayerKey[] = [
  { at: 0.04, opacity: 0, y: 14, blur: 6 },
  { at: 0.11, opacity: 1, y: 0, blur: 0 },
  { at: 0.7, opacity: 1, y: 0 },
  { at: 0.8, opacity: 0, y: -12, blur: 4, ease: 'in' },
]

const subKeys: LayerKey[] = [
  { at: 0.36, opacity: 0, y: 14, blur: 3 },
  { at: 0.43, opacity: 1, y: 0, blur: 0 },
  { at: 0.55, opacity: 1 },
  { at: 0.64, opacity: 0, y: -12, ease: 'in' },
]

const metaKeys: LayerKey[] = [
  { at: 0.5, opacity: 0 },
  { at: 0.57, opacity: 0.85 },
  { at: 0.74, opacity: 0.85 },
  { at: 0.82, opacity: 0 },
]

export const scenes: Scene[] = [
  // ── CH 01 · NEPAL — THE BEGINNING ─────────────────────────────
  {
    layers: [
      { id: 'num', tag: 'number', align: 'start', x: 7, y: 15, mobileY: 12, mobileX: 10, text: '01', keys: labelKeys },
      { id: 'loc', tag: 'location', align: 'start', x: 7, y: 21, mobileY: 17, mobileX: 10, text: 'NEPAL', keys: labelKeys },
      {
        id: 'title',
        tag: 'title',
        align: 'start',
        x: 7,
        y: 28,
        mobileY: 22,
        mobileX: 10,
        split: { small: 'THE', big: 'BEGINNING' },
        keys: [
          { at: 0.13, opacity: 0, clip: 0, y: 26, blur: 8, ls: 0.05, ease: 'out' },
          { at: 0.2, opacity: 1, clip: 1, y: 0, blur: 0, ls: 0.02 },
          { at: 0.47, opacity: 1, clip: 1, y: 0, ls: 0.02 },
          { at: 0.6, opacity: 1, y: -10, ls: 0.03 },
          { at: 0.7, opacity: 1, y: -24, ls: 0.04 },
          { at: 0.84, opacity: 0, y: -72, blur: 6, ease: 'in' },
        ],
      },
      { id: 'sub', tag: 'sub', align: 'start', x: 7, y: 46, mobileY: 34, mobileX: 10, text: 'Every journey starts somewhere.', keys: subKeys },
      { id: 'meta', tag: 'meta', align: 'end', x: 7, y: 82, mobileY: 88, text: 'DAWN · THE HIMALAYAS', keys: metaKeys },
    ],
  },

  // ── CH 02 · OCEAN — BEYOND THE HORIZON ────────────────────────
  {
    layers: [
      { id: 'num', tag: 'number', align: 'start', x: 7, y: 15, mobileY: 12, mobileX: 10, text: '02', keys: labelKeys },
      {
        id: 'title',
        tag: 'title',
        align: 'center',
        x: 50,
        y: 24,
        mobileY: 22,
        mobileX: 50,
        split: { small: 'BEYOND THE', big: 'HORIZON' },
        keys: [
          { at: 0.18, opacity: 0, clip: 0, y: 24, blur: 6, ls: 0.06, ease: 'out' },
          { at: 0.29, opacity: 1, clip: 1, y: 0, blur: 0, ls: 0.03 },
          { at: 0.56, opacity: 1, ls: 0.03 },
          { at: 0.68, opacity: 1, y: -14 },
          { at: 0.82, opacity: 0, y: -84, blur: 5, ease: 'in' },
        ],
      },
      {
        id: 'sub',
        tag: 'sub',
        align: 'center',
        x: 50,
        y: 42,
        mobileY: 34,
        mobileX: 50,
        text: 'Leaving the familiar behind.',
        keys: [
          { at: 0.44, opacity: 0, y: 14, blur: 3 },
          { at: 0.51, opacity: 1, y: 0, blur: 0 },
          { at: 0.61, opacity: 1 },
          { at: 0.7, opacity: 0, y: -12, ease: 'in' },
        ],
      },
      { id: 'meta', tag: 'meta', align: 'end', x: 7, y: 82, mobileY: 88, text: 'AN OPEN OCEAN', keys: metaKeys },
    ],
  },

  // ── CH 03 · AUSTRALIA — A NEW CHAPTER ─────────────────────────
  {
    layers: [
      { id: 'num', tag: 'number', align: 'start', x: 8, y: 15, mobileY: 12, mobileX: 10, text: '03', keys: labelKeys },
      { id: 'loc', tag: 'location', align: 'start', x: 8, y: 21, mobileY: 17, mobileX: 10, text: 'AUSTRALIA', keys: labelKeys },
      {
        id: 'title',
        tag: 'title',
        align: 'start',
        x: 8,
        y: 28,
        mobileY: 22,
        mobileX: 10,
        split: { small: 'A NEW', big: 'CHAPTER' },
        keys: [
          { at: 0.2, opacity: 0, clip: 0, y: 22, blur: 6, ls: 0.05, ease: 'out' },
          { at: 0.28, opacity: 1, clip: 1, y: 0, blur: 0, ls: 0.02 },
          { at: 0.54, opacity: 1, ls: 0.02 },
          { at: 0.66, opacity: 1, y: -12 },
          { at: 0.8, opacity: 0, y: -70, blur: 4, ease: 'in' },
        ],
      },
      { id: 'sub', tag: 'sub', align: 'start', x: 8, y: 46, mobileY: 34, mobileX: 10, text: 'A new place. A new beginning.', keys: subKeys },
      { id: 'meta', tag: 'meta', align: 'end', x: 7, y: 82, mobileY: 88, text: 'ARRIVAL · SUNRISE', keys: metaKeys },
    ],
  },

  // ── CH 04 · UNIVERSITY — THE FIRST CHAPTER ────────────────────
  {
    layers: [
      { id: 'num', tag: 'number', align: 'end', x: 8, y: 15, mobileY: 12, mobileAlign: 'end', mobileX: 10, text: '04', keys: labelKeys },
      {
        id: 'title',
        tag: 'title',
        align: 'end',
        x: 8,
        y: 23,
        mobileY: 20,
        mobileAlign: 'end',
        mobileX: 10,
        split: { small: 'THE FIRST', big: 'CHAPTER' },
        keys: [
          { at: 0.16, opacity: 0, clip: 0, y: 20, blur: 4, ls: 0.05, ease: 'out' },
          { at: 0.23, opacity: 1, clip: 1, y: 0, blur: 0, ls: 0.02 },
          { at: 0.52, opacity: 1, ls: 0.02 },
          { at: 0.64, opacity: 1, y: -10 },
          { at: 0.78, opacity: 0, y: -60, blur: 3, ease: 'in' },
        ],
      },
      { id: 'loc', tag: 'location', align: 'end', x: 8, y: 47, mobileY: 30, mobileAlign: 'end', mobileX: 10, text: 'INFORMATION TECHNOLOGY', keys: labelKeys },
      { id: 'sub', tag: 'sub', align: 'end', x: 8, y: 58, mobileY: 34, mobileAlign: 'end', mobileX: 10, text: 'Now the work begins.', keys: subKeys },
      { id: 'meta', tag: 'meta', align: 'start', x: 8, y: 82, mobileY: 88, text: 'CAMPUS · STUDY', keys: metaKeys },
    ],
  },

  // ── CH 05 · IT STUDY — BUILDING THE FOUNDATION ────────────────
  {
    layers: [
      { id: 'num', tag: 'number', align: 'start', x: 8, y: 50, mobileY: 66, mobileX: 10, text: '05', keys: labelKeys },
      {
        id: 'title',
        tag: 'title',
        align: 'start',
        x: 8,
        y: 58,
        mobileY: 71,
        mobileX: 10,
        split: { small: 'BUILDING THE', big: 'FOUNDATION' },
        keys: [
          { at: 0.2, opacity: 0, clip: 0, y: 18, blur: 5, ls: 0.05, ease: 'out' },
          { at: 0.3, opacity: 1, clip: 1, y: 0, blur: 0, ls: 0.02 },
          { at: 0.58, opacity: 1, ls: 0.02 },
          { at: 0.68, opacity: 1, y: -8 },
          { at: 0.84, opacity: 0, y: -54, blur: 3, ease: 'in' },
        ],
      },
      {
        id: 'sub',
        tag: 'sub',
        align: 'start',
        x: 8,
        y: 76,
        mobileY: 83,
        mobileX: 10,
        text: 'Learning. Building. Preparing for what comes next.',
        keys: [
          { at: 0.42, opacity: 0, y: 14, blur: 3 },
          { at: 0.49, opacity: 1, y: 0, blur: 0 },
          { at: 0.62, opacity: 1 },
          { at: 0.72, opacity: 0, y: -12, ease: 'in' },
        ],
      },
      { id: 'meta', tag: 'meta', align: 'end', x: 7, y: 84, mobileY: 88, text: 'THE FOUNDATION · LONG HOURS', keys: metaKeys },
    ],
  },
]
