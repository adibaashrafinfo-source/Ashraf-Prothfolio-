// Tweakable constants for the sticky card-stack scroll experience.

/** Scroll distance (in viewport heights) each card "owns" before the next one covers it. */
export const CARD_SCROLL_HEIGHT = '100vh'

/** Sticky offset for the first card — clears the fixed navbar. */
export const BASE_TOP = 96

/** Extra sticky-top offset added per card index, so earlier cards peek above later ones. */
export const PEEK_OFFSET = 24

/** Same idea as PEEK_OFFSET, but tighter for small screens. */
export const PEEK_OFFSET_MOBILE = 12

/** Stop increasing the peek stagger after this many cards. */
export const MAX_PEEK_STEPS = 5

/** Per-card scale lost once fully covered (desktop). */
export const SCALE_STEP = 0.04

/** Floor for how small a covered card can shrink (desktop). */
export const MIN_SCALE = 0.85

/** Per-card scale lost once fully covered (mobile — spec calls for a much smaller drop). */
export const SCALE_STEP_MOBILE = 0.0125

/** Floor for how small a covered card can shrink (mobile). */
export const MIN_SCALE_MOBILE = 0.95

/** 3D backward lean applied to a fully-covered card (desktop only). */
export const MAX_ROTATE_X = 6

/** Dimming applied to a fully-covered card via brightness filter. */
export const MIN_BRIGHTNESS = 0.85

/** Text-column opacity once a card is fully covered. */
export const MIN_CONTENT_OPACITY = 0.6

export const SPRING_CONFIG = { stiffness: 120, damping: 24, mass: 0.4 }
