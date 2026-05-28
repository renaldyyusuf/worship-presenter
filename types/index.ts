// ─────────────────────────────────────────────
// Service flow types
// ─────────────────────────────────────────────

import type { Slide } from './presentation'

export type ServiceItemType = 'song' | 'bible' | 'video' | 'image' | 'announcement' | 'blank'

export interface ServiceItem {
  id: string
  planId: string
  type: ServiceItemType
  refId?: string          // song id, media id, etc.
  title: string
  subtitle?: string       // artist, reference, etc.
  notes?: string
  sortOrder: number
  durationMin?: number
  slides?: Slide[]        // resolved slides when item is loaded
  thumbnailUrl?: string
}

export interface ServicePlan {
  id: string
  title: string
  serviceDate: string     // ISO date string
  notes?: string
  items: ServiceItem[]
  createdAt: string
  updatedAt: string
}

export interface ServiceItemFormValues {
  type: ServiceItemType
  refId?: string
  title: string
  notes?: string
  durationMin?: number
}

// ─────────────────────────────────────────────
// Media types
// ─────────────────────────────────────────────

export type MediaType = 'image' | 'video' | 'loop' | 'audio'

export interface MediaItem {
  id: string
  name: string
  type: MediaType
  storagePath: string
  cdnUrl: string
  mimeType: string
  sizeBytes: number
  tags: string[]
  thumbnailUrl?: string
  width?: number
  height?: number
  durationSec?: number    // for video/audio
  createdAt: string
}

export interface MediaUploadOptions {
  name: string
  tags?: string[]
  type?: MediaType
}

// ─────────────────────────────────────────────
// Theme types
// ─────────────────────────────────────────────

export interface Theme {
  id: string
  name: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  textAlign: 'left' | 'center' | 'right'
  textPosition: 'top' | 'middle' | 'bottom'
  textColor: string
  textShadow: {
    enabled: boolean
    x: number
    y: number
    blur: number
    color: string
  }
  textStroke: {
    enabled: boolean
    width: number
    color: string
  }
  backgroundOpacity: number
  lineHeight: number
  letterSpacing: number
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface ThemeFormValues {
  name: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  textAlign: 'left' | 'center' | 'right'
  textPosition: 'top' | 'middle' | 'bottom'
  textColor: string
  textShadow: Theme['textShadow']
  textStroke: Theme['textStroke']
  backgroundOpacity: number
  lineHeight: number
  letterSpacing: number
}

// ─────────────────────────────────────────────
// Socket.io event types
// ─────────────────────────────────────────────

import type { ScreenMode, SlideBackground, SlideTheme } from './presentation'

// Events emitted BY the operator (server → clients)
export interface ServerToClientEvents {
  // Presentation output events
  'output:slide': (payload: OutputSlidePayload) => void
  'output:mode': (payload: OutputModePayload) => void
  'output:background': (payload: OutputBackgroundPayload) => void
  'output:theme': (payload: OutputThemePayload) => void
  'output:transition': (payload: { type: string; durationMs: number }) => void

  // Stage display events
  'stage:update': (payload: StageUpdatePayload) => void
  'stage:message': (payload: StageMessagePayload) => void
  'stage:timer': (payload: StageTimerPayload) => void

  // Service flow events
  'service:sync': (payload: ServiceSyncPayload) => void
  'service:item-change': (payload: ServiceItemChangePayload) => void
}

// Events emitted BY display screens (client → server)
export interface ClientToServerEvents {
  'client:ready': (role: 'output' | 'stage' | 'operator') => void
  'client:ping': () => void
}

// ── Payload types ────────────────────────────

export interface OutputSlidePayload {
  currentIndex: number
  currentSlide: Slide | null
  nextSlide: Slide | null
  totalSlides: number
  queueId: string         // changes when a new song/bible is loaded
}

export interface OutputModePayload {
  mode: ScreenMode
}

export interface OutputBackgroundPayload {
  background: SlideBackground
}

export interface OutputThemePayload {
  theme: SlideTheme
}

export interface StageUpdatePayload {
  currentSlide: Slide | null
  nextSlide: Slide | null
  currentIndex: number
  totalSlides: number
  mode: ScreenMode
}

export interface StageMessagePayload {
  message: string
  visible: boolean
}

export interface StageTimerPayload {
  endsAt: number | null   // Unix timestamp ms, null = stopped
  running: boolean
  label?: string
}

export interface ServiceSyncPayload {
  planId: string
  items: ServiceItem[]
  activeItemIndex: number
}

export interface ServiceItemChangePayload {
  activeItemIndex: number
  planId: string
}
