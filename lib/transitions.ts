// Slide transition types and their CSS class mappings
export type TransitionType = 'fade' | 'cut' | 'slide-up' | 'slide-down' | 'zoom'

export interface TransitionConfig {
  type:       TransitionType
  durationMs: number
}

export const DEFAULT_TRANSITION: TransitionConfig = {
  type:       'fade',
  durationMs: 400,
}

// CSS animation classes for each transition type
export const TRANSITION_CLASSES: Record<TransitionType, { enter: string; exit: string }> = {
  fade: {
    enter: 'animate-fadeIn',
    exit:  'animate-fadeOut',
  },
  cut: {
    enter: '',   // instant, no animation
    exit:  '',
  },
  'slide-up': {
    enter: 'animate-slideUpIn',
    exit:  'animate-slideDownOut',
  },
  'slide-down': {
    enter: 'animate-slideDownIn',
    exit:  'animate-slideUpOut',
  },
  zoom: {
    enter: 'animate-zoomIn',
    exit:  'animate-zoomOut',
  },
}

export const TRANSITION_OPTIONS: { value: TransitionType; label: string; description: string }[] = [
  { value: 'fade',       label: 'Fade',        description: 'Smooth crossfade between slides' },
  { value: 'cut',        label: 'Cut',         description: 'Instant switch, no animation' },
  { value: 'slide-up',   label: 'Slide Up',    description: 'New slide rises from bottom' },
  { value: 'slide-down', label: 'Slide Down',  description: 'New slide falls from top' },
  { value: 'zoom',       label: 'Zoom',        description: 'Gentle scale-in effect' },
]
