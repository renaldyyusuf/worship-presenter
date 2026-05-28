// ─────────────────────────────────────────────
// Presentation domain types
// ─────────────────────────────────────────────

export type SlideType = 'lyrics' | 'bible' | 'image' | 'video' | 'announcement' | 'blank'

export type ScreenMode = 'normal' | 'black' | 'clear' | 'logo'

export type TextAlign = 'left' | 'center' | 'right'
export type TextPosition = 'top' | 'middle' | 'bottom'

export interface TextShadow {
  x: number
  y: number
  blur: number
  color: string
  enabled: boolean
}

export interface TextStroke {
  width: number
  color: string
  enabled: boolean
}

export interface SlideTheme {
  fontFamily: string
  fontSize: number
  fontWeight: number
  textAlign: TextAlign
  textPosition: TextPosition
  textColor: string
  textShadow: TextShadow
  textStroke: TextStroke
  backgroundOpacity: number
  lineHeight: number
  letterSpacing: number
}

export interface SlideBackground {
  type: 'color' | 'image' | 'video' | 'none'
  value: string       // hex color, image URL, or video URL
  opacity: number     // 0–1
  mediaId?: string    // reference to media library
}

export interface Slide {
  id: string
  type: SlideType
  content: string     // main display text
  subContent?: string // e.g. verse reference, section label
  sectionLabel?: string
  theme?: Partial<SlideTheme>
  background?: SlideBackground
  notes?: string
  durationMs?: number // for auto-advance
}

export interface PresentationState {
  slideQueue: Slide[]
  currentIndex: number
  mode: ScreenMode
  background: SlideBackground
  theme: SlideTheme
  logoUrl?: string
}

export const DEFAULT_THEME: SlideTheme = {
  fontFamily: 'Inter',
  fontSize: 52,
  fontWeight: 600,
  textAlign: 'center',
  textPosition: 'middle',
  textColor: '#ffffff',
  textShadow: { x: 2, y: 2, blur: 8, color: 'rgba(0,0,0,0.8)', enabled: true },
  textStroke: { width: 0, color: '#000000', enabled: false },
  backgroundOpacity: 0.5,
  lineHeight: 1.4,
  letterSpacing: 0,
}

export const DEFAULT_BACKGROUND: SlideBackground = {
  type: 'color',
  value: '#000000',
  opacity: 1,
}
